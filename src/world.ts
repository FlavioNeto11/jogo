// ============================================
// WORLD (Optimized with InstancedMesh)
// ============================================
import * as THREE from 'three';
import Utils from './utils';
import type { BlockType, RaycastHit, Vec3 } from './types';

export class World {
    scene: THREE.Scene;
    worldSize: number;
    waterLevel: number;
    blocks: Map<string, string>;
    dynamicMeshes: Map<string, THREE.Mesh>;
    instancedMeshes: THREE.InstancedMesh[];
    sharedGeo: THREE.BoxGeometry;
    blockTypes: Record<string, BlockType>;
    materials: Record<string, THREE.MeshLambertMaterial>;
    waterPlane: THREE.Mesh | null = null;
    seabedPlane: THREE.Mesh | null = null;
    _needsRebuild = false;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.worldSize = 64;
        this.waterLevel = 1;
        this.blocks = new Map();       // key -> blockType string
        this.dynamicMeshes = new Map(); // key -> THREE.Mesh (player-placed)
        this.instancedMeshes = [];     // array of InstancedMesh in scene
        this.sharedGeo = new THREE.BoxGeometry(1, 1, 1);

        this.blockTypes = {
            grass:       { color: 0x4CAF50, name: 'Grama' },
            dirt:        { color: 0x8D6E63, name: 'Terra' },
            stone:       { color: 0x9E9E9E, name: 'Pedra' },
            cobblestone: { color: 0x757575, name: 'Paralelepípedo' },
            sand:        { color: 0xFFF176, name: 'Areia' },
            water:       { color: 0x29B6F6, name: 'Água' },
            wood:        { color: 0x795548, name: 'Madeira' },
            leaves:      { color: 0x2E7D32, name: 'Folhas' },
            planks:      { color: 0xBCAAA4, name: 'Tábuas' },
            brick:       { color: 0xC62828, name: 'Tijolo' },
            glass:       { color: 0xB3E5FC, name: 'Vidro' },
            gold:        { color: 0xFFD600, name: 'Ouro' },
            snow:        { color: 0xFAFAFA, name: 'Neve' },
            flower_red:  { color: 0xE53935, name: 'Flor Vermelha' },
            flower_yellow:{ color: 0xFFEB3B, name: 'Flor Amarela' },
            neon_pink:   { color: 0xFF4081, name: 'Neon Rosa' },
            neon_blue:   { color: 0x40C4FF, name: 'Neon Azul' },
            roof:        { color: 0xD32F2F, name: 'Telhado' }
        };

