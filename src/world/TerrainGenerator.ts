// ============================================
// TERRAIN GENERATOR — Sprint 4
// ============================================
import Utils from '../utils';
import { CHUNK_SIZE, CHUNK_HEIGHT, type Chunk } from './Chunk';
import type { BlockRegistry } from './BlockRegistry';

/**
 * Generates terrain for individual chunks using seed-based noise.
 * Extracted from the legacy World class for the chunk streaming system.
 */
export class TerrainGenerator {
    private seed: number;
    readonly waterLevel = 1;

    constructor(seed?: number) {
        this.seed = seed ?? Math.floor(Math.random() * 100000);
    }

    // ---- Public API ----

    generateChunk(chunk: Chunk, registry: BlockRegistry): void {
        for (let lx = 0; lx < CHUNK_SIZE; lx++) {
            for (let lz = 0; lz < CHUNK_SIZE; lz++) {
                const wx = chunk.chunkX * CHUNK_SIZE + lx;
                const wz = chunk.chunkZ * CHUNK_SIZE + lz;
                this.generateColumn(chunk, registry, lx, lz, wx, wz);
            }
        }
        this.generateTrees(chunk, registry);
        this.generateStructures(chunk, registry);
    }

    /** Get the terrain height at world coordinates (used as fallback by ChunkManager) */
    getHeight(wx: number, wz: number): number {
        const sx = (wx + this.seed * 0.1) * 0.018;
        const sz = (wz + this.seed * 0.1) * 0.018;
        const n = Utils.fbm(sx, sz, 4, 2, 0.5);
        return Math.max(Math.floor(4 + (n - 0.35) * 18), 0);
    }

    // ---- Column generation ----

    private generateColumn(
        chunk: Chunk, registry: BlockRegistry,
        lx: number, lz: number, wx: number, wz: number
    ): void {
        const h = this.getHeight(wx, wz);
        const surfaceId = registry.getId(this.getSurfaceType(h));
        chunk.setBlock(lx, h, lz, surfaceId);

        const fillKey = h <= this.waterLevel + 1 ? 'sand' : 'dirt';
        const fillId = registry.getId(fillKey);
        for (let y = h - 1; y >= 0; y--) {
            chunk.setBlock(lx, y, lz, fillId);
        }

        // Sparse flowers on grass
        if (this.getSurfaceType(h) === 'grass' && this.pseudoRandom(wx, wz, 42) < 0.012) {
            const flower = this.pseudoRandom(wx, wz, 99) > 0.5 ? 'flower_red' : 'flower_yellow';
            const flowerId = registry.getId(flower);
            if (h + 1 < CHUNK_HEIGHT) chunk.setBlock(lx, h + 1, lz, flowerId);
        }
    }

    private getSurfaceType(h: number): string {
        if (h <= this.waterLevel) return 'sand';
        if (h === this.waterLevel + 1) return 'grass';
        if (h > 12) return 'snow';
        if (h > 9) return 'stone';
        return 'grass';
    }

    // ---- Tree generation ----

    private generateTrees(chunk: Chunk, registry: BlockRegistry): void {
        for (let lx = 2; lx < CHUNK_SIZE - 2; lx += 5) {
            for (let lz = 2; lz < CHUNK_SIZE - 2; lz += 5) {
                const wx = chunk.chunkX * CHUNK_SIZE + lx;
                const wz = chunk.chunkZ * CHUNK_SIZE + lz;
                const h = this.getHeight(wx, wz);
                if (h > this.waterLevel + 1 && h < 10 && this.pseudoRandom(wx, wz, 7) < 0.6) {
                    this.placeTree(chunk, registry, lx, h + 1, lz);
                }
            }
        }
    }

    private placeTree(
        chunk: Chunk, registry: BlockRegistry,
        lx: number, y: number, lz: number
    ): void {
        const woodId = registry.getId('wood');
        const leavesId = registry.getId('leaves');
        const height = 3 + Math.floor(this.pseudoRandom(lx, lz, 11) * 2);

        for (let i = 0; i < height; i++) {
            if (y + i < CHUNK_HEIGHT) chunk.setBlock(lx, y + i, lz, woodId);
        }

        const top = y + height;
        for (let dx = -2; dx <= 2; dx++) {
            for (let dz = -2; dz <= 2; dz++) {
                if (Math.abs(dx) === 2 && Math.abs(dz) === 2) continue;
                for (let dy = 0; dy <= 1; dy++) {
                    const nx = lx + dx, nz = lz + dz, ny = top + dy;
                    if (nx >= 0 && nx < CHUNK_SIZE && nz >= 0 && nz < CHUNK_SIZE && ny < CHUNK_HEIGHT) {
                        chunk.setBlock(nx, ny, nz, leavesId);
                    }
                }
            }
        }
        if (top + 2 < CHUNK_HEIGHT) chunk.setBlock(lx, top + 2, lz, leavesId);
    }

