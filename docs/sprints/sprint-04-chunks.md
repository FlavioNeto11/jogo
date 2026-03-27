# Sprint 4 — Sistema de Chunks + Streaming

> **Agente:** `@world-builder` + `@engine`
> **Duração estimada:** 4-5 sessões de Copilot
> **Pré-requisito:** Sprint 3 (Three.js r170+)
> **Resultado:** Mundo "infinito" com chunks que carregam/descarregam dinamicamente

---

## Objetivo

Substituir o mundo fixo 64×64 por um sistema de chunks 16×16×256 que carrega e descarrega conforme o jogador se move, permitindo mundos efetivamente infinitos.

---

## Conceitos

### Chunk

- Unidade de terreno: 16×16 colunas, até 256 blocos de altura
- Armazenamento: `Uint8Array(16 * 16 * 256)` — 65.536 bytes por chunk
- Block ID 0 = ar, IDs 1-255 = tipos de bloco
- Coordenada do chunk: `chunkX = Math.floor(worldX / 16)`, `chunkZ = Math.floor(worldZ / 16)`

### Streaming

- Raio de renderização: 8 chunks (configurável)
- Chunks fora do raio + buffer de 2: descarregados
- Geração é lazy: chunk só é gerado quando necessário
- Cache LRU: mantém N chunks recentes em memória

---

## Passo a Passo

### Passo 1 — Criar BlockRegistry

```text
Agente: @world-builder
Prompt: Crie src/world/BlockRegistry.ts
Define todos os tipos de bloco com IDs numéricos.
Migre os blockTypes atuais de World.
```

**Estrutura:**

```typescript
export interface BlockDefinition {
  id: number;
  key: string;
  name: string;
  color: number;
  topColor?: number;
  transparent: boolean;
  solid: boolean;  // false para ar, água, flores
  emissive?: number;
  emissiveIntensity?: number;
}

export class BlockRegistry {
  private blocks: Map<number, BlockDefinition>;
  private keyToId: Map<string, number>;
  
  register(def: BlockDefinition): void;
  getById(id: number): BlockDefinition | undefined;
  getByKey(key: string): BlockDefinition | undefined;
  getId(key: string): number;
}
```

---

### Passo 2 — Criar Chunk class

```text
Agente: @world-builder
Prompt: Crie src/world/Chunk.ts
Um chunk armazena 16×16×256 blocos em Uint8Array.
Inclua getBlock, setBlock, e helper para coordenadas locais.
```

**Estrutura:**

```typescript
export class Chunk {
  readonly chunkX: number;
  readonly chunkZ: number;
  readonly data: Uint8Array; // 16*16*256
  isDirty: boolean;
  mesh: THREE.Group | null;
  
  constructor(chunkX: number, chunkZ: number);
  
  private index(localX: number, y: number, localZ: number): number;
  getBlock(localX: number, y: number, localZ: number): number;
  setBlock(localX: number, y: number, localZ: number, blockId: number): void;
  getHighestBlock(localX: number, localZ: number): number;
}
```

**Key:** `index = localX + localZ * 16 + y * 16 * 16`

---

### Passo 3 — Criar TerrainGenerator

```text
Agente: @world-builder
Prompt: Crie src/world/TerrainGenerator.ts
Extraia a lógica de geração de terreno do World atual.
Use seed-based noise para geração determinística.
Gere chunk por chunk.
```

**Estrutura:**

```typescript
export class TerrainGenerator {
  private seed: number;
  
  constructor(seed?: number);
  
  generateChunk(chunk: Chunk, registry: BlockRegistry): void;
  
  private getHeight(worldX: number, worldZ: number): number;
  private getBiome(worldX: number, worldZ: number): string;
  private placeTree(chunk: Chunk, localX: number, y: number, localZ: number): void;
}
```

---

### Passo 4 — Criar ChunkMeshBuilder

```text
Agente: @world-builder + @engine
Prompt: Crie src/world/ChunkMeshBuilder.ts
Converte um Chunk em Three.js mesh (InstancedMesh por tipo de bloco).
Implementa face culling básico: não renderiza faces entre blocos opacos adjacentes.
```

**Estrutura:**

```typescript
export class ChunkMeshBuilder {
  build(chunk: Chunk, registry: BlockRegistry, neighbors: ChunkNeighbors): THREE.Group;
  dispose(group: THREE.Group): void;
}
```

**Otimização crítica:** Não renderizar faces internas:
- Se bloco vizinho é opaco, não criar face naquela direção
- Reduz triângulos em ~80%

---

### Passo 5 — Criar ChunkManager

```text
Agente: @world-builder + @engine
Prompt: Crie src/world/ChunkManager.ts
Gerencia loading/unloading de chunks baseado na posição do jogador.
```

**Estrutura:**

```typescript
export class ChunkManager {
  private chunks: Map<string, Chunk>;
  private loadQueue: Array<{x: number, z: number}>;
  private renderDistance: number;
  
  constructor(scene: THREE.Scene, generator: TerrainGenerator, registry: BlockRegistry);
  
  update(playerX: number, playerZ: number): void;
  getBlock(worldX: number, worldY: number, worldZ: number): number;
  setBlock(worldX: number, worldY: number, worldZ: number, blockId: number): void;
  getGroundHeight(worldX: number, worldZ: number): number;
  
  private loadChunk(chunkX: number, chunkZ: number): void;
  private unloadChunk(chunkX: number, chunkZ: number): void;
  private chunkKey(chunkX: number, chunkZ: number): string;
  private worldToChunk(worldCoord: number): number;
  private worldToLocal(worldCoord: number): number;
}
```

**Lógica de update:**
1. Calcular chunk do jogador
2. Se mudou de chunk:
   - Determinar chunks necessários (raio de renderDistance)
   - Enfileirar chunks novos para carregar
   - Marcar chunks distantes para descarregar
3. Processar fila: gerar/meshar 1-2 chunks por frame (não travar)

---

### Passo 6 — Integrar ChunkManager no Game

```text
Agente: @engine
Prompt: Refatore game.ts para usar ChunkManager ao invés de World.generate().
O mundo agora carrega dinamicamente conforme o jogador se move.
```

**Mudanças:**
1. Substituir `this.world = new World(scene)` por `this.chunkManager = new ChunkManager(...)`
2. No update loop, chamar `this.chunkManager.update(playerX, playerZ)`
3. Physics usa `chunkManager.getBlock()` ao invés de `world.getBlock()`
4. Building usa `chunkManager.setBlock()`

---

### Passo 7 — Loading progressivo na tela de loading

```text
Agente: @engine + @ui-designer
Prompt: Ajuste a tela de loading para carregar os chunks iniciais 
ao redor do spawn antes de mostrar o menu.
```

**Ações:**
1. Gerar chunks em um raio de 4 ao redor de (0,0) na fase de loading
2. Mostrar progresso real (X de Y chunks gerados)
3. Após chunks iniciais prontos, mostrar menu

---

## Checklist de Conclusão

- [ ] `BlockRegistry` criado com IDs numéricos
- [ ] `Chunk` class com Uint8Array storage
- [ ] `TerrainGenerator` com seed determinística
- [ ] `ChunkMeshBuilder` com face culling
- [ ] `ChunkManager` com load/unload dinâmico
- [ ] Game integrado com ChunkManager
- [ ] Mundo "infinito" (jogador pode andar indefinidamente)
- [ ] Chunks carregam/descarregam suavemente (sem stutter)
- [ ] FPS ≥ 60 com renderDistance=8
- [ ] Blocos colocados pelo jogador persistem no chunk
- [ ] NPCs e moedas funcionam no novo sistema
