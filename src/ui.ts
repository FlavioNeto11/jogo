// ============================================
// UI SYSTEM
// ============================================
import type { BlockType, Vec3 } from './types';
import type { IWorldQuery } from './types';

export class UISystem {
    toolbarSlots: HTMLElement | null;
    healthBar: HTMLElement | null;
    healthText: HTMLElement | null;
    coinCount: HTMLElement | null;
    levelText: HTMLElement | null;
    fpsCounter: HTMLElement | null;
    positionDisplay: HTMLElement | null;
    chatMessages: HTMLElement | null;
    notificationEl: HTMLElement | null;
    notificationText: HTMLElement | null;
    minimapCanvas: HTMLCanvasElement | null;
    minimapCtx: CanvasRenderingContext2D | null;
    notifTimer: ReturnType<typeof setTimeout> | null;
    fpsFrames: number;
    fpsTime: number;
    currentFPS: number;

    constructor() {
        this.toolbarSlots = document.getElementById('toolbar-slots');
        this.healthBar = document.getElementById('health-bar');
        this.healthText = document.getElementById('health-text');
        this.coinCount = document.getElementById('coin-count');
        this.levelText = document.getElementById('level-text');
        this.fpsCounter = document.getElementById('fps-counter');
        this.positionDisplay = document.getElementById('position-display');
        this.chatMessages = document.getElementById('chat-messages');
        this.notificationEl = document.getElementById('notification');
        this.notificationText = document.getElementById('notification-text');
        this.minimapCanvas = document.getElementById('minimap-canvas') as HTMLCanvasElement | null;
        this.minimapCtx = this.minimapCanvas ? this.minimapCanvas.getContext('2d') : null;

        this.notifTimer = null;
        this.fpsFrames = 0;
        this.fpsTime = 0;
        this.currentFPS = 60;
    }

    initToolbar(blocks: string[], blockTypes: Record<string, BlockType>) {
        if (!this.toolbarSlots) return;
        const toolbar = this.toolbarSlots;
        toolbar.innerHTML = '';

        blocks.forEach((blockKey, index) => {
            const slot = document.createElement('div');
            slot.className = 'toolbar-slot' + (index === 0 ? ' active' : '');
            slot.dataset.index = String(index);

            const number = document.createElement('span');
            number.className = 'slot-number';
            number.textContent = String(index + 1);

            const block = document.createElement('div');
            block.className = 'slot-block';

            const type = blockTypes[blockKey];
            if (type) {
                const color = '#' + type.color.toString(16).padStart(6, '0');
                const topColor = type.topColor ? '#' + type.topColor.toString(16).padStart(6, '0') : color;
                block.style.background = `linear-gradient(135deg, ${topColor}, ${color})`;

                if (type.emissive) {
                    block.style.boxShadow = `0 0 10px ${color}`;
                }
            }

            const name = document.createElement('span');
            name.className = 'slot-name';
            name.textContent = type ? type.name : blockKey;

            slot.appendChild(number);
            slot.appendChild(block);
            slot.appendChild(name);

            slot.addEventListener('click', () => {
                document.querySelectorAll('.toolbar-slot').forEach(s => s.classList.remove('active'));
                slot.classList.add('active');
                const game = (globalThis as Window & typeof globalThis & { game?: { building?: { selectSlot: (idx: number) => void } } }).game;
                if (game?.building) {
                    game.building.selectSlot(index);
                }
            });

            toolbar.appendChild(slot);
        });
    }

    selectToolbarSlot(index: number): void {
        const slots = document.querySelectorAll('.toolbar-slot');
        slots.forEach(s => s.classList.remove('active'));
        if (slots[index]) slots[index].classList.add('active');
    }

    updateHealth(health: number, maxHealth: number): void {
        if (this.healthBar) {
            const pct = (health / maxHealth) * 100;
            this.healthBar.style.width = pct + '%';

            if (pct > 60) {
                this.healthBar.style.background = 'linear-gradient(90deg, #2ecc71, #27ae60)';
            } else if (pct > 30) {
                this.healthBar.style.background = 'linear-gradient(90deg, #f39c12, #e67e22)';
            } else {
                this.healthBar.style.background = 'linear-gradient(90deg, #e74c3c, #c0392b)';
            }
        }
        if (this.healthText) this.healthText.textContent = String(Math.floor(health));
    }

