// ============================================
// ENTITIES (NPCs, Collectibles, Enemies)
// ============================================
import * as THREE from 'three';
import Utils from './utils';
import type { EntityUpdateResult } from './types';
import type { World } from './world';

export class EntitySystem {
    scene: THREE.Scene;
    world: World;
    entities: THREE.Object3D[];
    coins: THREE.Group[];
    npcs: THREE.Group[];
    particles: THREE.Object3D[];

    constructor(scene: THREE.Scene, world: World) {
        this.scene = scene;
        this.world = world;
        this.entities = [];
        this.coins = [];
        this.npcs = [];
        this.particles = [];
    }

    spawnCoins(count = 50): void {
        const size = this.world.worldSize;

        for (let i = 0; i < count; i++) {
            const x = Utils.randomInt(-size / 2 + 5, size / 2 - 5);
            const z = Utils.randomInt(-size / 2 + 5, size / 2 - 5);
            const groundY = this.world.getGroundHeight(x, z);

            if (groundY > this.world.waterLevel && groundY < 15) {
                this.createCoin(x, groundY + 1.5, z);
            }
        }
    }

    createCoin(x: number, y: number, z: number): void {
        const group = new THREE.Group();

        // Coin body (cylinder) — MeshLambertMaterial, no PointLight
        const coinGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.08, 8);
        const coinMat = new THREE.MeshLambertMaterial({
            color: 0xFFD700,
            emissive: 0xFFAA00,
            emissiveIntensity: 0.4
        });
        const coin = new THREE.Mesh(coinGeo, coinMat);
        coin.rotation.z = Math.PI / 2;
        group.add(coin);

        // Star on coin
        const starGeo = new THREE.BoxGeometry(0.15, 0.15, 0.12);
        const starMat = new THREE.MeshLambertMaterial({
            color: 0xFFF176,
            emissive: 0xFFD700,
            emissiveIntensity: 0.5
        });
        const star = new THREE.Mesh(starGeo, starMat);
        star.rotation.z = Math.PI / 4;
        coin.add(star);

        group.position.set(x, y, z);
        group.userData = {
            type: 'coin',
            baseY: y,
            rotSpeed: Utils.randomRange(1.5, 3),
            bobSpeed: Utils.randomRange(1.5, 2.5),
            bobAmount: Utils.randomRange(0.15, 0.3),
            collected: false
        };

