// ============================================
// CHUNK MANAGER — Sprint 5 (LOD + Frustum Culling)
// ============================================
import * as THREE from 'three';
import type { IWorldQuery, RaycastHit, BlockType, Vec3 } from '../types';
import { Chunk, CHUNK_SIZE } from './Chunk';
import { BlockRegistry } from './BlockRegistry';
import { ChunkMeshBuilder, type ChunkNeighbors, type LodLevel } from './ChunkMeshBuilder';
import { TerrainGenerator } from './TerrainGenerator';
import { ChunkCuller } from './ChunkCuller';

/**
 * LOD thresholds in chunk-distance from player:
 *  0-3  → full   (greedy mesh, shadows on)
 *  4-5  → medium (greedy mesh, shadows off)
 *  6+   → low    (heightmap plane, vertex colours)
 */
const LOD_MEDIUM = 4;
const LOD_LOW    = 6;

interface ChunkLodEntry {
    chunk: Chunk;
    currentLod: LodLevel;
    maxY: number;
}

/**
 * Manages dynamic loading/unloading of chunks based on player position.
 * Implements IWorldQuery for drop-in compatibility with legacy Physics,
 * BuildingSystem, EntitySystem and UISystem code.
 */
export class ChunkManager implements IWorldQuery {
    readonly waterLevel: number;
    waterPlane: THREE.Mesh | null = null;

    private chunks = new Map<string, Chunk>();
    private lodEntries = new Map<string, ChunkLodEntry>();
    private loadQueue: Array<[number, number]> = [];
    private lastPlayerChunkX = NaN;
    private lastPlayerChunkZ = NaN;

    private scene: THREE.Scene;
    private generator: TerrainGenerator;
    private registry: BlockRegistry;
    private meshBuilder: ChunkMeshBuilder;
    private culler: ChunkCuller;
    private renderDistance: number;

    // IDs cached for hot-path checks
    private waterId: number;
    private flowerRedId: number;
    private flowerYellowId: number;

    constructor(
        scene: THREE.Scene,
        generator: TerrainGenerator,
        registry: BlockRegistry,
        renderDistance = 8
    ) {
        this.scene = scene;
        this.generator = generator;
        this.registry = registry;
        this.meshBuilder = new ChunkMeshBuilder(registry);
        this.culler = new ChunkCuller();
        this.renderDistance = renderDistance;
        this.waterLevel = generator.waterLevel;

        this.waterId = registry.getId('water');
        this.flowerRedId = registry.getId('flower_red');
        this.flowerYellowId = registry.getId('flower_yellow');

        this.createWaterPlane();
    }

    // ---- IWorldQuery interface ----

    getBlock(x: number, y: number, z: number): string | null {
        const chunk = this.getChunkAt(x, z);
        if (!chunk) return null;
        const lx = this.worldToLocal(x);
        const lz = this.worldToLocal(z);
        const id = chunk.getBlock(lx, y, lz);
        if (id === 0) return null;
        return this.registry.getById(id)?.key ?? null;
    }

    setBlock(x: number, y: number, z: number, type: string): void {
        const cx = this.worldToChunk(x);
        const cz = this.worldToChunk(z);
        const chunk = this.getOrCreateChunk(cx, cz);
        const lx = this.worldToLocal(x);
        const lz = this.worldToLocal(z);
        chunk.setBlock(lx, y, lz, this.registry.getId(type));
        this.rebuildChunkMesh(chunk);
    }

    removeBlock(x: number, y: number, z: number): void {
        const chunk = this.getChunkAt(x, z);
        if (!chunk) return;
        const lx = this.worldToLocal(x);
        const lz = this.worldToLocal(z);
        chunk.setBlock(lx, y, lz, 0); // 0 = air
        this.rebuildChunkMesh(chunk);
    }

    getGroundHeight(wx: number, wz: number): number {
        const chunk = this.getChunkAt(wx, wz);
        if (chunk) {
            const lx = this.worldToLocal(wx);
            const lz = this.worldToLocal(wz);
            for (let y = 30; y >= 0; y--) {
                const id = chunk.getBlock(lx, y, lz);
                if (id !== 0 && id !== this.waterId && id !== this.flowerRedId && id !== this.flowerYellowId) {
                    return y;
                }
            }
        }
        // Fallback: use the terrain generator height function
        return this.generator.getHeight(wx, wz);
    }

