// ============================================
// PHYSICS SYSTEM
// ============================================
import type { Character } from './character';
import type { IWorldQuery } from './types';
import type { AABB } from './types';

export class Physics {
    world: IWorldQuery;
    gravity: number;
    terminalVelocity: number;

    constructor(world: IWorldQuery) {
        this.world = world;
        this.gravity = -20;
        this.terminalVelocity = -50;
    }

    update(character: Character, dt: number): void {
        // Apply gravity
        character.velocity.y += this.gravity * dt;
        character.velocity.y = Math.max(character.velocity.y, this.terminalVelocity);

        // Move and collide on each axis separately
        this.moveAxis(character, 'x', character.velocity.x * dt);
        this.moveAxis(character, 'y', character.velocity.y * dt);
        this.moveAxis(character, 'z', character.velocity.z * dt);

        // Ground check
        character.onGround = this.isOnGround(character);

        if (character.onGround && character.velocity.y < 0) {
            character.velocity.y = 0;
        }

        // Friction
        if (character.onGround) {
            character.velocity.x *= 0.85;
            character.velocity.z *= 0.85;
        } else {
            character.velocity.x *= 0.95;
            character.velocity.z *= 0.95;
        }

        // Water slow-down: if character feet are at or below water level
        if (character.position.y <= this.world.waterLevel + 0.5) {
            character.velocity.x *= 0.7;
            character.velocity.z *= 0.7;
            // Slow fall / buoyancy in water
            if (character.velocity.y < -3) {
                character.velocity.y *= 0.8;
            }
        }

        // Clamp very small velocities
        if (Math.abs(character.velocity.x) < 0.01) character.velocity.x = 0;
        if (Math.abs(character.velocity.z) < 0.01) character.velocity.z = 0;

        // Prevent falling through the world
        if (character.position.y < -10) {
            character.position.set(0, 15, 0);
            character.velocity.set(0, 0, 0);
            character.takeDamage(10);
        }
    }

    moveAxis(character: Character, axis: 'x' | 'y' | 'z', amount: number): void {
        character.position[axis] += amount;

        const aabb = character.getAABB();
        const blockRange = this.getBlockRange(aabb);

        for (let bx = blockRange.minX; bx <= blockRange.maxX; bx++) {
            for (let by = blockRange.minY; by <= blockRange.maxY; by++) {
                for (let bz = blockRange.minZ; bz <= blockRange.maxZ; bz++) {
                    this.resolveBlockCollision(character, axis, amount, bx, by, bz, aabb);
                }
            }
        }
    }

    getBlockRange(aabb: AABB): { minX: number; maxX: number; minY: number; maxY: number; minZ: number; maxZ: number } {
        return {
            minX: Math.floor(aabb.min.x),
            maxX: Math.ceil(aabb.max.x),
            minY: Math.floor(aabb.min.y),
            maxY: Math.ceil(aabb.max.y),
            minZ: Math.floor(aabb.min.z),
            maxZ: Math.ceil(aabb.max.z)
        };
    }

    resolveBlockCollision(character: Character, axis: 'x' | 'y' | 'z', amount: number, bx: number, by: number, bz: number, aabb: AABB): void {
        const block = this.world.getBlock(bx, by, bz);
        if (!block || block === 'water') return;

        const blockAABB = {
            min: { x: bx - 0.5, y: by - 0.5, z: bz - 0.5 },
            max: { x: bx + 0.5, y: by + 0.5, z: bz + 0.5 }
        };

        if (!this.aabbOverlap(aabb, blockAABB)) return;

        this.pushOut(character, axis, amount, blockAABB);
    }

    pushOut(character: Character, axis: 'x' | 'y' | 'z', amount: number, blockAABB: AABB): void {
        if (axis === 'x') {
            character.position.x = amount > 0
                ? blockAABB.min.x - character.width / 2
                : blockAABB.max.x + character.width / 2;
            character.velocity.x = 0;
        } else if (axis === 'y') {
            character.position.y = amount > 0
                ? blockAABB.min.y - character.height
                : blockAABB.max.y;
            character.velocity.y = 0;
        } else if (axis === 'z') {
            character.position.z = amount > 0
                ? blockAABB.min.z - character.depth / 2
                : blockAABB.max.z + character.depth / 2;
            character.velocity.z = 0;
        }
    }

    aabbOverlap(a: AABB, b: AABB): boolean {
        return (
            a.min.x < b.max.x && a.max.x > b.min.x &&
            a.min.y < b.max.y && a.max.y > b.min.y &&
            a.min.z < b.max.z && a.max.z > b.min.z
        );
    }

    isOnGround(character: Character): boolean {
        const aabb = character.getAABB();
        const testY = aabb.min.y - 0.05;

        const minBX = Math.floor(aabb.min.x);
        const maxBX = Math.ceil(aabb.max.x);
        const minBZ = Math.floor(aabb.min.z);
        const maxBZ = Math.ceil(aabb.max.z);
        const by = Math.round(testY);

        for (let bx = minBX; bx <= maxBX; bx++) {
            for (let bz = minBZ; bz <= maxBZ; bz++) {
                const block = this.world.getBlock(bx, by, bz);
                if (block && block !== 'water') {
                    return true;
                }
            }
        }
        return false;
    }

    // Check if a block position is valid for placement (not inside player)
    canPlaceBlock(x: number, y: number, z: number, character: Character): boolean {
        const blockAABB = {
            min: { x: x - 0.5, y: y - 0.5, z: z - 0.5 },
            max: { x: x + 0.5, y: y + 0.5, z: z + 0.5 }
        };
        return !this.aabbOverlap(character.getAABB(), blockAABB);
    }
}
