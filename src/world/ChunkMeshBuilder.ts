// ============================================
// CHUNK MESH BUILDER — Sprint 5 (greedy meshing + LOD)
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

/** LOD level determining mesh quality */
export type LodLevel = 'full' | 'medium' | 'low';

// ---- Greedy meshing face-axis descriptors ----------------------------

interface FaceAxis {
    norm: 0 | 1 | 2;  // normal axis (0=X, 1=Y, 2=Z)
    u: 0 | 1 | 2;     // first tangent axis
    v: 0 | 1 | 2;     // second tangent axis
    dir: 1 | -1;       // outward direction (+1 or -1)
}

const FACE_AXES: FaceAxis[] = [
    { norm: 0, u: 2, v: 1, dir:  1 }, // +X
    { norm: 0, u: 2, v: 1, dir: -1 }, // -X
    { norm: 1, u: 0, v: 2, dir:  1 }, // +Y
    { norm: 1, u: 0, v: 2, dir: -1 }, // -Y
    { norm: 2, u: 0, v: 1, dir:  1 }, // +Z
    { norm: 2, u: 0, v: 1, dir: -1 }, // -Z
];

// Winding order rule (CCW from the outward normal direction):
//   reversed = (dir > 0) !== (norm === 2)
//   reversed  → corner offsets (0,0),(0,wv),(wu,wv),(wu,0)
//   default   → corner offsets (0,0),(wu,0),(wu,wv),(0,wv)
// Verified analytically by cross-product for all 6 axes.

interface MeshBuf {
    pos: number[];
    norm: number[];
}

/**
 * Builds THREE.Group chunk meshes.
 * LOD levels:
 *  full   — greedy-merged quads, shadows on
 *  medium — greedy-merged quads, shadows off
 *  low    — heightmap flat plane with vertex colours
 */
export class ChunkMeshBuilder {
    private registry: BlockRegistry;
    private materials = new Map<number, THREE.MeshLambertMaterial>();

    constructor(registry: BlockRegistry) {
        this.registry = registry;
    }

    // ---- Public API ----

    build(chunk: Chunk, neighbors: ChunkNeighbors, lod: LodLevel = 'full'): THREE.Group {
        if (lod === 'low') return this.buildLow(chunk);
        return this.buildGreedy(chunk, neighbors, lod === 'full');
    }

    dispose(group: THREE.Group): void {
        for (const child of group.children) {
            if (child instanceof THREE.Mesh) {
                child.geometry.dispose();
                // Materials are registry-shared; do NOT dispose here
            }
        }
        group.clear();
    }

    // ---- Greedy meshing ----