    raycastBlock(origin: THREE.Vector3, direction: THREE.Vector3, maxDist = 8): RaycastHit | null {
        const dir = direction.clone().normalize();
        const pos = origin.clone();
        const step = 0.1;
        let prevX: number | null = null;
        let prevY: number | null = null;
        let prevZ: number | null = null;

        for (let d = 0; d < maxDist; d += step) {
            pos.addScaledVector(dir, step);
            const bx = Math.floor(pos.x + 0.5);
            const by = Math.floor(pos.y + 0.5);
            const bz = Math.floor(pos.z + 0.5);

            const block = this.getBlock(bx, by, bz);
            if (block && block !== 'water') {
                const place: Vec3 = (prevX === null || prevY === null || prevZ === null)
                    ? { x: bx, y: by + 1, z: bz }
                    : { x: prevX, y: prevY, z: prevZ };
                return { position: { x: bx, y: by, z: bz }, block, placePosition: place };
            }

            if (prevX !== bx || prevY !== by || prevZ !== bz) {
                if (!block || block === 'water') {
                    prevX = bx; prevY = by; prevZ = bz;
                }
            }
        }
        return null;
    }

    get blockTypes(): Record<string, BlockType> {
        return this.registry.toBlockTypes();
    }

    /** Pseudo world size for entity spawn range compatibility */
    get worldSize(): number { return 64; }

    // ---- Per-frame LOD + frustum culling ----

    /**
     * Primary per-frame call: streaming + LOD transitions + frustum culling.
     */
    updateWithCamera(playerX: number, playerZ: number, camera: THREE.Camera): void {
        this.culler.update(camera);
        this.update(playerX, playerZ);
        this.applyLodAndCulling(playerX, playerZ);
    }

    // ---- Streaming ----

    /** Called every frame; loads/unloads chunks around the player. */
    update(playerX: number, playerZ: number): void {
        const pcx = this.worldToChunk(playerX);
        const pcz = this.worldToChunk(playerZ);

        if (pcx === this.lastPlayerChunkX && pcz === this.lastPlayerChunkZ) {
            this.processQueue(2);
            return;
        }

        this.lastPlayerChunkX = pcx;
        this.lastPlayerChunkZ = pcz;

        // Unload chunks that are too far away
        const unloadDist = this.renderDistance + 2;
        for (const chunk of this.chunks.values()) {
            const dx = Math.abs(chunk.chunkX - pcx);
            const dz = Math.abs(chunk.chunkZ - pcz);
            if (dx > unloadDist || dz > unloadDist) {
                this.unloadChunk(chunk.chunkX, chunk.chunkZ);
            }
        }

        // Enqueue missing chunks sorted by distance from player (closest first)
        const needed: Array<[number, number, number]> = [];
        for (let dx = -this.renderDistance; dx <= this.renderDistance; dx++) {
            for (let dz = -this.renderDistance; dz <= this.renderDistance; dz++) {
                const cx = pcx + dx, cz = pcz + dz;
                if (!this.chunks.has(this.chunkKey(cx, cz))) {
                    needed.push([cx, cz, dx * dx + dz * dz]);
                }
            }
        }
        needed.sort((a, b) => a[2] - b[2]);
        this.loadQueue = needed.map(([cx, cz]) => [cx, cz]);

        this.processQueue(2);
    }

    /**
     * Synchronously generates all chunks in spawn radius.
     * Used during the initial loading screen.
     */
    generateInitial(
        radius: number,
        onProgress?: (loaded: number, total: number) => void
    ): void {
        const cells: Array<[number, number]> = [];
        for (let dx = -radius; dx <= radius; dx++) {
            for (let dz = -radius; dz <= radius; dz++) {
                cells.push([dx, dz]);
            }
        }
        for (let i = 0; i < cells.length; i++) {
            const [cx, cz] = cells[i];
            this.loadChunk(cx, cz);
            onProgress?.(i + 1, cells.length);
        }
    }

    dispose(): void {
        for (const chunk of [...this.chunks.values()]) {
            this.unloadChunk(chunk.chunkX, chunk.chunkZ);
        }
        if (this.waterPlane) {
            this.scene.remove(this.waterPlane);
            this.waterPlane.geometry.dispose();
            (this.waterPlane.material as THREE.Material).dispose();
            this.waterPlane = null;
        }
    }

    // ---- Private ----

    private processQueue(count: number): void {
        for (let i = 0; i < count && this.loadQueue.length > 0; i++) {
            const item = this.loadQueue.shift();
            if (item) this.loadChunk(item[0], item[1]);
        }
    }

    private loadChunk(cx: number, cz: number): void {
        const key = this.chunkKey(cx, cz);
        if (this.chunks.has(key)) return;

        const chunk = new Chunk(cx, cz);
        this.generator.generateChunk(chunk, this.registry);
        this.chunks.set(key, chunk);

        const distChunks = Math.max(
            Math.abs(cx - this.lastPlayerChunkX),
            Math.abs(cz - this.lastPlayerChunkZ)
        );
        const lod = isNaN(distChunks) ? 'full' : this.computeLod(distChunks);
        this.buildChunkMeshLod(chunk, lod);
    }