        // Pre-build materials (MeshLambertMaterial = much cheaper)
        this.materials = {};
        for (const [key, bt] of Object.entries(this.blockTypes)) {
            const opts: THREE.MeshLambertMaterialParameters = { color: bt.color };
            if (key === 'water') {
                opts.transparent = true;
                opts.opacity = 0.55;
                opts.depthWrite = false;
                opts.side = THREE.DoubleSide;
            }
            if (key === 'glass') {
                opts.transparent = true;
                opts.opacity = 0.35;
                opts.depthWrite = false;
            }
            if (key === 'leaves') {
                opts.transparent = true;
                opts.opacity = 0.9;
            }
            this.materials[key] = new THREE.MeshLambertMaterial(opts);
        }
    }

    // ---- helpers ----
    key(x: number, y: number, z: number): string { return `${x},${y},${z}`; }

    getBlock(x: number, y: number, z: number): string | null { return this.blocks.get(this.key(x, y, z)) || null; }

    setBlockData(x: number, y: number, z: number, type: string): void {
        this.blocks.set(this.key(x, y, z), type);
    }

    // ---- Dynamic blocks (player-placed) ----
    addDynamicBlock(x: number, y: number, z: number, type: string): void {
        const k = this.key(x, y, z);
        this.blocks.set(k, type);
        const mat = this.materials[type] || this.materials.stone;
        const mesh = new THREE.Mesh(this.sharedGeo, mat);
        mesh.position.set(x, y, z);
        mesh.castShadow = false;
        mesh.receiveShadow = false;
        mesh.userData = { blockType: type, blockPos: { x, y, z } };
        this.scene.add(mesh);
        this.dynamicMeshes.set(k, mesh);
    }

    removeDynamicBlock(x: number, y: number, z: number): void {
        const k = this.key(x, y, z);
        const mesh = this.dynamicMeshes.get(k);
        if (mesh) {
            this.scene.remove(mesh);
            this.dynamicMeshes.delete(k);
        }
        this.blocks.delete(k);
    }

    removeBlock(x: number, y: number, z: number): void {
        const k = this.key(x, y, z);
        if (this.dynamicMeshes.has(k)) {
            this.removeDynamicBlock(x, y, z);
        } else {
            // For instanced blocks we just remove from data and do a lazy rebuild
            this.blocks.delete(k);
            this._needsRebuild = true;
        }
    }

    // Alias used by building system
    setBlock(x: number, y: number, z: number, type: string): void {
        this.addDynamicBlock(x, y, z, type);
    }

    // ---- Instanced mesh rebuild (called once after generation) ----
    rebuildInstanced(): void {
        // Remove old instanced meshes
        for (const im of this.instancedMeshes) {
            this.scene.remove(im);
        }
        this.instancedMeshes = [];

        // Bucket blocks by type (skip dynamic ones)
        const buckets: Record<string, string[]> = {};
        for (const [k, type] of this.blocks.entries()) {
            if (this.dynamicMeshes.has(k)) continue;
            if (!buckets[type]) buckets[type] = [];
            buckets[type].push(k);
        }

        const dummy = new THREE.Object3D();

        for (const [type, keys] of Object.entries(buckets) as [string, string[]][]) {
            const mat = this.materials[type] || this.materials.stone;
            const im = new THREE.InstancedMesh(this.sharedGeo, mat, keys.length);
            im.castShadow = (type !== 'water');
            im.receiveShadow = true;

            for (let i = 0; i < keys.length; i++) {
                const [sx, sy, sz] = keys[i].split(',').map(Number);
                dummy.position.set(sx, sy, sz);
                dummy.updateMatrix();
                im.setMatrixAt(i, dummy.matrix);
            }
            im.instanceMatrix.needsUpdate = true;
            im.userData.blockType = type;
            this.scene.add(im);
            this.instancedMeshes.push(im);
        }
    }

    // ---- Generation ----
    generate(onProgress?: (progress: number, message: string) => void): void {
        onProgress?.(0, 'Gerando terreno...');
        this.generateTerrain();
        onProgress?.(0.3, 'Criando água...');
        this.generateWater();
        onProgress?.(0.5, 'Plantando árvores...');
        this.generateTrees();
        onProgress?.(0.7, 'Construindo estruturas...');
        this.generateStructures();
        onProgress?.(0.9, 'Otimizando mundo...');
        this.rebuildInstanced();
        onProgress?.(1, 'Mundo pronto!');
    }

    generateTerrain(): void {
        const half = this.worldSize / 2;
        for (let x = -half; x < half; x++) {
            for (let z = -half; z < half; z++) {
                this.generateTerrainColumn(x, z);
            }
        }
    }

    generateTerrainColumn(x: number, z: number): void {
        const n = Utils.fbm(x * 0.018, z * 0.018, 4, 2, 0.5);
        let h = Math.floor(4 + (n - 0.35) * 18);
        if (h < 0) h = 0;

        const type = this.getTerrainType(h);
        this.setBlockData(x, h, z, type);

        // Fill terrain down to y=0 for solidity
        const fillType = h <= this.waterLevel + 1 ? 'sand' : 'dirt';
        for (let y = h - 1; y >= 0; y--) {
            this.setBlockData(x, y, z, fillType);
        }

        // Flowers on grass (sparse)
        if (type === 'grass' && Math.random() < 0.012) {
            const flower = Math.random() > 0.5 ? 'flower_red' : 'flower_yellow';
            this.setBlockData(x, h + 1, z, flower);
        }
    }

    getTerrainType(h: number): string {
        if (h <= this.waterLevel) return 'sand';
        if (h === this.waterLevel + 1) return Math.random() < 0.5 ? 'sand' : 'grass';
        if (h > 12) return 'snow';
        if (h > 9) return 'stone';
        return 'grass';
    }

    generateWater(): void {
        // Create a single flat water plane instead of individual blocks
        const size = this.worldSize;
        const waterGeo = new THREE.PlaneGeometry(size, size);
        const waterMat = new THREE.MeshLambertMaterial({
            color: 0x29B6F6,
            transparent: true,
            opacity: 0.55,
            depthWrite: false,
            side: THREE.DoubleSide
        });
        this.waterPlane = new THREE.Mesh(waterGeo, waterMat);
        this.waterPlane.rotation.x = -Math.PI / 2;
        this.waterPlane.position.y = this.waterLevel + 0.4;
        this.waterPlane.receiveShadow = true;
        this.scene.add(this.waterPlane);

        // Solid seabed plane to hide block edges under water
        const seabedGeo = new THREE.PlaneGeometry(size, size);
        const seabedMat = new THREE.MeshLambertMaterial({ color: 0xC2B280 }); // sandy color
        this.seabedPlane = new THREE.Mesh(seabedGeo, seabedMat);
        this.seabedPlane.rotation.x = -Math.PI / 2;
        this.seabedPlane.position.y = -0.5; // just below y=0
        this.seabedPlane.receiveShadow = true;
        this.scene.add(this.seabedPlane);

        // Still store water block data for physics (walk-through, slow down)
        const half = this.worldSize / 2;
        for (let x = -half; x < half; x++) {
            for (let z = -half; z < half; z++) {
                const surfaceKey = this.getSurfaceY(x, z);
                if (surfaceKey === null || surfaceKey < this.waterLevel) {
                    this.blocks.set(this.key(x, this.waterLevel, z), 'water');
                }
            }
        }
    }

    getSurfaceY(x: number, z: number): number | null {
        for (let y = 30; y >= -5; y--) {
            const b = this.blocks.get(this.key(x, y, z));
            if (b && b !== 'water') return y;
        }
        return null;
    }

    generateTrees(): void {
        const half = this.worldSize / 2;
        for (let x = -half + 4; x < half - 4; x += 7) {
            for (let z = -half + 4; z < half - 4; z += 7) {
                const tx = x + Utils.randomInt(-2, 2);
                const tz = z + Utils.randomInt(-2, 2);
                const gy = this.getGroundHeight(tx, tz);

                if (gy > this.waterLevel + 1 && gy < 10 && Math.random() < 0.6) {
                    this.createTree(tx, gy + 1, tz);
                }
            }
        }
    }

    createTree(x: number, y: number, z: number): void {
        const height = Utils.randomInt(3, 5);
        // Trunk
        for (let i = 0; i < height; i++) {
            this.setBlockData(x, y + i, z, 'wood');
        }
        // Canopy
        const top = y + height;
        for (let dx = -2; dx <= 2; dx++) {
            for (let dz = -2; dz <= 2; dz++) {
                for (let dy = 0; dy <= 1; dy++) {
                    if (Math.abs(dx) === 2 && Math.abs(dz) === 2) continue;
                    this.setBlockData(x + dx, top + dy, z + dz, 'leaves');
                }
            }
        }
        this.setBlockData(x, top + 2, z, 'leaves');
    }

    generateStructures(): void {
        this.createSpawnPlatform();
        // A couple of houses
        this.createHouse(12, 8);
        this.createHouse(-15, -10);
    }

    createSpawnPlatform(): void {
        // Ensure platform is always above water level
        const minY = this.waterLevel + 2;
        for (let x = -3; x <= 3; x++) {
            for (let z = -3; z <= 3; z++) {
                const gy = this.getGroundHeight(x, z);
                const platformY = Math.max(gy, minY);
                this.setBlockData(x, platformY, z, 'planks');
                // Fill support pillars if platform is raised
                for (let y = platformY - 1; y > gy; y--) {
                    this.setBlockData(x, y, z, 'planks');
                }
            }
        }
        // Neon corners
        const cornerY = Math.max(this.getGroundHeight(0, 0), minY);
        this.setBlockData(-3, cornerY + 1, -3, 'neon_blue');
        this.setBlockData(3, cornerY + 1, -3, 'neon_pink');
        this.setBlockData(-3, cornerY + 1, 3, 'neon_pink');
        this.setBlockData(3, cornerY + 1, 3, 'neon_blue');
    }

    createHouse(bx: number, bz: number): void {
        const gy = this.getGroundHeight(bx, bz);
        if (gy <= this.waterLevel) return;
        const base = gy + 1;
        const w = 5, d = 5, h = 4;

        this.buildHouseWalls(bx, bz, base, w, d, h);
        this.buildHouseRoof(bx, bz, base, w, d, h);
    }

    buildHouseWalls(bx: number, bz: number, base: number, w: number, d: number, h: number): void {
        for (let y = 0; y < h; y++) {
            this.buildHouseLayer(bx, bz, base, w, d, y);
        }
    }

    buildHouseLayer(bx: number, bz: number, base: number, w: number, d: number, y: number): void {
        for (let x = 0; x < w; x++) {
            for (let z = 0; z < d; z++) {
                if (this.isHouseOpening(x, z, y, w, d)) continue;

                const isWall = (x === 0 || x === w - 1 || z === 0 || z === d - 1);
                if (y === 0 || isWall) {
                    this.setBlockData(bx + x, base + y, bz + z, y === 0 ? 'planks' : 'brick');
                }
            }
        }
    }

    isHouseOpening(x: number, z: number, y: number, w: number, _d: number): boolean {
        const isDoor = (x === Math.floor(w / 2) && z === 0 && y < 2);
        const isWindow = (y === 1 && ((x === 1 && z === 0) || (x === w - 2 && z === 0)));
        return isDoor || isWindow;
    }

    buildHouseRoof(bx: number, bz: number, base: number, w: number, d: number, h: number): void {
        for (let x = -1; x <= w; x++) {
            for (let z = -1; z <= d; z++) {
                this.setBlockData(bx + x, base + h, bz + z, 'roof');
            }
        }
    }

    // ---- Query helpers ----
    getGroundHeight(x: number, z: number): number {
        for (let y = 30; y >= -5; y--) {
            const b = this.blocks.get(this.key(x, y, z));
            if (b && b !== 'water' && b !== 'flower_red' && b !== 'flower_yellow') return y;
        }
        return 0;
    }

    getBlockCount(): number {
        return this.blocks.size;
    }

    raycastBlock(origin: THREE.Vector3, direction: THREE.Vector3, maxDist = 8): RaycastHit | null {
        const dir = direction.clone().normalize();
        const pos = origin.clone();
        const step = 0.1;
        let prevX = null, prevY = null, prevZ = null;

        for (let d = 0; d < maxDist; d += step) {
            pos.addScaledVector(dir, step);

            const bx = Math.floor(pos.x + 0.5);
            const by = Math.floor(pos.y + 0.5);
            const bz = Math.floor(pos.z + 0.5);

            const block = this.getBlock(bx, by, bz);
            if (block && block !== 'water') {
                // placePosition = previous empty voxel the ray was in
                const place: Vec3 = (prevX === null)
                    ? { x: bx, y: by + 1, z: bz }
                    : { x: prevX, y: prevY, z: prevZ };
                return {
                    position: { x: bx, y: by, z: bz },
                    block: block,
                    placePosition: place
                };
            }

            // Track last empty voxel (skip if same as current)
            if (prevX !== bx || prevY !== by || prevZ !== bz) {
                if (!block || block === 'water') {
                    prevX = bx;
                    prevY = by;
                    prevZ = bz;
                }
            }
        }
        return null;
    }
}
