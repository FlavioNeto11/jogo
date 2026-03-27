// ============================================
// CHARACTER (Roblox-style blocky character)
// ============================================
import * as THREE from 'three';
import Utils from './utils';
import type { AABB } from './types';

export class Character {
    scene: THREE.Scene;
    group: THREE.Group;
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    rotation: { x: number; y: number };
    width: number;
    height: number;
    depth: number;
    speed: number;
    sprintMultiplier: number;
    jumpForce: number;
    gravity: number;
    onGround: boolean;
    isSprinting: boolean;
    isMoving: boolean;
    canDoubleJump: boolean;
    hasDoubleJumped: boolean;
    health: number;
    maxHealth: number;
    coins: number;
    level: number;
    xp: number;
    xpToLevel: number;
    walkCycle: number;
    bobAmount: number;
    headBob: number;
    bodyParts: Record<string, THREE.Object3D>;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.position = new THREE.Vector3(0, 8, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.rotation = { x: 0, y: 0 };

        // Character dimensions (Roblox-like proportions)
        this.width = 0.8;
        this.height = 1.8;
        this.depth = 0.8;

        // Movement
        this.speed = 6;
        this.sprintMultiplier = 1.6;
        this.jumpForce = 8;
        this.gravity = -20;
        this.onGround = false;
        this.isSprinting = false;
        this.isMoving = false;
        this.canDoubleJump = true;
        this.hasDoubleJumped = false;

        // Stats
        this.health = 100;
        this.maxHealth = 100;
        this.coins = 0;
        this.level = 1;
        this.xp = 0;
        this.xpToLevel = 100;

        // Animation
        this.walkCycle = 0;
        this.bobAmount = 0;
        this.headBob = 0;

        // Body parts
        this.bodyParts = {};

        this.createModel();
        scene.add(this.group);
    }

