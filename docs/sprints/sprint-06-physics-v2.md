# Sprint 6 — Physics Engine v2

> **Agente:** `@physics`
> **Duração estimada:** 2-3 sessões de Copilot
> **Pré-requisito:** Sprint 4 (Chunks) — para acesso eficiente a blocos
> **Resultado:** Física robusta com broadphase, DDA raycasting, e trigger volumes

---

## Objetivo

Substituir a física AABB simples por um engine de física com spatial hashing para broadphase, DDA raycasting (mais rápido e preciso), e trigger volumes para áreas de efeito.

---

## Passo a Passo

### Passo 1 — Criar AABB.ts como módulo independente

```text
Agente: @physics
Prompt: Crie src/physics/AABB.ts
Classe AABB com métodos: overlap, contains, expand, intersectsRay.
Todas as operações devem ser allocation-free (reusar objetos).
```

**Estrutura:**

```typescript
export class AABB {
  minX: number; minY: number; minZ: number;
  maxX: number; maxY: number; maxZ: number;
  
  set(minX, minY, minZ, maxX, maxY, maxZ): this;
  overlaps(other: AABB): boolean;
  contains(x: number, y: number, z: number): boolean;
  expand(dx: number, dy: number, dz: number): AABB; // retorna nova
  clipMovement(other: AABB, axis: 'x'|'y'|'z', movement: number): number;
}
```

---

### Passo 2 — Criar SpatialHash para broadphase

```text
Agente: @physics
Prompt: Crie src/physics/SpatialHash.ts
Grid espacial com células de tamanho configurável (default: 16).
Suporta insert, remove, query por AABB.
```

**Estrutura:**

```typescript
export class SpatialHash<T> {
  private cellSize: number;
  private cells: Map<string, Set<T>>;
  
  constructor(cellSize?: number);
  
  insert(item: T, aabb: AABB): void;
  remove(item: T, aabb: AABB): void;
  query(aabb: AABB): Set<T>;
  clear(): void;
  
  private cellKey(cx: number, cy: number, cz: number): string;
  private getCells(aabb: AABB): Array<string>;
}
```

---

### Passo 3 — Implementar DDA Raycasting

```text
Agente: @physics
Prompt: Crie src/physics/Raycast.ts
Implementa DDA (Digital Differential Analyzer) para raycasting em voxel grid.
Muito mais rápido e preciso que o step-based atual.
```

**Algoritmo DDA:**

```typescript
export interface RaycastHit {
  blockX: number;
  blockY: number;
  blockZ: number;
  normal: { x: number; y: number; z: number };
  distance: number;
  blockType: number;
}

export function raycastVoxel(
  originX: number, originY: number, originZ: number,
  dirX: number, dirY: number, dirZ: number,
  maxDistance: number,
  getBlock: (x: number, y: number, z: number) => number
): RaycastHit | null {
  // DDA: step through voxels along the ray
  // Much more efficient than current step-by-0.1 approach
}
```

**Vantagens sobre o atual:**
- Nunca pula blocos (o step=0.1 atual pode pular blocos finos)
- Retorna normal da face atingida
- ~10x mais rápido

---

### Passo 4 — Refatorar PhysicsEngine

```text
Agente: @physics
Prompt: Refatore src/physics/PhysicsEngine.ts
Use AABB.ts e SpatialHash.ts.
Separe a lógica em: integrate → broadphase → narrowphase → resolve.
```

**Pipeline:**

```typescript
export class PhysicsEngine {
  update(entities: PhysicsBody[], dt: number): void {
    // 1. Integrate: apply gravity, update velocities
    this.integrate(entities, dt);
    
    // 2. For each entity, sweep against voxel world
    for (const entity of entities) {
      this.sweepAndResolve(entity, dt);
    }
    
    // 3. Entity-entity collision (NPCs, player)
    this.resolveEntityCollisions(entities);
    
    // 4. Trigger volumes
    this.checkTriggers(entities);
  }
}
```

---

### Passo 5 — Trigger Volumes

```text
Agente: @physics
Prompt: Adicione trigger volumes ao PhysicsEngine.
Áreas invisíveis que disparam eventos quando o jogador entra/sai.
```

**Uso:** Detectar quando jogador está perto de NPC, em água, em zona de quest.

```typescript
export interface TriggerVolume {
  aabb: AABB;
  onEnter?: (entity: PhysicsBody) => void;
  onExit?: (entity: PhysicsBody) => void;
  onStay?: (entity: PhysicsBody) => void;
}
```

---

### Passo 6 — Integrar com Game

```text
Agente: @physics + @engine
Prompt: Integre o novo PhysicsEngine no game loop.
Substitua o Physics antigo.
Teste colisão, raycasting (building), e triggers.
```

**Teste crítico:**
- Andar no terreno sem passar por blocos
- Pular e cair com gravidade correta
- Colocar/remover blocos com o novo DDA raycast
- Andar na água com slow-down
- NPCs colisão com terreno

---

## Checklist de Conclusão

- [ ] `AABB.ts` com operações allocation-free
- [ ] `SpatialHash.ts` genérico para broadphase
- [ ] `Raycast.ts` com DDA algorithm
- [ ] `PhysicsEngine.ts` com pipeline completo
- [ ] Trigger volumes implementados
- [ ] Integrado no game loop
- [ ] Colisão sólida (sem passar por blocos)
- [ ] Raycasting preciso (building funciona)
- [ ] Performance: < 1ms para physics por frame
