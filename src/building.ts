// ============================================
// BUILDING SYSTEM
// ============================================
import * as THREE from 'three';
import type { Character } from './character';
import type { Physics } from './physics';
import type { World } from './world';

export class BuildingSystem {
    world: World;
    scene: THREE.Scene;
    selectedBlockType: string;
    ghostBlock!: THREE.Mesh;
    toolbarBlocks: string[];
    selectedSlot: number;
    highlightBox!: THREE.LineSegments;

    constructor(world: World, scene: THREE.Scene) {
        this.world = world;
        this.scene = scene;
        this.selectedBlockType = 'brick';
        this.toolbarBlocks = [
            'brick', 'planks', 'stone', 'cobblestone', 'wood',
            'glass', 'gold', 'neon_pink', 'neon_blue'
        ];
        this.selectedSlot = 0;
        this.createGhostBlock();
    }

    createGhostBlock(): void {
        const geo = new THREE.BoxGeometry(1.02, 1.02, 1.02);
        const mat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.25,
            wireframe: false
        });
        this.ghostBlock = new THREE.Mesh(geo, mat);
        this.ghostBlock.visible = false;

        // Outline
        const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.02, 1.02, 1.02));
        const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
        const outline = new THREE.LineSegments(edges, lineMat);
        this.ghostBlock.add(outline);

        this.scene.add(this.ghostBlock);

        // Block highlight (shows which block you're looking at)
        const hlEdges = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.005, 1.005, 1.005));
        const hlMat = new THREE.LineBasicMaterial({ color: 0xFFFFFF, linewidth: 1, transparent: true, opacity: 0.6 });
        this.highlightBox = new THREE.LineSegments(hlEdges, hlMat);
        this.highlightBox.visible = false;
        this.scene.add(this.highlightBox);
    }

    selectSlot(index: number): void {
        this.selectedSlot = index;
        if (index < this.toolbarBlocks.length) {
            this.selectedBlockType = this.toolbarBlocks[index];
        }
    }

    updateGhost(camera: THREE.Camera, character: Character): void {
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);
        // Start ray from character position (not camera) in camera direction
        // so it skips past the player and hits terrain/blocks ahead
        const charCenter = character.position.clone();
        charCenter.y += 1.5; // head height
        const origin = charCenter.clone().add(dir.clone().multiplyScalar(1));

        const hit = this.world.raycastBlock(origin, dir, 7);

        if (hit?.placePosition) {
            this.ghostBlock.visible = true;
            this.ghostBlock.position.set(
                hit.placePosition.x,
                hit.placePosition.y,
                hit.placePosition.z
            );

            // Update ghost color to match selected block
            const blockType = this.world.blockTypes[this.selectedBlockType];
            if (blockType) {
                (this.ghostBlock.material as THREE.MeshBasicMaterial).color.setHex(blockType.color);
            }

            // Show highlight on the targeted block
            this.highlightBox.visible = true;
            this.highlightBox.position.set(
                hit.position.x,
                hit.position.y,
                hit.position.z
            );
        } else {
            this.ghostBlock.visible = false;
            this.highlightBox.visible = false;
        }
    }

    placeBlock(camera: THREE.Camera, character: Character, physics: Physics): boolean {
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);
        const charCenter = character.position.clone();
        charCenter.y += 1.5;
        const origin = charCenter.clone().add(dir.clone().multiplyScalar(1));

        const hit = this.world.raycastBlock(origin, dir, 7);

        if (hit?.placePosition) {
            const { x, y, z } = hit.placePosition;

            // Check if block would be inside the player
            if (physics.canPlaceBlock(x, y, z, character)) {
                this.world.setBlock(x, y, z, this.selectedBlockType);
                return true;
            }
        }
        return false;
    }

    removeBlock(camera: THREE.Camera, character: Character): { x: number; y: number; z: number } | null {
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);
        const charCenter = character.position.clone();
        charCenter.y += 1.5;
        const origin = charCenter.clone().add(dir.clone().multiplyScalar(1));

        const hit = this.world.raycastBlock(origin, dir, 7);

        if (hit) {
            const { x, y, z } = hit.position;
            // Don't remove bedrock
            if (y > 0) {
                this.world.removeBlock(x, y, z);
                return { x, y, z };
            }
        }
        return null;
    }
}
