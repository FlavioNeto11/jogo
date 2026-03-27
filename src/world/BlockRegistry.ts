// ============================================
// BLOCK REGISTRY — Sprint 4
// ============================================
import type { BlockType } from '../types';

export interface BlockDefinition {
    id: number;
    key: string;
    name: string;
    color: number;
    topColor?: number;
    transparent: boolean;
    solid: boolean;
    opacity?: number;
    emissive?: number;
    emissiveIntensity?: number;
}

export const BLOCK_AIR = 0;

export class BlockRegistry {
    private blocks = new Map<number, BlockDefinition>();
    private keyToId = new Map<string, number>();

    constructor() {
        this.registerDefaults();
    }

    private registerDefaults(): void {
        const defs: BlockDefinition[] = [
            { id: 1,  key: 'grass',         name: 'Grama',          color: 0x4CAF50, transparent: false, solid: true },
            { id: 2,  key: 'dirt',          name: 'Terra',          color: 0x8D6E63, transparent: false, solid: true },
            { id: 3,  key: 'stone',         name: 'Pedra',          color: 0x9E9E9E, transparent: false, solid: true },
            { id: 4,  key: 'cobblestone',   name: 'Paralelepípedo', color: 0x757575, transparent: false, solid: true },
            { id: 5,  key: 'sand',          name: 'Areia',          color: 0xFFF176, transparent: false, solid: true },
            { id: 6,  key: 'water',         name: 'Água',           color: 0x29B6F6, transparent: true,  solid: false, opacity: 0.55 },
            { id: 7,  key: 'wood',          name: 'Madeira',        color: 0x795548, transparent: false, solid: true },
            { id: 8,  key: 'leaves',        name: 'Folhas',         color: 0x2E7D32, transparent: true,  solid: true, opacity: 0.9 },
            { id: 9,  key: 'planks',        name: 'Tábuas',         color: 0xBCAAA4, transparent: false, solid: true },
            { id: 10, key: 'brick',         name: 'Tijolo',         color: 0xC62828, transparent: false, solid: true },
            { id: 11, key: 'glass',         name: 'Vidro',          color: 0xB3E5FC, transparent: true,  solid: true, opacity: 0.35 },
            { id: 12, key: 'gold',          name: 'Ouro',           color: 0xFFD600, transparent: false, solid: true },
            { id: 13, key: 'snow',          name: 'Neve',           color: 0xFAFAFA, transparent: false, solid: true },
            { id: 14, key: 'flower_red',    name: 'Flor Vermelha',  color: 0xE53935, transparent: true,  solid: false },
            { id: 15, key: 'flower_yellow', name: 'Flor Amarela',   color: 0xFFEB3B, transparent: true,  solid: false },
            { id: 16, key: 'neon_pink',     name: 'Neon Rosa',      color: 0xFF4081, transparent: false, solid: true, emissive: 0xFF4081, emissiveIntensity: 0.5 },
            { id: 17, key: 'neon_blue',     name: 'Neon Azul',      color: 0x40C4FF, transparent: false, solid: true, emissive: 0x40C4FF, emissiveIntensity: 0.5 },
            { id: 18, key: 'roof',          name: 'Telhado',        color: 0xD32F2F, transparent: false, solid: true },
        ];
        for (const def of defs) this.register(def);
    }

    register(def: BlockDefinition): void {
        this.blocks.set(def.id, def);
        this.keyToId.set(def.key, def.id);
    }

    getById(id: number): BlockDefinition | undefined {
        return this.blocks.get(id);
    }

    getByKey(key: string): BlockDefinition | undefined {
        const id = this.keyToId.get(key);
        return id !== undefined ? this.blocks.get(id) : undefined;
    }

    getId(key: string): number {
        return this.keyToId.get(key) ?? BLOCK_AIR;
    }

    /** A block is opaque if it is solid and not transparent */
    isOpaque(id: number): boolean {
        if (id === BLOCK_AIR) return false;
        const def = this.blocks.get(id);
        return def !== undefined && def.solid && !def.transparent;
    }

    isSolid(id: number): boolean {
        if (id === BLOCK_AIR) return false;
        const def = this.blocks.get(id);
        return def !== undefined && def.solid;
    }

    /** Backward-compatible Record<key, BlockType> for UI and legacy code */
    toBlockTypes(): Record<string, BlockType> {
        const result: Record<string, BlockType> = {};
        for (const def of this.blocks.values()) {
            result[def.key] = {
                color: def.color,
                name: def.name,
                transparent: def.transparent,
                opacity: def.opacity,
                emissive: def.emissive,
                emissiveIntensity: def.emissiveIntensity,
            };
        }
        return result;
    }
}
