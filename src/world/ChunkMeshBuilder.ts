// ============================================
// CHUNK MESH BUILDER — Sprint 4
// ============================================
import * as THREE from 'three';
import { CHUNK_SIZE, CHUNK_HEIGHT, type Chunk } from './Chunk';
import type { BlockRegistry } from './BlockRegistry';

export interface ChunkNeighbors {
    px?: Chunk; // +X neighbor (chunkX + 1)
    nx?: Chunk; // -X neighbor (chunkX - 1)
    pz?: Chunk; // +Z neighbor (chunkZ + 1)
    nz?: Chunk; // -Z neighbor (chunkZ - 1)
}

// 6 face definitions: each has a direction vector and 4 corner offsets (CCW from outside)
const FACES: Array<{ dir: [number, number, number]; corners: Array<[number, number, number]> }> = [
    { dir: [ 1, 0, 0], corners: [[1,0,1],[1,1,1],[1,1,0],[1,0,0]] }, // +X
    { dir: [-1, 0, 0], corners: [[0,0,0],[0,1,0],[0,1,1],[0,0,1]] }, // -X
    { dir: [ 0, 1, 0], corners: [[0,1,1],[1,1,1],[1,1,0],[0,1,0]] }, // +Y
    { dir: [ 0,-1, 0], corners: [[0,0,0],[1,0,0],[1,0,1],[0,0,1]] }, // -Y
    { dir: [ 0, 0, 1], corners: [[0,0,1],[0,1,1],[1,1,1],[1,0,1]] }, // +Z
    { dir: [ 0, 0,-1], corners: [[1,0,0],[1,1,0],[0,1,0],[0,0,0]] }, // -Z
];

/**
 * Converts a Chunk into a THREE.Group with one Mesh per block type.
 * Implements face-culling: faces adjacent to opaque blocks are omitted,
 * reducing triangle count by ~80% for typical terrain.
 */
export class ChunkMeshBuilder {
    private registry: BlockRegistry;
    private materials = new Map<number, THREE.MeshLambertMaterial>();

    constructor(registry: BlockRegistry) {
        this.registry = registry;
    }

    build(chunk: Chunk, neighbors: ChunkNeighbors): THREE.Group {
        const group = new THREE.Group();
        const worldOffsetX = chunk.chunkX * CHUNK_SIZE;
        const worldOffsetZ = chunk.chunkZ * CHUNK_SIZE;

        // buf per blockId: positions[], indices[], vertex count
        const bufs = new Map<number, { pos: number[]; idx: number[]; vc: number }>();

        for (let ly = 0; ly < CHUNK_HEIGHT; ly++) {
            for (let lx = 0; lx < CHUNK_SIZE; lx++) {
                for (let lz = 0; lz < CHUNK_SIZE; lz++) {
                    const blockId = chunk.getBlock(lx, ly, lz);
                    if (blockId === 0) continue;

                    const def = this.registry.getById(blockId);
                    if (!def) continue;

                    const wx = worldOffsetX + lx;
                    const wz = worldOffsetZ + lz;

                    for (const face of FACES) {
                        const nx = lx + face.dir[0];
                        const ny = ly + face.dir[1];
                        const nz = lz + face.dir[2];

                        const neighborId = this.getNeighborBlock(chunk, neighbors, nx, ny, nz);

                        // Skip face if neighbor is fully opaque (face is hidden inside solid blocks)
                        if (this.registry.isOpaque(neighborId)) continue;

                        // For transparent blocks: also skip if same block type (avoid inner water faces)
                        if (def.transparent && neighborId === blockId) continue;

                        let buf = bufs.get(blockId);
                        if (!buf) {
                            buf = { pos: [], idx: [], vc: 0 };
                            bufs.set(blockId, buf);
                        }

                        for (const [cx, cy, cz] of face.corners) {
                            buf.pos.push(wx + cx, ly + cy, wz + cz);
                        }

                        const base = buf.vc;
                        buf.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
                        buf.vc += 4;
                    }
                }
            }
        }

        for (const [blockId, buf] of bufs) {
            if (buf.pos.length === 0) continue;

            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.Float32BufferAttribute(buf.pos, 3));
            geo.setIndex(buf.idx);
            geo.computeVertexNormals();

            const mat = this.getMaterial(blockId);
            const mesh = new THREE.Mesh(geo, mat);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            group.add(mesh);
        }

        return group;
    }

    dispose(group: THREE.Group): void {
        for (const child of group.children) {
            if (child instanceof THREE.Mesh) {
                child.geometry.dispose();
                // Materials are shared across chunks; do not dispose them here
            }
        }
        group.clear();
    }

    // ---- Private helpers ----

    private getNeighborBlock(
        chunk: Chunk, neighbors: ChunkNeighbors,
        lx: number, ly: number, lz: number
    ): number {
        // Out of bounds on Y → treat as air
        if (ly < 0 || ly >= CHUNK_HEIGHT) return 0;

        // Within this chunk
        if (lx >= 0 && lx < CHUNK_SIZE && lz >= 0 && lz < CHUNK_SIZE) {
            return chunk.getBlock(lx, ly, lz);
        }

        // Look into neighbor chunks at chunk boundaries
        let nc: Chunk | undefined;
        let nlx = lx, nlz = lz;

        if (lx < 0)          { nc = neighbors.nx; nlx = lx + CHUNK_SIZE; }
        else if (lx >= CHUNK_SIZE) { nc = neighbors.px; nlx = lx - CHUNK_SIZE; }
        else if (lz < 0)     { nc = neighbors.nz; nlz = lz + CHUNK_SIZE; }
        else if (lz >= CHUNK_SIZE) { nc = neighbors.pz; nlz = lz - CHUNK_SIZE; }

        // No loaded neighbor → treat as air (renders the face)
        if (!nc) return 0;
        return nc.getBlock(nlx, ly, nlz);
    }

    private getMaterial(blockId: number): THREE.MeshLambertMaterial {
        const cached = this.materials.get(blockId);
        if (cached) return cached;

        const def = this.registry.getById(blockId);
        const opts: THREE.MeshLambertMaterialParameters = {};

        if (def) {
            opts.color = def.color;
            if (def.transparent) {
                opts.transparent = true;
                opts.opacity = def.opacity ?? 0.8;
                opts.depthWrite = false;
            }
            if (def.emissive !== undefined) {
                opts.emissive = new THREE.Color(def.emissive);
                opts.emissiveIntensity = def.emissiveIntensity ?? 0.5;
            }
        } else {
            opts.color = 0xAAAAAA;
        }

        const mat = new THREE.MeshLambertMaterial(opts);
        this.materials.set(blockId, mat);
        return mat;
    }
}
