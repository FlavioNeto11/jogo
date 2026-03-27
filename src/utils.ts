// ============================================
// UTILITIES
// ============================================
import type { Vec3 } from './types';

const Utils = {
    lerp(a: number, b: number, t: number): number {
        return a + (b - a) * t;
    },

    clamp(val: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, val));
    },

    randomRange(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    },

    randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    distance3D(a: Vec3, b: Vec3): number {
        return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
    },

    hexToRgb(hex: string): { r: number; g: number; b: number } | null {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: Number.parseInt(result[1], 16) / 255,
            g: Number.parseInt(result[2], 16) / 255,
            b: Number.parseInt(result[3], 16) / 255
        } : null;
    },

    easeOutCubic(t: number): number {
        return 1 - Math.pow(1 - t, 3);
    },

    easeInOutQuad(t: number): number {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    },

    // Hash-based noise for terrain (returns 0 to 1)
    noise2D(x: number, z: number): number {
        const n = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
        return n - Math.floor(n);
    },

    // Better noise with octaves
    fbm(x: number, z: number, octaves = 4, lacunarity = 2, gain = 0.5): number {
        let value = 0;
        let amplitude = 1;
        let frequency = 1;
        let maxValue = 0;

        for (let i = 0; i < octaves; i++) {
            value += amplitude * this.smoothNoise(x * frequency, z * frequency);
            maxValue += amplitude;
            amplitude *= gain;
            frequency *= lacunarity;
        }

        return value / maxValue;
    },

    smoothNoise(x: number, z: number): number {
        const ix = Math.floor(x);
        const iz = Math.floor(z);
        const fx = x - ix;
        const fz = z - iz;

        const a = this.noise2D(ix, iz);
        const b = this.noise2D(ix + 1, iz);
        const c = this.noise2D(ix, iz + 1);
        const d = this.noise2D(ix + 1, iz + 1);

        const ux = fx * fx * (3 - 2 * fx);
        const uz = fz * fz * (3 - 2 * fz);

        return this.lerp(this.lerp(a, b, ux), this.lerp(c, d, ux), uz);
    },

    // Color helpers
    brightenColor(hex: string, percent: number): string {
        const rgb = this.hexToRgb(hex);
        if (!rgb) return hex;
        const r = Math.min(255, Math.floor(rgb.r * 255 * (1 + percent / 100)));
        const g = Math.min(255, Math.floor(rgb.g * 255 * (1 + percent / 100)));
        const b = Math.min(255, Math.floor(rgb.b * 255 * (1 + percent / 100)));
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
};

export default Utils;
