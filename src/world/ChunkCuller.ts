// ============================================
// CHUNK CULLER — Sprint 5
// Frustum culling per-chunk group.
// Three.js does per-object frustum culling, but we want to cull an
// entire chunk group with a single AABB check — much cheaper.
// ============================================
import * as THREE from 'three';
import { CHUNK_SIZE } from './Chunk';

const _projScreen = new THREE.Matrix4();
const _box = new THREE.Box3();

export class ChunkCuller {
    private frustum = new THREE.Frustum();

    /** Call once per frame after camera matrices are updated */
    update(camera: THREE.Camera): void {
        camera.updateMatrixWorld();
        _projScreen.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
        this.frustum.setFromProjectionMatrix(_projScreen);
    }

    /**
     * Returns true when the chunk AABB intersects the camera frustum.
     * @param chunkX  chunk grid X index
     * @param chunkZ  chunk grid Z index
     * @param maxY    highest non-air block Y in the chunk (used for tight AABB)
     */
    isChunkVisible(chunkX: number, chunkZ: number, maxY: number): boolean {
        const minX = chunkX * CHUNK_SIZE;
        const minZ = chunkZ * CHUNK_SIZE;
        _box.min.set(minX, 0, minZ);
        _box.max.set(minX + CHUNK_SIZE, maxY + 1, minZ + CHUNK_SIZE);
        return this.frustum.intersectsBox(_box);
    }
}