    private unloadChunk(cx: number, cz: number): void {
        const key = this.chunkKey(cx, cz);
        const chunk = this.chunks.get(key);
        if (!chunk) return;

        if (chunk.mesh) {
            this.scene.remove(chunk.mesh);
            this.meshBuilder.dispose(chunk.mesh);
            chunk.mesh = null;
        }
        this.chunks.delete(key);
        this.lodEntries.delete(key);
    }

    private buildChunkMeshLod(chunk: Chunk, lod: LodLevel): void {
        const neighbors = this.getNeighbors(chunk.chunkX, chunk.chunkZ);
        const group = this.meshBuilder.build(chunk, neighbors, lod);

        if (chunk.mesh) {
            this.scene.remove(chunk.mesh);
            this.meshBuilder.dispose(chunk.mesh);
        }
        chunk.mesh = group;
        this.scene.add(group);
        chunk.isDirty = false;

        const maxY = this.computeChunkMaxY(chunk);
        const key = this.chunkKey(chunk.chunkX, chunk.chunkZ);
        this.lodEntries.set(key, { chunk, currentLod: lod, maxY });
    }

    private rebuildChunkMesh(chunk: Chunk): void {
        const key = this.chunkKey(chunk.chunkX, chunk.chunkZ);
        const lod = this.lodEntries.get(key)?.currentLod ?? 'full';
        this.buildChunkMeshLod(chunk, lod);
    }

    private applyLodAndCulling(playerX: number, playerZ: number): void {
        const pcx = this.worldToChunk(playerX);
        const pcz = this.worldToChunk(playerZ);

        for (const entry of this.lodEntries.values()) {
            const { chunk } = entry;
            if (!chunk.mesh) continue;

            const visible = this.culler.isChunkVisible(chunk.chunkX, chunk.chunkZ, entry.maxY);
            chunk.mesh.visible = visible;
            if (!visible) continue;

            const distChunks = Math.max(
                Math.abs(chunk.chunkX - pcx),
                Math.abs(chunk.chunkZ - pcz)
            );
            const targetLod = this.computeLod(distChunks);
            if (targetLod !== entry.currentLod) {
                entry.currentLod = targetLod;
                this.buildChunkMeshLod(chunk, targetLod);
            }
        }
    }

    private computeLod(distChunks: number): LodLevel {
        if (distChunks < LOD_MEDIUM) return 'full';
        if (distChunks < LOD_LOW) return 'medium';
        return 'low';
    }

    private computeChunkMaxY(chunk: Chunk): number {
        let maxY = 0;
        for (let lx = 0; lx < CHUNK_SIZE; lx++) {
            for (let lz = 0; lz < CHUNK_SIZE; lz++) {
                const y = chunk.getHighestBlock(lx, lz);
                if (y > maxY) maxY = y;
            }
        }
        return maxY;
    }

    private getNeighbors(cx: number, cz: number): ChunkNeighbors {
        return {
            px: this.chunks.get(this.chunkKey(cx + 1, cz)),
            nx: this.chunks.get(this.chunkKey(cx - 1, cz)),
            pz: this.chunks.get(this.chunkKey(cx, cz + 1)),
            nz: this.chunks.get(this.chunkKey(cx, cz - 1)),
        };
    }

    private getChunkAt(wx: number, wz: number): Chunk | undefined {
        const cx = this.worldToChunk(wx);
        const cz = this.worldToChunk(wz);
        return this.chunks.get(this.chunkKey(cx, cz));
    }

    private getOrCreateChunk(cx: number, cz: number): Chunk {
        const key = this.chunkKey(cx, cz);
        let chunk = this.chunks.get(key);
        if (!chunk) {
            chunk = new Chunk(cx, cz);
            this.generator.generateChunk(chunk, this.registry);
            this.chunks.set(key, chunk);
        }
        return chunk;
    }

    private chunkKey(cx: number, cz: number): string { return `${cx},${cz}`; }

    /** World coord → chunk index (handles negative world coords correctly) */
    private worldToChunk(n: number): number { return Math.floor(n / CHUNK_SIZE); }

    /** World coord → local coord within chunk [0, CHUNK_SIZE) */
    private worldToLocal(n: number): number { return ((n % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE; }

    private createWaterPlane(): void {
        const geo = new THREE.PlaneGeometry(512, 512);
        const mat = new THREE.MeshLambertMaterial({
            color: 0x29B6F6,
            transparent: true,
            opacity: 0.55,
            depthWrite: false,
            side: THREE.DoubleSide,
        });
        this.waterPlane = new THREE.Mesh(geo, mat);
        this.waterPlane.rotation.x = -Math.PI / 2;
        this.waterPlane.position.y = this.waterLevel + 0.4;
        this.waterPlane.receiveShadow = true;
        this.scene.add(this.waterPlane);
    }
}
