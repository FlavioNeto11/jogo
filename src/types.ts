import type * as THREE from 'three';

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface AABB {
  min: Vec3;
  max: Vec3;
}

export interface BlockType {
  color: number;
  name: string;
  topColor?: number;
  emissive?: number;
  emissiveIntensity?: number;
  transparent?: boolean;
  opacity?: number;
  depthWrite?: boolean;
  side?: number;
}

export interface RaycastHit {
  position: Vec3;
  block: string;
  placePosition: Vec3;
}

export interface ParticleData {
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  gravity: number;
  rotSpeed: THREE.Vector3;
}

export interface EntityUpdateResult {
  coinsCollected: number;
  dialogues: string[];
}

export interface GameSettings {
  quality: 'low' | 'medium' | 'high';
  sensitivity: number;
  volume: number;
  renderDistance: number;
}

export type GameState = 'loading' | 'menu' | 'playing' | 'paused';
