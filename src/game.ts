// ============================================
// MAIN GAME ENGINE (Optimized)
// ============================================
import * as THREE from 'three';
import './style.css';
import Utils from './utils';
import { AudioSystem } from './audio';
import { World } from './world';
import { Character } from './character';
import { Physics } from './physics';
import { BuildingSystem } from './building';
import { EntitySystem } from './entities';
import { ParticleSystem } from './particles';
import { UISystem } from './ui';
import type { GameSettings, GameState } from './types';

export class Game {
    canvas: HTMLCanvasElement;
    state: GameState;

    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;

    world!: World;
    character!: Character;
    physics!: Physics;
    building!: BuildingSystem;
    entities!: EntitySystem;
    particles!: ParticleSystem;
    audio: AudioSystem;
    ui: UISystem;

    cameraMode: 'first' | 'third';
    cameraDistance: number;
    cameraHeight: number;
    cameraPitch: number;
    cameraYaw: number;
    cameraTarget: THREE.Vector3;
    cameraSmoothPos: THREE.Vector3;

    keys: Record<string, boolean>;
    mouse: { x: number; y: number; dx: number; dy: number };
    sensitivity: number;
    isPointerLocked: boolean;

    clock: THREE.Clock;
    lastTime: number;
    accumulator: number;
    fixedDT: number;

    settings: GameSettings;

    stepTimer: number;
    stepInterval: number;
    wasOnGround: boolean;

    sunLight: THREE.DirectionalLight | null = null;
    sky: THREE.Mesh | null = null;
    clouds: THREE.Group[] = [];
    ambientParticles: THREE.Mesh[] = [];

    private getRequiredElement<T extends HTMLElement>(id: string): T {
        const element = document.getElementById(id);
        if (!element) {
            throw new Error(`Elemento obrigatório não encontrado: ${id}`);
        }
        return element as T;
    }

    constructor() {
        this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
        this.state = 'loading'; // loading, menu, playing, paused

        // Three.js
        this.renderer = {} as THREE.WebGLRenderer;
        this.scene = {} as THREE.Scene;
        this.camera = {} as THREE.PerspectiveCamera;

        // Systems
        this.audio = new AudioSystem();
        this.ui = new UISystem();

        // Camera
        this.cameraMode = 'third';
        this.cameraDistance = 7;
        this.cameraHeight = 3;
        this.cameraPitch = 0.35;
        this.cameraYaw = 0;
        this.cameraTarget = new THREE.Vector3();
        this.cameraSmoothPos = new THREE.Vector3();

        // Input
        this.keys = {};
        this.mouse = { x: 0, y: 0, dx: 0, dy: 0 };
        this.sensitivity = 0.002;
        this.isPointerLocked = false;

        // Timing
        this.clock = new THREE.Clock();
        this.lastTime = 0;
        this.accumulator = 0;
        this.fixedDT = 1 / 60;

        // Settings
        this.settings = {
            quality: 'medium',
            sensitivity: 5,
            volume: 70,
            renderDistance: 150
        };

        // Step sound timer
        this.stepTimer = 0;
        this.stepInterval = 0.4;
        this.wasOnGround = false;
    }

    async init(): Promise<void> {
        this.setupRenderer();
        this.setupScene();
        this.setupLighting();
        this.setupSkybox();
        this.setupFog();
        this.setupAmbientParticles();
        this.setupInput();
        this.setupMenuEvents();

        await this.load();
    }

    setupRenderer(): void {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: false,          // PERF: disabled
            alpha: false,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.BasicShadowMap;  // PERF: cheaper shadows
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.1;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;

        window.addEventListener('resize', () => {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        });
    }