    // ---- Structures ----

    /**
     * For each known structure, place its blocks if they overlap with this chunk.
     * This naturally handles structures that span multiple chunks.
     */
    private generateStructures(chunk: Chunk, registry: BlockRegistry): void {
        this.placeSpawnPlatform(chunk, registry);
        this.placeHouse(chunk, registry, 12, 8);
        this.placeHouse(chunk, registry, -15, -10);
    }

    private placeSpawnPlatform(chunk: Chunk, registry: BlockRegistry): void {
        const planksId = registry.getId('planks');
        const neonBlueId = registry.getId('neon_blue');
        const neonPinkId = registry.getId('neon_pink');
        const minY = this.waterLevel + 2;

        for (let wx = -3; wx <= 3; wx++) {
            for (let wz = -3; wz <= 3; wz++) {
                const lx = wx - chunk.chunkX * CHUNK_SIZE;
                const lz = wz - chunk.chunkZ * CHUNK_SIZE;
                if (lx < 0 || lx >= CHUNK_SIZE || lz < 0 || lz >= CHUNK_SIZE) continue;

                const h = this.getHeight(wx, wz);
                const py = Math.max(h, minY);
                chunk.setBlock(lx, py, lz, planksId);
                for (let y = py - 1; y > h; y--) {
                    chunk.setBlock(lx, y, lz, planksId);
                }
            }
        }

        // Neon corner accents
        const corners: [number, number, number][] = [
            [-3, -3, neonBlueId], [3, -3, neonPinkId],
            [-3, 3, neonPinkId],  [3, 3, neonBlueId],
        ];
        for (const [wx, wz, blockId] of corners) {
            const lx = wx - chunk.chunkX * CHUNK_SIZE;
            const lz = wz - chunk.chunkZ * CHUNK_SIZE;
            if (lx < 0 || lx >= CHUNK_SIZE || lz < 0 || lz >= CHUNK_SIZE) continue;
            const h = Math.max(this.getHeight(wx, wz), minY);
            chunk.setBlock(lx, h + 1, lz, blockId);
        }
    }

    private placeHouse(chunk: Chunk, registry: BlockRegistry, anchorWX: number, anchorWZ: number): void {
        const brickId = registry.getId('brick');
        const planksId = registry.getId('planks');
        const roofId = registry.getId('roof');
        const W = 5, D = 5, H = 4;

        const groundH = this.getHeight(anchorWX + 2, anchorWZ + 2);
        if (groundH <= this.waterLevel) return;
        const base = groundH + 1;

        // Walls + floor
        for (let y = 0; y < H; y++) {
            for (let x = 0; x < W; x++) {
                for (let z = 0; z < D; z++) {
                    const isDoor = (x === Math.floor(W / 2) && z === 0 && y < 2);
                    const isWindow = (y === 1 && ((x === 1 && z === 0) || (x === W - 2 && z === 0)));
                    if (isDoor || isWindow) continue;
                    const isWall = (x === 0 || x === W - 1 || z === 0 || z === D - 1);
                    if (y === 0 || isWall) {
                        this.placeWorldBlock(chunk, anchorWX + x, base + y, anchorWZ + z, y === 0 ? planksId : brickId);
                    }
                }
            }
        }

        // Roof (overhangs by 1)
        for (let x = -1; x <= W; x++) {
            for (let z = -1; z <= D; z++) {
                this.placeWorldBlock(chunk, anchorWX + x, base + H, anchorWZ + z, roofId);
            }
        }
    }

    /** Place a block at a world position if it falls inside this chunk */
    private placeWorldBlock(chunk: Chunk, wx: number, wy: number, wz: number, blockId: number): void {
        const lx = wx - chunk.chunkX * CHUNK_SIZE;
        const lz = wz - chunk.chunkZ * CHUNK_SIZE;
        if (lx < 0 || lx >= CHUNK_SIZE || lz < 0 || lz >= CHUNK_SIZE) return;
        if (wy < 0 || wy >= CHUNK_HEIGHT) return;
        chunk.setBlock(lx, wy, lz, blockId);
    }

    // ---- Deterministic pseudo-random ----

    private pseudoRandom(x: number, z: number, salt: number): number {
        const n = Math.sin(x * 12.9898 + z * 78.233 + salt * 37.719 + this.seed * 0.001) * 43758.5453;
        return n - Math.floor(n);
    }
}