    private buildGreedy(chunk: Chunk, neighbors: ChunkNeighbors, shadows: boolean): THREE.Group {
        const group = new THREE.Group();
        const wx0 = chunk.chunkX * CHUNK_SIZE;
        const wz0 = chunk.chunkZ * CHUNK_SIZE;

        const dims: [number, number, number] = [CHUNK_SIZE, CHUNK_HEIGHT, CHUNK_SIZE];
        const bufs = new Map<number, MeshBuf>();

        // Pre-allocated scratch buffers to avoid per-slice GC pressure
        const maxSlice = CHUNK_SIZE * CHUNK_HEIGHT; // safe over-allocation
        const mask = new Int32Array(maxSlice);
        const done = new Uint8Array(maxSlice);

        for (const axis of FACE_AXES) {
            const { norm, u, v, dir } = axis;
            const dimN = dims[norm];
            const dimU = dims[u];
            const dimV = dims[v];

            const reversed = (dir > 0) !== (norm === 2);

            // Flat face normal used for all 6 verts of each quad
            const fnx = norm === 0 ? dir : 0;
            const fny = norm === 1 ? dir : 0;
            const fnz = norm === 2 ? dir : 0;

            for (let n = 0; n < dimN; n++) {
                // --- Build visibility mask ---
                for (let ui = 0; ui < dimU; ui++) {
                    for (let vi = 0; vi < dimV; vi++) {
                        const coord: [number, number, number] = [0, 0, 0];
                        coord[norm] = n;
                        coord[u]    = ui;
                        coord[v]    = vi;

                        const nc: [number, number, number] = [coord[0], coord[1], coord[2]];
                        nc[norm] += dir;

                        const blockId    = this.getSafeBlock(chunk, neighbors, coord[0], coord[1], coord[2]);
                        const neighborId = this.getSafeBlock(chunk, neighbors, nc[0], nc[1], nc[2]);

                        let faceVal = 0;
                        if (blockId !== 0) {
                            const def   = this.registry.getById(blockId);
                            const nDef  = neighborId > 0 ? this.registry.getById(neighborId) : null;
                            const nSolid = nDef ? !nDef.transparent : false;
                            const isSame = (def?.transparent === true) && (neighborId === blockId);
                            if (!nSolid && !isSame) {
                                faceVal = dir > 0 ? blockId : -blockId;
                            }
                        }
                        mask[ui + vi * dimU] = faceVal;
                    }
                }

                // --- Greedy merge ---
                done.fill(0, 0, dimU * dimV);

                for (let vi = 0; vi < dimV; vi++) {
                    for (let ui = 0; ui < dimU; ui++) {
                        const maskVal = mask[ui + vi * dimU];
                        if (maskVal === 0 || done[ui + vi * dimU]) continue;

                        const blockId = Math.abs(maskVal);

                        // Extend in u direction
                        let wu = 1;
                        while (
                            ui + wu < dimU &&
                            mask[(ui + wu) + vi * dimU] === maskVal &&
                            !done[(ui + wu) + vi * dimU]
                        ) wu++;

                        // Extend in v direction
                        let wv = 1;
                        outer: while (vi + wv < dimV) {
                            for (let ku = 0; ku < wu; ku++) {
                                const ci = (ui + ku) + (vi + wv) * dimU;
                                if (mask[ci] !== maskVal || done[ci]) break outer;
                            }
                            wv++;
                        }

                        // Mark consumed cells
                        for (let dv = 0; dv < wv; dv++)
                            for (let du = 0; du < wu; du++)
                                done[(ui + du) + (vi + dv) * dimU] = 1;

                        // Ensure buffer exists
                        if (!bufs.has(blockId)) bufs.set(blockId, { pos: [], norm: [] });
                        const buf = bufs.get(blockId)!;

                        // Face position along normal axis
                        const faceN = dir > 0 ? n + 1 : n;

                        // 4 corners in CCW order (see winding rule above)
                        type Pair = [number, number];
                        const offsets: Pair[] = reversed
                            ? [[0, 0], [0, wv], [wu, wv], [wu, 0]]
                            : [[0, 0], [wu, 0], [wu, wv], [0, wv]];

                        const corners = offsets.map(([du, dv]): [number, number, number] => {
                            const p: [number, number, number] = [0, 0, 0];
                            p[norm] = faceN;
                            p[u]    = ui + du;
                            p[v]    = vi + dv;
                            p[0] += wx0;
                            p[2] += wz0;
                            return p;
                        });

                        const [A, B, C, D] = corners;

                        // Two CCW triangles: A-B-C and A-C-D
                        buf.pos.push(
                            A[0], A[1], A[2],
                            B[0], B[1], B[2],
                            C[0], C[1], C[2],
                            A[0], A[1], A[2],
                            C[0], C[1], C[2],
                            D[0], D[1], D[2],
                        );
                        // Flat normal for all 6 verts
                        for (let i = 0; i < 6; i++) {
                            buf.norm.push(fnx, fny, fnz);
                        }
                    }
                }
            }
        }

        for (const [blockId, buf] of bufs) {
            if (buf.pos.length === 0) continue;

            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.Float32BufferAttribute(buf.pos, 3));
            geo.setAttribute('normal',   new THREE.Float32BufferAttribute(buf.norm, 3));

            const mat  = this.getMaterial(blockId);
            const mesh = new THREE.Mesh(geo, mat);
            mesh.castShadow    = shadows;
            mesh.receiveShadow = shadows;
            group.add(mesh);
        }

