// ============================================
// CHUNK — Sprint 4
// ============================================
import type * as THREE from 'three';

export const CHUNK_SIZE = 16;
export const CHUNK_HEIGHT = 256;

/**
 * Stores 16×16×256 blocks as a flat Uint8Array.
 * Block ID 0 = air. IDs 1-255 = block types from BlockRegistry.
 * Index formula: lx + lz * CHUNK_SIZE + y * CHUNK_SIZE * CHUNK_SIZE
 */
export class Chunk {
    readonly chunkX: number;
    readonly chunkZ: number;
    readonly data: Uint8Array;
    isDirty: boolean;
    mesh: THREE.Group | null;

    constructor(chunkX: number, chunkZ: number) {
        this.chunkX = chunkX;
        this.chunkZ = chunkZ;
        this.data = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE * CHUNK_HEIGHT);
        this.isDirty = false;
        this.mesh = null;
    }

    private index(lx: number, y: number, lz: number): number {
        return lx + lz * CHUNK_SIZE + y * CHUNK_SIZE * CHUNK_SIZE;
    }

    getBlock(lx: number, y: number, lz: number): number {
        if (lx < 0 || lx >= CHUNK_SIZE || y < 0 || y >= CHUNK_HEIGHT || lz < 0 || lz >= CHUNK_SIZE) {
            return 0;
        }
        return this.data[this.index(lx, y, lz)];
    }

    setBlock(lx: number, y: number, lz: number, blockId: number): void {
        if (lx < 0 || lx >= CHUNK_SIZE || y < 0 || y >= CHUNK_HEIGHT || lz < 0 || lz >= CHUNK_SIZE) {
            return;
        }
        this.data[this.index(lx, y, lz)] = blockId;
        this.isDirty = true;
    }

    /** Returns the Y of the highest non-air block in this column, or 0 if empty */
    getHighestBlock(lx: number, lz: number): number {
        for (let y = CHUNK_HEIGHT - 1; y >= 0; y--) {
            if (this.getBlock(lx, y, lz) !== 0) return y;
        }
        return 0;
    }
}