    updateCoins(count: number): void {
        if (this.coinCount) {
            this.coinCount.textContent = String(count);
            // Animate
            this.coinCount.style.transform = 'scale(1.3)';
            setTimeout(() => {
                if (this.coinCount) this.coinCount.style.transform = 'scale(1)';
            }, 150);
        }
    }

    updateLevel(level: number): void {
        if (this.levelText) this.levelText.textContent = `Nível ${level}`;
    }

    updateFPS(dt: number): void {
        this.fpsFrames++;
        this.fpsTime += dt;
        if (this.fpsTime >= 0.5) {
            this.currentFPS = Math.round(this.fpsFrames / this.fpsTime);
            this.fpsFrames = 0;
            this.fpsTime = 0;
            if (this.fpsCounter) {
                this.fpsCounter.textContent = `${this.currentFPS} FPS`;
                this.fpsCounter.style.color = this.getFPSColor(this.currentFPS);
            }
        }
    }

    getFPSColor(fps: number): string {
        if (fps >= 50) return '#2ecc71';
        if (fps >= 30) return '#f39c12';
        return '#e74c3c';
    }

    updatePosition(x: number, y: number, z: number): void {
        if (this.positionDisplay) {
            this.positionDisplay.textContent = `X: ${Math.round(x)} Y: ${Math.round(y)} Z: ${Math.round(z)}`;
        }
    }

    addChatMessage(text: string, type = 'normal'): void {
        if (!this.chatMessages) return;

        const msg = document.createElement('div');
        msg.className = `chat-msg ${type}`;
        msg.textContent = text;
        this.chatMessages.appendChild(msg);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;

        // Auto-remove after 10 seconds
        setTimeout(() => {
            msg.style.opacity = '0';
            msg.style.transition = 'opacity 1s';
            setTimeout(() => msg.remove(), 1000);
        }, 10000);
    }

    showNotification(text: string, duration = 3000): void {
        if (this.notifTimer) clearTimeout(this.notifTimer);

        if (this.notificationEl && this.notificationText) {
            const notificationEl = this.notificationEl;
            this.notificationText.textContent = text;
            notificationEl.style.display = 'block';

            this.notifTimer = setTimeout(() => {
                notificationEl.style.display = 'none';
            }, duration);
        }
    }

    drawMinimapBlock(ctx: CanvasRenderingContext2D, world: IWorldQuery, wx: number, wz: number, screenX: number, screenY: number, scale: number): void {
        const gy = world.getGroundHeight(wx, wz);
        if (gy < 0) return;

        const block = world.getBlock(wx, gy, wz);
        if (!block) return;

        const type = world.blockTypes[block];
        ctx.fillStyle = type ? '#' + type.color.toString(16).padStart(6, '0') : '#555';
        ctx.fillRect(screenX, screenY, scale, scale);
    }

    updateMinimap(playerPos: Vec3, world: IWorldQuery): void {
        if (!this.minimapCtx || !this.minimapCanvas) return;

        const ctx = this.minimapCtx;
        const canvas = this.minimapCanvas;
        const w = canvas.width;
        const h = canvas.height;
        const scale = 2; // pixels per block

        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, w, h);

        const centerX = w / 2;
        const centerY = h / 2;
        const px = Math.round(playerPos.x);
        const pz = Math.round(playerPos.z);
        const viewRadius = Math.floor(w / (2 * scale));

        for (let dx = -viewRadius; dx <= viewRadius; dx++) {
            for (let dz = -viewRadius; dz <= viewRadius; dz++) {
                this.drawMinimapBlock(
                    ctx, world, px + dx, pz + dz,
                    centerX + dx * scale, centerY + dz * scale, scale
                );
            }
        }

        // Player dot
        ctx.fillStyle = '#e94560';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
        ctx.fill();

        // Player direction
        ctx.strokeStyle = '#e94560';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        // Would need player rotation here
        ctx.stroke();

        // Border
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, w, h);
    }
}