        return group;
    }

    // ---- Low LOD: single flat heightmap plane per column ----

    private buildLow(chunk: Chunk): THREE.Group {
        const group = new THREE.Group();
        const wx0 = chunk.chunkX * CHUNK_SIZE;
        const wz0 = chunk.chunkZ * CHUNK_SIZE;

        const pos: number[]    = [];
        const colors: number[] = [];
        const idx: number[]    = [];
        let vc = 0;

        const _c = new THREE.Color();

        for (let lx = 0; lx < CHUNK_SIZE; lx++) {
            for (let lz = 0; lz < CHUNK_SIZE; lz++) {
                const topY    = chunk.getHighestBlock(lx, lz);
                const blockId = chunk.getBlock(lx, topY, lz);
                if (blockId === 0) continue;

                const def = this.registry.getById(blockId);
                _c.setHex(def ? def.color : 0x888888);

                const wx = wx0 + lx;
                const wz = wz0 + lz;
                const y  = topY + 1;

                pos.push(
                    wx,     y, wz,
                    wx + 1, y, wz,
                    wx + 1, y, wz + 1,
                    wx,     y, wz + 1,
                );
                colors.push(
                    _c.r, _c.g, _c.b,
                    _c.r, _c.g, _c.b,
                    _c.r, _c.g, _c.b,
                    _c.r, _c.g, _c.b,
                );
                const base = vc;
                idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
                vc += 4;
            }
        }

        if (pos.length === 0) return group;

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        geo.setAttribute('color',    new THREE.Float32BufferAttribute(colors, 3));
        geo.setIndex(idx);
        geo.computeVertexNormals();

        const mat  = new THREE.MeshLambertMaterial({ vertexColors: true });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow    = false;
        mesh.receiveShadow = false;
        group.add(mesh);

        return group;
    }

    // ---- Private helpers ----

    /**
     * Reads block ID at local chunk coordinates (lx, ly, lz).
     * Crosses into neighbor chunks when lx or lz go out of [0, CHUNK_SIZE).
     * Returns 0 (air) when ly is out of [0, CHUNK_HEIGHT).
     */
    private getSafeBlock(
        chunk: Chunk, neighbors: ChunkNeighbors,
        lx: number, ly: number, lz: number,
    ): number {
        if (ly < 0 || ly >= CHUNK_HEIGHT) return 0;

        if (lx >= 0 && lx < CHUNK_SIZE && lz >= 0 && lz < CHUNK_SIZE) {
            return chunk.getBlock(lx, ly, lz);
        }

        let nc: Chunk | undefined;
        let nlx = lx, nlz = lz;

        if      (lx < 0)           { nc = neighbors.nx; nlx = lx + CHUNK_SIZE; }
        else if (lx >= CHUNK_SIZE)  { nc = neighbors.px; nlx = lx - CHUNK_SIZE; }
        else if (lz < 0)           { nc = neighbors.nz; nlz = lz + CHUNK_SIZE; }
        else if (lz >= CHUNK_SIZE)  { nc = neighbors.pz; nlz = lz - CHUNK_SIZE; }

        if (!nc) return 0; // unloaded neighbor → render the face (air assumption)
        return nc.getBlock(nlx, ly, nlz);
    }

    private getMaterial(blockId: number): THREE.MeshLambertMaterial {
        const cached = this.materials.get(blockId);
        if (cached) return cached;

        const def  = this.registry.getById(blockId);
        const opts: THREE.MeshLambertMaterialParameters = {};

        if (def) {
            opts.color = def.color;
            if (def.transparent) {
                opts.transparent = true;
                opts.opacity     = def.opacity ?? 0.8;
                opts.depthWrite  = false;
            }
            if (def.emissive !== undefined) {
                opts.emissive          = new THREE.Color(def.emissive);
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