        this.scene.add(group);
        this.coins.push(group);
    }

    spawnNPCs(): void {
        const size = this.world.worldSize;

        // Spawn family members near the center
        const familyMembers = [
            { name: 'Papai Flávio', create: (x,y,z) => this.createFamilyNPC(x,y,z, 'flavio') },
            { name: 'Mamãe Ana Paula', create: (x,y,z) => this.createFamilyNPC(x,y,z, 'anapaula') },
            { name: 'Maria Fernanda', create: (x,y,z) => this.createFamilyNPC(x,y,z, 'mafe') },
            { name: 'Juju', create: (x,y,z) => this.createFamilyNPC(x,y,z, 'julia') },
        ];

        const positions = [{x:5,z:3},{x:-4,z:6},{x:7,z:-5},{x:-6,z:-3}];
        familyMembers.forEach((member, i) => {
            const pos = positions[i];
            const groundY = this.world.getGroundHeight(pos.x, pos.z);
            const y = Math.max(groundY, this.world.waterLevel + 1) + 1;
            member.create(pos.x, y, pos.z);
        });

        // Also spawn some generic friendly NPCs
        for (let i = 0; i < 4; i++) {
            const x = Utils.randomInt(-size / 3, size / 3);
            const z = Utils.randomInt(-size / 3, size / 3);
            const groundY = this.world.getGroundHeight(x, z);
            if (groundY > this.world.waterLevel) {
                this.createGenericNPC(x, groundY + 1, z);
            }
        }
    }

    createFamilyNPC(x: number, y: number, z: number, member: 'flavio' | 'anapaula' | 'mafe' | 'julia'): void {
        const group = new THREE.Group();

        // Family member configs based on real photos
        const configs = {
            flavio: {
                name: '💪 Papai Flávio',
                skinColor: 0xD4A574, // tom mais bronzeado
                shirtColor: 0x1A1A1A, // camiseta preta
                pantsColor: 0xC8B896, // bermuda bege
                hairColor: null, // careca!
                hasBeard: true,
                beardColor: 0x3E2723,
                scale: 1.15, // pai forte e grande
                dialogues: [
                    '💪 Fala campeão! Bora construir!',
                    '👨‍👧‍👧 Minhas princesas são tudo pra mim!',
                    '🏋️ Hora de treinar! Coloca bloco pra cima!',
                    '❤️ A família Padilha é demais!',
                    '🎮 Esse jogo é pras minhas filhas!',
                    '😎 Papai tá on! Bora jogar!',
                    '🏠 Vamos construir uma casa pra família!',
                    '⭐ MaFe e Juju, peguem as estrelas!',
                ]
            },
            anapaula: {
                name: '💕 Mamãe Ana Paula',
                skinColor: 0xFFDCB5,
                shirtColor: 0x1A1A1A, // camiseta preta
                pantsColor: 0x1565C0, // jardineira jeans
                hairColor: 0x8B6914, // castanho claro
                hasBeard: false,
                scale: 1,
                dialogues: [
                    '💕 Oi amor! Que bom te ver por aqui!',
                    '👩‍👧‍👧 Cuidem das meninas, tá?',
                    '🌸 Esse mundo é lindo, né?',
                    '❤️ Família unida, família feliz!',
                    '🏠 Vamos decorar a casa juntos!',
                    '📸 Para pra eu tirar uma foto!',
                    '🌟 Que orgulho das minhas meninas!',
                    '😘 Te amo, família Padilha!',
                ]
            },
            mafe: {
                name: '⭐ Maria Fernanda',
                skinColor: 0xFFDCB5,
                shirtColor: 0x1A1A1A, // crop preta
                pantsColor: 0x90CAF9, // jeans claro
                hairColor: 0x2C1810, // cabelo longo escuro
                longHair: true,
                hasBeard: false,
                scale: 0.9, // adolescente
                dialogues: [
                    '✨ Oi! Eu sou a MaFe!',
                    '💃 Vamos explorar o mundo!',
                    '📱 Isso aqui tá muito legal!',
                    '👧 Juju, vem cá pertinho de mim!',
                    '🌟 Papai fez esse jogo pra gente!',
                    '💖 Amo minha família!',
                    '🏗️ Olha o que eu construí!',
                    '⭐ Eu peguei mais estrelas que você!',
                ]
            },
            julia: {
                name: '🎀 Juju',
                skinColor: 0xFFE4C9,
                shirtColor: 0xFFF8E1, // blusa creme
                pantsColor: 0xBCAAA4, // saia bege
                hairColor: 0xA67B5B, // cabelo claro com franja
                hasBow: true, // lacinho!
                hasBeard: false,
                hasBangs: true,
                scale: 0.65, // pequenininha
                dialogues: [
                    '🎀 Oi! Eu sou a Juju!',
                    '🎈 Quero balão! Muitos balões!',
                    '😜 Blééé! *mostra a língua*',
                    '👶 Papaaai! Me pega no colo!',
                    '🌈 Olha que bonito!',
                    '⭐ Estrela! Estrela! Eu quero!',
                    '🎀 Meu lacinho é o mais bonito!',
                    '💖 Eu amo o papai e a mamãe!',
                    '🍬 Quero docinho!',
                    '😊 MaFe é minha irmã mais velha!',
                ]
            }
        };

        const cfg = (configs as Record<string, any>)[member];
        const s = cfg.scale;

        // Head
        const headGeo = new THREE.BoxGeometry(0.6 * s, 0.6 * s, 0.6 * s);
        const headMat = new THREE.MeshLambertMaterial({ color: cfg.skinColor });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 1.4 * s;
        head.castShadow = true;
        group.add(head);

        // Eyes
        const eyeGeo = new THREE.BoxGeometry(0.1 * s, 0.1 * s, 0.05 * s);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x3E2723 });
        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.position.set(-0.12 * s, 1.45 * s, 0.31 * s);
        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        rightEye.position.set(0.12 * s, 1.45 * s, 0.31 * s);
        group.add(leftEye, rightEye);

        // Smile
        const smileGeo = new THREE.BoxGeometry(0.2 * s, 0.05 * s, 0.05 * s);
        const smileMat = new THREE.MeshBasicMaterial({ color: 0xE57373 });
        const smile = new THREE.Mesh(smileGeo, smileMat);
        smile.position.set(0, 1.3 * s, 0.31 * s);
        group.add(smile);

        // Hair (or bald for Flávio)
        if (cfg.hairColor) {
            if (cfg.longHair) {
                // MaFe - cabelo longo escuro
                const hairTopGeo = new THREE.BoxGeometry(0.65 * s, 0.2 * s, 0.65 * s);
                const hairMat = new THREE.MeshLambertMaterial({ color: cfg.hairColor });
                const hairTop = new THREE.Mesh(hairTopGeo, hairMat);
                hairTop.position.y = 1.78 * s;
                group.add(hairTop);
                // Cabelo descendo dos lados
                const hairSideGeo = new THREE.BoxGeometry(0.12 * s, 0.9 * s, 0.55 * s);
                const hairLeft = new THREE.Mesh(hairSideGeo, hairMat);
                hairLeft.position.set(-0.32 * s, 1.2 * s, -0.02 * s);
                const hairRight = new THREE.Mesh(hairSideGeo, hairMat);
                hairRight.position.set(0.32 * s, 1.2 * s, -0.02 * s);
                group.add(hairLeft, hairRight);
                // Cabelo nas costas (longo)
                const hairBackGeo = new THREE.BoxGeometry(0.55 * s, 1.1 * s, 0.12 * s);
                const hairBack = new THREE.Mesh(hairBackGeo, hairMat);
                hairBack.position.set(0, 1 * s, -0.32 * s);
                group.add(hairBack);
            } else if (cfg.hasBangs) {
                // Julia - cabelo claro com franja
                const hairMat = new THREE.MeshLambertMaterial({ color: cfg.hairColor });
                const hairTopGeo = new THREE.BoxGeometry(0.65 * s, 0.2 * s, 0.65 * s);
                const hairTop = new THREE.Mesh(hairTopGeo, hairMat);
                hairTop.position.y = 1.78 * s;
                group.add(hairTop);
                // Franja
                const bangsGeo = new THREE.BoxGeometry(0.58 * s, 0.12 * s, 0.1 * s);
                const bangs = new THREE.Mesh(bangsGeo, hairMat);
                bangs.position.set(0, 1.6 * s, 0.3 * s);
                group.add(bangs);
                // Cabelo dos lados
                const hairSideGeo = new THREE.BoxGeometry(0.1 * s, 0.7 * s, 0.5 * s);
                const hairL = new THREE.Mesh(hairSideGeo, hairMat);
                hairL.position.set(-0.3 * s, 1.2 * s, 0);
                const hairR = new THREE.Mesh(hairSideGeo, hairMat);
                hairR.position.set(0.3 * s, 1.2 * s, 0);
                group.add(hairL, hairR);
            } else {
                // Ana Paula - cabelo castanho médio
                const hairMat = new THREE.MeshLambertMaterial({ color: cfg.hairColor });
                const hairTopGeo = new THREE.BoxGeometry(0.65 * s, 0.25 * s, 0.65 * s);
                const hairTop = new THREE.Mesh(hairTopGeo, hairMat);
                hairTop.position.y = 1.78 * s;
                group.add(hairTop);
                const hairSideGeo = new THREE.BoxGeometry(0.1 * s, 0.6 * s, 0.5 * s);
                const hairL = new THREE.Mesh(hairSideGeo, hairMat);
                hairL.position.set(-0.3 * s, 1.25 * s, 0);
                const hairR = new THREE.Mesh(hairSideGeo, hairMat);
                hairR.position.set(0.3 * s, 1.25 * s, 0);
                group.add(hairL, hairR);
            }
        }

        // Beard for Flávio
        if (cfg.hasBeard) {
            const beardGeo = new THREE.BoxGeometry(0.4 * s, 0.2 * s, 0.15 * s);
            const beardMat = new THREE.MeshLambertMaterial({ color: cfg.beardColor });
            const beard = new THREE.Mesh(beardGeo, beardMat);
            beard.position.set(0, 1.2 * s, 0.28 * s);
            group.add(beard);
        }

        // Bow for Julia (lacinho)
        if (cfg.hasBow) {
            const bowMat = new THREE.MeshLambertMaterial({ color: 0xFFF8E1 });
            const bowCenter = new THREE.Mesh(
                new THREE.BoxGeometry(0.08 * s, 0.08 * s, 0.08 * s), bowMat
            );
            bowCenter.position.set(0.15 * s, 1.85 * s, 0);
            const bowL = new THREE.Mesh(
                new THREE.BoxGeometry(0.15 * s, 0.1 * s, 0.06 * s), bowMat
            );
            bowL.position.set(0.05 * s, 1.85 * s, 0);
            const bowR = new THREE.Mesh(
                new THREE.BoxGeometry(0.15 * s, 0.1 * s, 0.06 * s), bowMat
            );
            bowR.position.set(0.25 * s, 1.85 * s, 0);
            group.add(bowCenter, bowL, bowR);
        }

        // Body
        const bodyGeo = new THREE.BoxGeometry(0.6 * s, 0.7 * s, 0.4 * s);
        const bodyMat = new THREE.MeshLambertMaterial({ color: cfg.shirtColor });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.85 * s;
        body.castShadow = true;
        group.add(body);

        // Arms
        const armGeo = new THREE.BoxGeometry(0.25 * s, 0.6 * s, 0.25 * s);
        const armMat = new THREE.MeshLambertMaterial({ color: cfg.shirtColor });
        const leftArm = new THREE.Mesh(armGeo, armMat);
        leftArm.position.set(-0.43 * s, 0.85 * s, 0);
        const rightArm = new THREE.Mesh(armGeo, armMat);
        rightArm.position.set(0.43 * s, 0.85 * s, 0);
        group.add(leftArm, rightArm);

        // Legs
        const legGeo = new THREE.BoxGeometry(0.25 * s, 0.5 * s, 0.25 * s);
        const legMat = new THREE.MeshLambertMaterial({ color: cfg.pantsColor });
        const leftLeg = new THREE.Mesh(legGeo, legMat);
        leftLeg.position.set(-0.15 * s, 0.25 * s, 0);
        const rightLeg = new THREE.Mesh(legGeo, legMat);
        rightLeg.position.set(0.15 * s, 0.25 * s, 0);
        group.add(leftLeg, rightLeg);

        // Name tag (floating text sprite)
        const nameCanvas = document.createElement('canvas');
        nameCanvas.width = 256;
        nameCanvas.height = 64;
        const ctx = nameCanvas.getContext('2d');
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        // roundRect polyfill (not available in all browsers)
        if (ctx.roundRect) {
            ctx.roundRect(4, 4, 248, 56, 10);
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.moveTo(14, 4);
            ctx.lineTo(242, 4);
            ctx.quadraticCurveTo(252, 4, 252, 14);
            ctx.lineTo(252, 50);
            ctx.quadraticCurveTo(252, 60, 242, 60);
            ctx.lineTo(14, 60);
            ctx.quadraticCurveTo(4, 60, 4, 50);
            ctx.lineTo(4, 14);
            ctx.quadraticCurveTo(4, 4, 14, 4);
            ctx.closePath();
            ctx.fill();
        }
        ctx.font = 'bold 28px Nunito, Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(cfg.name, 128, 40);
        const nameTexture = new THREE.CanvasTexture(nameCanvas);
        const nameMat = new THREE.SpriteMaterial({ map: nameTexture, transparent: true });
        const nameSprite = new THREE.Sprite(nameMat);
        nameSprite.position.y = 2 * s;
        nameSprite.scale.set(1.5, 0.4, 1);
        group.add(nameSprite);

        // Heart particles around family members
        const heartGeo = new THREE.BoxGeometry(0.15, 0.15, 0.05);
        const heartMat = new THREE.MeshBasicMaterial({ color: 0xFF4081, transparent: true, opacity: 0.7 });
        const heart = new THREE.Mesh(heartGeo, heartMat);
        heart.position.set(0.4 * s, 1.8 * s, 0);
        group.add(heart);

        group.position.set(x, y, z);
        group.userData = {
            type: 'npc',
            family: member,
            walkTimer: 0,
            walkDuration: Utils.randomRange(2, 5),
            walkDir: new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize(),
            idleTimer: 0,
            isIdle: true,
            leftArm: leftArm,
            rightArm: rightArm,
            leftLeg: leftLeg,
            rightLeg: rightLeg,
            heart: heart,
            startPos: new THREE.Vector3(x, y, z),
            speed: member === 'julia' ? 1.5 : Utils.randomRange(1.5, 2.5),
            wanderRadius: member === 'julia' ? 4 : Utils.randomRange(5, 12),
            dialogues: cfg.dialogues,
            lastDialogueTime: 0,
            dialogueCooldown: 6
        };

        this.scene.add(group);
        this.npcs.push(group);
    }

    createGenericNPC(x: number, y: number, z: number): void {
        const group = new THREE.Group();

        const colors = [0xE91E63, 0x9C27B0, 0xFF5722, 0x00BCD4, 0x8BC34A, 0xFF9800];
        const npcColor = colors[Utils.randomInt(0, colors.length - 1)];

        const headGeo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
        const headMat = new THREE.MeshLambertMaterial({ color: 0xFFD1A4 });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 1.4;
        head.castShadow = true;
        group.add(head);

        const eyeGeo = new THREE.BoxGeometry(0.1, 0.1, 0.05);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x212121 });
        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.position.set(-0.12, 1.45, 0.31);
        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        rightEye.position.set(0.12, 1.45, 0.31);
        group.add(leftEye, rightEye);

        const smileGeo = new THREE.BoxGeometry(0.2, 0.05, 0.05);
        const smileMat = new THREE.MeshBasicMaterial({ color: 0xD32F2F });
        const smile = new THREE.Mesh(smileGeo, smileMat);
        smile.position.set(0, 1.3, 0.31);
        group.add(smile);

        const bodyGeo = new THREE.BoxGeometry(0.6, 0.7, 0.4);
        const bodyMat = new THREE.MeshLambertMaterial({ color: npcColor });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.85;
        body.castShadow = true;
        group.add(body);

        const armGeo = new THREE.BoxGeometry(0.25, 0.6, 0.25);
        const armMat = new THREE.MeshLambertMaterial({ color: npcColor });
        const leftArm = new THREE.Mesh(armGeo, armMat);
        leftArm.position.set(-0.43, 0.85, 0);
        const rightArm = new THREE.Mesh(armGeo, armMat);
        rightArm.position.set(0.43, 0.85, 0);
        group.add(leftArm, rightArm);

        const legGeo = new THREE.BoxGeometry(0.25, 0.5, 0.25);
        const legMat = new THREE.MeshLambertMaterial({ color: 0x1A237E });
        const leftLeg = new THREE.Mesh(legGeo, legMat);
        leftLeg.position.set(-0.15, 0.25, 0);
        const rightLeg = new THREE.Mesh(legGeo, legMat);
        rightLeg.position.set(0.15, 0.25, 0);
        group.add(leftLeg, rightLeg);

        group.position.set(x, y, z);
        group.userData = {
            type: 'npc',
            walkTimer: 0,
            walkDuration: Utils.randomRange(2, 5),
            walkDir: new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize(),
            idleTimer: 0,
            isIdle: true,
            leftArm: leftArm,
            rightArm: rightArm,
            leftLeg: leftLeg,
            rightLeg: rightLeg,
            startPos: new THREE.Vector3(x, y, z),
            speed: Utils.randomRange(1, 2.5),
            wanderRadius: Utils.randomRange(5, 15),
            dialogues: [
                '😊 Olá! Bem-vindo ao mundo da família Padilha!',
                '⭐ Colete todas as estrelas!',
                '🏗️ Construa algo incrível!',
                '💕 A família Padilha é muito legal!',
                '🎮 Divirta-se nesse mundo!',
                '👨‍👩‍👧‍👧 Já encontrou o Flávio, a Ana, a MaFe e a Juju?',
            ],
            lastDialogueTime: 0,
            dialogueCooldown: 8
        };

        this.scene.add(group);
        this.npcs.push(group);
    }

    getHeartScale(family?: string): number {
        const scales = { flavio: 1.15, mafe: 0.9, julia: 0.65 };
        return scales[family] || 1;
    }

    updateNPCIdle(data: any, dt: number, time: number): void {
        data.idleTimer += dt;
        if (data.idleTimer > Utils.randomRange(1, 3)) {
            data.isIdle = false;
            data.idleTimer = 0;
            data.walkTimer = 0;
            data.walkDuration = Utils.randomRange(2, 5);
            data.walkDir = new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
        }

        // Idle animation
        const idle = Math.sin(time * 2) * 0.1;
        if (data.leftArm) data.leftArm.rotation.x = idle;
        if (data.rightArm) data.rightArm.rotation.x = -idle;
    }

    updateNPCWalking(npc: THREE.Group, data: any, dt: number, time: number): void {
        data.walkTimer += dt;

        const moveX = data.walkDir.x * data.speed * dt;
        const moveZ = data.walkDir.z * data.speed * dt;
        const nextX = npc.position.x + moveX;
        const nextZ = npc.position.z + moveZ;

        const distFromStart = Math.hypot(
            nextX - data.startPos.x, nextZ - data.startPos.z
        );

        if (distFromStart < data.wanderRadius) {
            npc.position.x = nextX;
            npc.position.z = nextZ;

            const gy = this.world.getGroundHeight(
                Math.round(npc.position.x),
                Math.round(npc.position.z)
            );
            if (gy >= 0) {
                npc.position.y = gy + 1;
            }
        }

        npc.rotation.y = Math.atan2(data.walkDir.x, data.walkDir.z);

        // Walk animation
        const walkSwing = Math.sin(time * 6) * 0.5;
        if (data.leftArm) data.leftArm.rotation.x = walkSwing;
        if (data.rightArm) data.rightArm.rotation.x = -walkSwing;
        if (data.leftLeg) data.leftLeg.rotation.x = -walkSwing * 0.7;
        if (data.rightLeg) data.rightLeg.rotation.x = walkSwing * 0.7;

        if (data.walkTimer > data.walkDuration) {
            data.isIdle = true;
        }
    }

    updateSingleNPC(npc: THREE.Group, time: number, dt: number, playerPos: THREE.Vector3, dialogueMessages: string[]): void {
        const data = npc.userData;
        const distToPlayer = Utils.distance3D(npc.position, playerPos);

        if (distToPlayer < 6) {
            const lookDir = Math.atan2(
                playerPos.x - npc.position.x,
                playerPos.z - npc.position.z
            );
            npc.rotation.y = Utils.lerp(npc.rotation.y, lookDir, 0.05);
            data.isIdle = true;

            if (distToPlayer < 3 && time - data.lastDialogueTime > data.dialogueCooldown) {
                data.lastDialogueTime = time;
                const msg = data.dialogues[Utils.randomInt(0, data.dialogues.length - 1)];
                dialogueMessages.push(msg);
            }
        } else if (data.isIdle) {
            this.updateNPCIdle(data, dt, time);
        } else {
            this.updateNPCWalking(npc, data, dt, time);
        }

        if (data.heart) {
            const heartScale = this.getHeartScale(data.family);
            data.heart.position.y = (data.family === 'julia' ? 1.5 : 1.8) * heartScale + Math.sin(time * 3) * 0.15;
            data.heart.rotation.y = time * 2;
        }
    }

    update(dt: number, playerPos: THREE.Vector3): EntityUpdateResult {
        // Update coins
        const time = performance.now() / 1000;
        this.coins.forEach(coin => {
            if (coin.userData.collected) return;

            // Rotate and bob
            coin.rotation.y += coin.userData.rotSpeed * dt;
            coin.position.y = coin.userData.baseY + Math.sin(time * coin.userData.bobSpeed) * coin.userData.bobAmount;

            // Check collection
            const dist = Utils.distance3D(coin.position, playerPos);
            if (dist < 1.5) {
                coin.userData.collected = true;
                this.scene.remove(coin);
                return true; // Signal collection
            }
        });

        // Remove collected coins
        const collected = this.coins.filter(c => c.userData.collected);
        this.coins = this.coins.filter(c => !c.userData.collected);

        // NPC dialogue triggers
        const dialogueMessages = [];

        // Update NPCs
        this.npcs.forEach(npc => {
            this.updateSingleNPC(npc, time, dt, playerPos, dialogueMessages);
        });

        return { coinsCollected: collected.length, dialogues: dialogueMessages };
    }

    getActiveCoinCount(): number {
        return this.coins.length;
    }
}