    setupScene(): void {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            70, window.innerWidth / window.innerHeight, 0.1, 300
        );
        this.camera.position.set(0, 15, 10);
    }

    setupLighting(): void {
        // Ambient
        const ambientLight = new THREE.AmbientLight(0x87CEEB, 0.6);
        this.scene.add(ambientLight);

        // Hemisphere
        const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x8D6E63, 0.5);
        hemiLight.position.set(0, 50, 0);
        this.scene.add(hemiLight);

        // Sun (directional)
        const sunLight = new THREE.DirectionalLight(0xFFF9C4, 1.2);
        sunLight.position.set(50, 80, 30);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 1024;   // PERF: reduced from 2048
        sunLight.shadow.mapSize.height = 1024;
        sunLight.shadow.camera.near = 1;
        sunLight.shadow.camera.far = 150;
        sunLight.shadow.camera.left = -40;
        sunLight.shadow.camera.right = 40;
        sunLight.shadow.camera.top = 40;
        sunLight.shadow.camera.bottom = -40;
        sunLight.shadow.bias = -0.002;
        this.scene.add(sunLight);
        this.sunLight = sunLight;

        // Single fill light (removed rim light)
        const fillLight = new THREE.DirectionalLight(0xB3E5FC, 0.25);
        fillLight.position.set(-30, 40, -20);
        this.scene.add(fillLight);
    }

    setupSkybox(): void {
        // Gradient sky
        const skyGeo = new THREE.SphereGeometry(250, 20, 20);
        const skyMat = new THREE.ShaderMaterial({
            uniforms: {
                topColor: { value: new THREE.Color(0x0077ff) },
                bottomColor: { value: new THREE.Color(0x87CEEB) },
                horizonColor: { value: new THREE.Color(0xFFE0B2) },
                offset: { value: 20 },
                exponent: { value: 0.6 }
            },
            vertexShader: `
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 topColor;
                uniform vec3 bottomColor;
                uniform vec3 horizonColor;
                uniform float offset;
                uniform float exponent;
                varying vec3 vWorldPosition;
                void main() {
                    float h = normalize(vWorldPosition + offset).y;
                    float t = max(pow(max(h, 0.0), exponent), 0.0);
                    vec3 color;
                    if (h > 0.0) {
                        color = mix(horizonColor, topColor, t);
                    } else {
                        color = mix(horizonColor, bottomColor, -h * 2.0);
                    }
                    gl_FragColor = vec4(color, 1.0);
                }
            `,
            side: THREE.BackSide,
            depthWrite: false
        });
        const sky = new THREE.Mesh(skyGeo, skyMat);
        this.scene.add(sky);
        this.sky = sky;

        this.createClouds();
        this.createSunVisual();
    }

    createClouds(): void {
        this.clouds = [];
        const cloudMat = new THREE.MeshLambertMaterial({   // PERF: Lambert
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.8
        });

        const sharedBlobGeo = new THREE.BoxGeometry(1, 1, 1); // shared, scaled via group

        for (let i = 0; i < 12; i++) {   // PERF: 12 clouds (was 30)
            const cloud = new THREE.Group();

            const numBlobs = Utils.randomInt(2, 4);  // fewer blobs
            for (let b = 0; b < numBlobs; b++) {
                const sx = Utils.randomRange(4, 10);
                const sy = Utils.randomRange(1, 3);
                const sz = Utils.randomRange(3, 7);
                const blob = new THREE.Mesh(sharedBlobGeo, cloudMat);
                blob.scale.set(sx, sy, sz);
                blob.position.set(
                    Utils.randomRange(-4, 4),
                    Utils.randomRange(-0.5, 0.5),
                    Utils.randomRange(-3, 3)
                );
                cloud.add(blob);
            }

            cloud.position.set(
                Utils.randomRange(-180, 180),
                Utils.randomRange(50, 80),
                Utils.randomRange(-180, 180)
            );
            cloud.userData = {
                speed: Utils.randomRange(0.5, 1.5),
                baseX: cloud.position.x
            };

            this.scene.add(cloud);
            this.clouds.push(cloud);
        }
    }

    createSunVisual(): void {
        if (!this.sunLight) return;
        const sunGeo = new THREE.SphereGeometry(8, 12, 12);
        const sunMat = new THREE.MeshBasicMaterial({
            color: 0xFFF9C4,
            transparent: true,
            opacity: 0.9
        });
        const sun = new THREE.Mesh(sunGeo, sunMat);
        sun.position.copy(this.sunLight.position).multiplyScalar(3);
        this.scene.add(sun);

        const glowGeo = new THREE.SphereGeometry(15, 12, 12);
        const glowMat = new THREE.MeshBasicMaterial({
            color: 0xFFE082,
            transparent: true,
            opacity: 0.15
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        glow.position.copy(sun.position);
        this.scene.add(glow);
    }

    setupFog(): void {
        this.scene.fog = new THREE.FogExp2(0x87CEEB, 0.008);
    }

    setupAmbientParticles(): void {
        this.ambientParticles = [];
        const particleCount = 20;  // PERF: 20 (was 60)
        const geo = new THREE.BoxGeometry(0.06, 0.06, 0.06);
        const mats = [
            new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.3 }),
            new THREE.MeshBasicMaterial({ color: 0xFFF9C4, transparent: true, opacity: 0.3 })
        ];

        for (let i = 0; i < particleCount; i++) {
            const particle = new THREE.Mesh(geo, mats[i % 2]);
            particle.position.set(
                Utils.randomRange(-25, 25),
                Utils.randomRange(5, 20),
                Utils.randomRange(-25, 25)
            );
            particle.userData = {
                baseY: particle.position.y,
                speed: Utils.randomRange(0.3, 1),
                amplitude: Utils.randomRange(0.5, 2),
                phase: Math.random() * Math.PI * 2,
                driftX: Utils.randomRange(-0.3, 0.3),
                driftZ: Utils.randomRange(-0.3, 0.3)
            };
            this.scene.add(particle);
            this.ambientParticles.push(particle);
        }
    }

    setupInput(): void {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;

            if (e.code.startsWith('Digit') && this.state === 'playing') {
                const num = Number.parseInt(e.code.replace('Digit', ''));
                if (num >= 1 && num <= 9) {
                    this.building.selectSlot(num - 1);
                    this.ui.selectToolbarSlot(num - 1);
                }
            }

            if (e.code === 'KeyV' && this.state === 'playing') {
                this.cameraMode = this.cameraMode === 'third' ? 'first' : 'third';
                this.character.group.visible = this.cameraMode === 'third';
                this.ui.showNotification(
                    this.cameraMode === 'first' ? '📷 Primeira Pessoa' : '📷 Terceira Pessoa'
                );
            }

            if (e.code === 'Escape') {
                if (this.state === 'playing') this.pause();
                else if (this.state === 'paused') this.resume();
            }
        });

        document.addEventListener('keyup', (e) => { this.keys[e.code] = false; });

        document.addEventListener('mousemove', (e) => {
            if (this.isPointerLocked) {
                this.mouse.dx = e.movementX;
                this.mouse.dy = e.movementY;
            }
        });

        this.canvas.addEventListener('click', (e) => {
            if (this.state === 'playing') {
                if (this.isPointerLocked) {
                    if (e.shiftKey) {
                        this.handleBlockRemove();
                    } else {
                        this.handleBlockPlace();
                    }
                } else {
                    this.canvas.requestPointerLock();
                }
            }
        });

        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (this.state === 'playing' && this.isPointerLocked) this.handleBlockRemove();
        });

        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = document.pointerLockElement === this.canvas;
        });

        this.canvas.addEventListener('wheel', (e) => {
            if (this.state === 'playing' && this.cameraMode === 'third') {
                this.cameraDistance = Utils.clamp(this.cameraDistance + e.deltaY * 0.005, 2, 15);
            }
        });
    }

    handleBlockPlace(): void {
        if (this.building.placeBlock(this.camera, this.character, this.physics)) {
            const ghost = this.building.ghostBlock;
            this.audio.play('place');
            this.particles.emit(
                ghost.position.x,
                ghost.position.y,
                ghost.position.z,
                'block',
                this.world.blockTypes[this.building.selectedBlockType]?.color || 0xffffff,
                5
            );
        }
    }

    handleBlockRemove(): void {
        const removed = this.building.removeBlock(this.camera, this.character);
        if (removed) {
            this.audio.play('remove');
            this.particles.emit(removed.x, removed.y, removed.z, 'block', 0x888888, 8);
        }
    }

    setupMenuEvents(): void {
        document.getElementById('btn-play')?.addEventListener('click', () => this.startGame());

        document.getElementById('btn-settings')?.addEventListener('click', () => {
            this.getRequiredElement<HTMLElement>('settings-modal').style.display = 'block';
        });

        document.getElementById('btn-close-settings')?.addEventListener('click', () => {
            this.getRequiredElement<HTMLElement>('settings-modal').style.display = 'none';
            this.applySettings();
        });

        document.getElementById('pause-btn')?.addEventListener('click', () => this.pause());
        document.getElementById('btn-resume')?.addEventListener('click', () => this.resume());

        document.getElementById('btn-pause-settings')?.addEventListener('click', () => {
            this.getRequiredElement<HTMLElement>('settings-modal').style.display = 'block';
        });

        document.getElementById('btn-quit')?.addEventListener('click', () => this.quitToMenu());
    }

    applySettings(): void {
        const sens = Number((document.getElementById('sensitivity') as HTMLInputElement | null)?.value || '5');
        const quality = ((document.getElementById('quality') as HTMLSelectElement | null)?.value || 'medium') as GameSettings['quality'];
        const volume = Number((document.getElementById('volume') as HTMLInputElement | null)?.value || '70');
        const renderDist = Number((document.getElementById('render-distance') as HTMLInputElement | null)?.value || '150');

        this.sensitivity = sens * 0.0005;
        this.settings.quality = quality;
        this.settings.renderDistance = Math.floor(renderDist);
        this.audio.setVolume(volume / 100);

        switch (quality) {
            case 'low':
                this.renderer.setPixelRatio(1);
                this.renderer.shadowMap.enabled = false;
                break;
            case 'medium':
                this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
                this.renderer.shadowMap.enabled = true;
                break;
            case 'high':
                this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                this.renderer.shadowMap.enabled = true;
                break;
        }

        if (this.scene.fog) {
            (this.scene.fog as THREE.FogExp2).density = 1 / (this.settings.renderDistance * 1.5);
        }
    }

    async load(): Promise<void> {
        const loadingBar = document.getElementById('loading-bar');
        const loadingText = document.getElementById('loading-text');

        const setProgress = (pct: number, text: string): void => {
            if (loadingBar) loadingBar.style.width = pct + '%';
            if (loadingText) loadingText.textContent = text;
        };

        setProgress(10, 'Preparando o mundo da família... 🌟');
        await this.sleep(200);

        this.world = new World(this.scene);

        setProgress(20, 'Construindo o terreno... 🌳');
        await this.sleep(100);

        this.world.generate((progress, msg) => {
            setProgress(20 + progress * 50, msg);
        });

        setProgress(75, 'Preparando seu personagem... 🎮');
        await this.sleep(100);

        this.character = new Character(this.scene);
        this.physics = new Physics(this.world);
        this.building = new BuildingSystem(this.world, this.scene);

        setProgress(85, 'Trazendo a família... 👨‍👩‍👧‍👧');
        await this.sleep(100);

        this.entities = new EntitySystem(this.scene, this.world);
        this.entities.spawnCoins(30);
        this.entities.spawnNPCs();      // Family + generic NPCs

        this.particles = new ParticleSystem(this.scene);

        setProgress(95, 'Quase lá... 💖');
        await this.sleep(200);

        const spawnY = this.world.getGroundHeight(0, 0);
        this.character.position.set(0, spawnY + 3, 0);

        setProgress(100, 'Pronto!');
        await this.sleep(500);

        this.getRequiredElement<HTMLElement>('loading-screen').style.display = 'none';
        this.getRequiredElement<HTMLElement>('main-menu').style.display = 'flex';
        this.state = 'menu';

        this.camera.position.set(0, 30, 40);
        this.camera.lookAt(0, 5, 0);
        this.renderLoop();
    }

    sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    startGame(): void {
        this.getRequiredElement<HTMLElement>('main-menu').style.display = 'none';
        this.getRequiredElement<HTMLElement>('game-hud').style.display = 'block';
        this.state = 'playing';

        this.audio.init();
        this.audio.playMusic();
        this.ui.initToolbar(this.building.toolbarBlocks, this.world.blockTypes);

        this.ui.addChatMessage('🌟 Bem-vindo ao MaFe & Juju World!', 'system');
        this.ui.addChatMessage('👨‍👩‍👧‍👧 Um jogo da Família Padilha!', 'system');
        this.ui.addChatMessage('Use WASD para mover, ESPAÇO para pular', 'system');
        this.ui.addChatMessage('Click para colocar blocos, SHIFT+Click para remover', 'system');
        this.ui.addChatMessage('Encontre o Papai Flávio, Mamãe Ana Paula, MaFe e Juju! 💕', 'system');
        this.ui.showNotification('💖 Família Padilha Unida!');

        this.canvas.requestPointerLock();
    }

    pause(): void {
        this.state = 'paused';
        this.getRequiredElement<HTMLElement>('pause-menu').style.display = 'block';
        document.exitPointerLock();
    }

    resume(): void {
        this.state = 'playing';
        this.getRequiredElement<HTMLElement>('pause-menu').style.display = 'none';
        this.getRequiredElement<HTMLElement>('settings-modal').style.display = 'none';
        this.canvas.requestPointerLock();
    }

    quitToMenu(): void {
        this.state = 'menu';
        this.getRequiredElement<HTMLElement>('pause-menu').style.display = 'none';
        this.getRequiredElement<HTMLElement>('game-hud').style.display = 'none';
        this.getRequiredElement<HTMLElement>('main-menu').style.display = 'flex';
        document.exitPointerLock();
        this.camera.position.set(0, 30, 40);
        this.camera.lookAt(0, 5, 0);
    }

    renderLoop(): void {
        requestAnimationFrame(() => this.renderLoop());

        const dt = Math.min(this.clock.getDelta(), 0.05);

        if (this.state === 'playing') {
            this.update(dt);
        } else if (this.state === 'menu') {
            const time = performance.now() * 0.0001;
            this.camera.position.x = Math.sin(time) * 50;
            this.camera.position.z = Math.cos(time) * 50;
            this.camera.position.y = 35 + Math.sin(time * 2) * 5;
            this.camera.lookAt(0, 5, 0);
        }

        // Update clouds always (cheap)
        this.updateClouds(dt);

        // Subtle water wave animation (just move the plane Y slightly)
        if (this.world?.waterPlane) {
            const waveTime = performance.now() * 0.001;
            this.world.waterPlane.position.y = this.world.waterLevel + 0.4 + Math.sin(waveTime * 1.5) * 0.08;
        }

        // Ambient particles (cheap)
        this.updateAmbientParticles(dt);

        this.renderer.render(this.scene, this.camera);
    }

    updateAmbientParticles(dt: number): void {
        if (!this.ambientParticles) return;
        const time = performance.now() * 0.001;
        const playerPos = this.character ? this.character.position : new THREE.Vector3(0, 10, 0);

        for (const p of this.ambientParticles) {
            const data = p.userData;
            p.position.y = data.baseY + Math.sin(time * data.speed + data.phase) * data.amplitude;
            p.position.x += data.driftX * dt;
            p.position.z += data.driftZ * dt;

            const dx = p.position.x - playerPos.x;
            const dz = p.position.z - playerPos.z;
            if (Math.abs(dx) > 30) p.position.x = playerPos.x - Math.sign(dx) * 30;
            if (Math.abs(dz) > 30) p.position.z = playerPos.z - Math.sign(dz) * 30;
        }
    }

    update(dt: number): void {
        this.processInput(dt);
        this.physics.update(this.character, dt);

        this.updateStepSounds(dt);

        if (this.character.onGround && !this.wasOnGround) {
            this.audio.play('land');
            this.particles.emitLand(
                this.character.position.x,
                this.character.position.y,
                this.character.position.z
            );
        }
        this.wasOnGround = this.character.onGround;

        const isMoving = this.keys['KeyW'] || this.keys['KeyA'] || this.keys['KeyS'] || this.keys['KeyD'];
        this.character.animate(dt, isMoving);
        this.updateCamera(dt);
        this.building.updateGhost(this.camera, this.character);

        const entityResult = this.entities.update(dt, this.character.position);
        const coinsCollected = entityResult.coinsCollected;
        if (coinsCollected > 0) {
            for (let i = 0; i < coinsCollected; i++) {
                const leveled = this.character.collectCoin();
                this.audio.play('coin');
                this.particles.emitCoinCollect(
                    this.character.position.x,
                    this.character.position.y + 1,
                    this.character.position.z
                );
                this.ui.updateCoins(this.character.coins);
                if (leveled) {
                    this.audio.play('achievement');
                    this.ui.updateLevel(this.character.level);
                    this.ui.showNotification(`🎉 Nível ${this.character.level}!`);
                    this.ui.addChatMessage(`🏆 Você alcançou o Nível ${this.character.level}!`, 'achievement');
                }
            }
        }

        if (entityResult.dialogues) {
            entityResult.dialogues.forEach(msg => {
                this.ui.addChatMessage(`NPC: ${msg}`, 'normal');
            });
        }

        this.particles.update(dt);

        this.ui.updateHealth(this.character.health, this.character.maxHealth);
        this.ui.updateFPS(dt);
        this.ui.updatePosition(
            this.character.position.x,
            this.character.position.y,
            this.character.position.z
        );

        if (Math.random() < 0.05) {
            this.ui.updateMinimap(this.character.position, this.world);
        }

        this.mouse.dx = 0;
        this.mouse.dy = 0;
    }

    processInput(_dt: number): void {
        if (!this.isPointerLocked) {
            return;
        }

        this.cameraYaw -= this.mouse.dx * this.sensitivity;
        this.cameraPitch += this.mouse.dy * this.sensitivity;
        this.cameraPitch = Utils.clamp(this.cameraPitch, -0.8, 1.2);

        const forward = new THREE.Vector3(
            -Math.sin(this.cameraYaw), 0, -Math.cos(this.cameraYaw)
        );
        const right = new THREE.Vector3(
            Math.cos(this.cameraYaw), 0, -Math.sin(this.cameraYaw)
        );

        const moveDir = new THREE.Vector3(0, 0, 0);
        if (this.keys['KeyW']) moveDir.add(forward);
        if (this.keys['KeyS']) moveDir.sub(forward);
        if (this.keys['KeyA']) moveDir.sub(right);
        if (this.keys['KeyD']) moveDir.add(right);

        if (moveDir.length() > 0) moveDir.normalize();

        this.character.isSprinting = this.keys['ShiftLeft'] || this.keys['ShiftRight'];
        const speed = this.character.speed * (this.character.isSprinting ? this.character.sprintMultiplier : 1);

        this.character.velocity.x = moveDir.x * speed;
        this.character.velocity.z = moveDir.z * speed;

        if (moveDir.length() > 0) {
            this.character.rotation.y = Math.atan2(moveDir.x, moveDir.z);
        }

        if (this.keys['Space'] && this.character.onGround) {
            this.character.velocity.y = this.character.jumpForce;
            this.character.hasDoubleJumped = false;
            this.audio.play('jump');
            this.particles.emitJump(
                this.character.position.x,
                this.character.position.y,
                this.character.position.z
            );
        } else if (this.keys['Space'] && !this.character.onGround && !this.character.hasDoubleJumped && this.character.canDoubleJump) {
            this.character.velocity.y = this.character.jumpForce * 0.8;
            this.character.hasDoubleJumped = true;
            this.keys['Space'] = false;
            this.audio.play('jump');
            this.particles.emitJump(
                this.character.position.x,
                this.character.position.y,
                this.character.position.z
            );
        }
    }

    updateCamera(_dt: number): void {
        const charPos = this.character.position.clone();
        charPos.y += 1.5; // head height

        if (this.cameraMode === 'first') {
            this.camera.position.copy(charPos);
            this.camera.position.y += this.character.headBob;
            const lookDir = new THREE.Vector3(
                -Math.sin(this.cameraYaw) * Math.cos(this.cameraPitch),
                Math.sin(this.cameraPitch),
                -Math.cos(this.cameraYaw) * Math.cos(this.cameraPitch)
            );
            this.camera.lookAt(this.camera.position.clone().add(lookDir));
        } else {
            // Third-person camera (Roblox-style): orbit behind/above player,
            // looking at the character. Building raycast skips past character.
            const horizDist = this.cameraDistance * Math.cos(this.cameraPitch);
            const vertDist = this.cameraDistance * Math.sin(this.cameraPitch) + this.cameraHeight;

            const camX = charPos.x + Math.sin(this.cameraYaw) * horizDist;
            const camY = charPos.y + vertDist;
            const camZ = charPos.z + Math.cos(this.cameraYaw) * horizDist;

            const idealPos = new THREE.Vector3(camX, camY, camZ);

            // Ground collision: camera must not go below terrain + 1.5
            if (this.world) {
                const cx = Math.floor(idealPos.x);
                const cz = Math.floor(idealPos.z);
                let maxGroundY = 1;
                for (let cy = 30; cy >= 0; cy--) {
                    if (this.world.getBlock(cx, cy, cz)) {
                        maxGroundY = cy + 1.5;
                        break;
                    }
                }
                if (idealPos.y < maxGroundY) {
                    idealPos.y = maxGroundY;
                }
            }

            this.cameraSmoothPos.lerp(idealPos, 0.25);
            this.camera.position.copy(this.cameraSmoothPos);

            // Look directly at the character (classic third-person)
            this.cameraTarget.lerp(charPos, 0.3);
            this.camera.lookAt(this.cameraTarget);
        }

        if (this.sunLight) {
            this.sunLight.position.set(charPos.x + 50, 80, charPos.z + 30);
            this.sunLight.target.position.copy(charPos);
            this.sunLight.target.updateMatrixWorld();
        }
    }

    updateStepSounds(dt: number): void {
        const isMoving = this.keys['KeyW'] || this.keys['KeyA'] || this.keys['KeyS'] || this.keys['KeyD'];
        if (isMoving && this.character.onGround) {
            this.stepTimer += dt;
            const interval = this.character.isSprinting ? this.stepInterval * 0.6 : this.stepInterval;
            if (this.stepTimer >= interval) {
                this.stepTimer = 0;
                this.audio.play(Math.random() > 0.5 ? 'step1' : 'step2');
            }
        } else {
            this.stepTimer = this.stepInterval;
        }
    }

    updateClouds(_dt: number): void {
        if (!this.clouds) return;
        const time = performance.now() * 0.001;
        for (const cloud of this.clouds) {
            cloud.position.x = cloud.userData.baseX + time * cloud.userData.speed;
            if (cloud.position.x > 200) {
                cloud.position.x = -200;
                cloud.userData.baseX = -200 - time * cloud.userData.speed;
            }
        }
    }
}

// ============================================
// START GAME
// ============================================
globalThis.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.init();
    (globalThis as Window & typeof globalThis & { game?: Game }).game = game;
});