    createModel(): void {
        // Roblox-style character with smooth, colored parts
        const skinColor = 0xFFD1A4;
        const shirtColor = 0x2196F3;
        const pantsColor = 0x1A237E;
        const shoeColor = 0x424242;

        // Head
        const headGeo = new THREE.BoxGeometry(0.7, 0.7, 0.7);
        const headMat = new THREE.MeshLambertMaterial({
            color: skinColor
        });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 1.55;
        head.castShadow = true;
        this.bodyParts.head = head;

        // Face details
        // Eyes
        const eyeGeo = new THREE.BoxGeometry(0.12, 0.12, 0.05);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x212121 });
        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.position.set(-0.15, 1.6, 0.36);
        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        rightEye.position.set(0.15, 1.6, 0.36);

        // Smile
        const smileGeo = new THREE.BoxGeometry(0.25, 0.06, 0.05);
        const smileMat = new THREE.MeshBasicMaterial({ color: 0xC62828 });
        const smile = new THREE.Mesh(smileGeo, smileMat);
        smile.position.set(0, 1.45, 0.36);

        // Hair
        const hairGeo = new THREE.BoxGeometry(0.75, 0.3, 0.75);
        const hairMat = new THREE.MeshLambertMaterial({ color: 0x3E2723 });
        const hair = new THREE.Mesh(hairGeo, hairMat);
        hair.position.y = 1.95;
        hair.castShadow = true;

        // Torso
        const torsoGeo = new THREE.BoxGeometry(0.7, 0.85, 0.5);
        const torsoMat = new THREE.MeshLambertMaterial({
            color: shirtColor
        });
        const torso = new THREE.Mesh(torsoGeo, torsoMat);
        torso.position.y = 0.95;
        torso.castShadow = true;
        this.bodyParts.torso = torso;

        // Arms
        const armGeo = new THREE.BoxGeometry(0.3, 0.8, 0.3);
        const armMat = new THREE.MeshLambertMaterial({
            color: shirtColor
        });

        const leftArm = new THREE.Mesh(armGeo, armMat);
        leftArm.position.set(-0.5, 0.95, 0);
        leftArm.castShadow = true;
        this.bodyParts.leftArm = leftArm;

        const rightArm = new THREE.Mesh(armGeo, armMat);
        rightArm.position.set(0.5, 0.95, 0);
        rightArm.castShadow = true;
        this.bodyParts.rightArm = rightArm;

        // Hands (skin colored)
        const handGeo = new THREE.BoxGeometry(0.25, 0.2, 0.25);
        const handMat = new THREE.MeshLambertMaterial({ color: skinColor });
        const leftHand = new THREE.Mesh(handGeo, handMat);
        leftHand.position.set(-0.5, 0.5, 0);
        const rightHand = new THREE.Mesh(handGeo, handMat);
        rightHand.position.set(0.5, 0.5, 0);

        // Legs
        const legGeo = new THREE.BoxGeometry(0.3, 0.75, 0.3);
        const legMat = new THREE.MeshLambertMaterial({
            color: pantsColor
        });

        const leftLeg = new THREE.Mesh(legGeo, legMat);
        leftLeg.position.set(-0.2, 0.35, 0);
        leftLeg.castShadow = true;
        this.bodyParts.leftLeg = leftLeg;

        const rightLeg = new THREE.Mesh(legGeo, legMat);
        rightLeg.position.set(0.2, 0.35, 0);
        rightLeg.castShadow = true;
        this.bodyParts.rightLeg = rightLeg;

        // Shoes
        const shoeGeo = new THREE.BoxGeometry(0.32, 0.15, 0.38);
        const shoeMat = new THREE.MeshLambertMaterial({ color: shoeColor });
        const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
        leftShoe.position.set(-0.2, 0, 0.03);
        const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
        rightShoe.position.set(0.2, 0, 0.03);

        // Add all parts to group
        this.group.add(head, leftEye, rightEye, smile, hair);
        this.group.add(torso);
        this.group.add(leftArm, rightArm, leftHand, rightHand);
        this.group.add(leftLeg, rightLeg);
        this.group.add(leftShoe, rightShoe);

        // Shadow circle beneath character
        const shadowGeo = new THREE.CircleGeometry(0.5, 16);
        const shadowMat = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        const shadow = new THREE.Mesh(shadowGeo, shadowMat);
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.y = 0.01;
        this.bodyParts.shadow = shadow;
        this.group.add(shadow);
    }

    animate(dt: number, isMoving: boolean): void {
        this.isMoving = isMoving;

        if (isMoving && this.onGround) {
            const walkSpeed = this.isSprinting ? 12 : 8;
            this.walkCycle += dt * walkSpeed;

            // Arm swing
            const swing = Math.sin(this.walkCycle) * 0.6;
            if (this.bodyParts.leftArm) {
                this.bodyParts.leftArm.rotation.x = swing;
                this.bodyParts.rightArm.rotation.x = -swing;
            }

            // Leg swing
            if (this.bodyParts.leftLeg) {
                this.bodyParts.leftLeg.rotation.x = -swing * 0.8;
                this.bodyParts.rightLeg.rotation.x = swing * 0.8;
            }

            // Body bob
            this.bobAmount = Math.abs(Math.sin(this.walkCycle * 2)) * 0.05;
            this.headBob = Math.sin(this.walkCycle * 2) * 0.03;
        } else {
            // Idle animation
            this.walkCycle += dt * 2;
            const idle = Math.sin(this.walkCycle) * 0.02;

            if (this.bodyParts.leftArm) {
                this.bodyParts.leftArm.rotation.x = Utils.lerp(this.bodyParts.leftArm.rotation.x, idle, 0.1);
                this.bodyParts.rightArm.rotation.x = Utils.lerp(this.bodyParts.rightArm.rotation.x, -idle, 0.1);
            }
            if (this.bodyParts.leftLeg) {
                this.bodyParts.leftLeg.rotation.x = Utils.lerp(this.bodyParts.leftLeg.rotation.x, 0, 0.1);
                this.bodyParts.rightLeg.rotation.x = Utils.lerp(this.bodyParts.rightLeg.rotation.x, 0, 0.1);
            }

            this.bobAmount = Utils.lerp(this.bobAmount, 0, 0.1);
            this.headBob = Utils.lerp(this.headBob, 0, 0.1);
        }

        // Update group position
        this.group.position.copy(this.position);
        this.group.position.y += this.bobAmount;
        this.group.rotation.y = this.rotation.y;
    }

    takeDamage(amount: number): boolean {
        this.health = Math.max(0, this.health - amount);
        return this.health <= 0;
    }

    heal(amount: number): void {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }

    addXP(amount: number): boolean {
        this.xp += amount;
        if (this.xp >= this.xpToLevel) {
            this.xp -= this.xpToLevel;
            this.level++;
            this.xpToLevel = Math.floor(this.xpToLevel * 1.5);
            return true; // Level up!
        }
        return false;
    }

    collectCoin(): boolean {
        this.coins++;
        const leveled = this.addXP(10);
        return leveled;
    }

    getAABB(): AABB {
        return {
            min: {
                x: this.position.x - this.width / 2,
                y: this.position.y,
                z: this.position.z - this.depth / 2
            },
            max: {
                x: this.position.x + this.width / 2,
                y: this.position.y + this.height,
                z: this.position.z + this.depth / 2
            }
        };
    }
}
