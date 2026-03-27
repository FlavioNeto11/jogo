# 🏗️ Arquitetura — MaFe & Juju World

> Documento de decisões arquiteturais (ADR) e visão técnica do projeto.

## Arquitetura Atual (v1 — Monolítica)

```text
index.html
    ├── three.min.js (CDN r128)
    ├── utils.js        → Objeto literal global `Utils`
    ├── audio.js        → Classe global `AudioSystem`
    ├── world.js        → Classe global `World` (InstancedMesh)
    ├── character.js    → Classe global `Character`
    ├── physics.js      → Classe global `Physics`
    ├── building.js     → Classe global `BuildingSystem`
    ├── entities.js     → Classe global `EntitySystem`
    ├── particles.js    → Classe global `ParticleSystem`
    ├── ui.js           → Classe global `UISystem`
    └── game.js         → Classe global `Game` (orquestrador)
```

### Problemas da Arquitetura Atual

| Problema | Impacto | Solução |
| -------- | ------- | ------- |
| Sem módulos (global scope) | Conflitos de nome, sem tree-shaking | ES Modules + Vite |
| Sem tipos | Bugs silenciosos em runtime | TypeScript |
| Three.js r128 desatualizada | Sem WebGPU, sem otimizações novas | Upgrade r170+ |
| Mundo fixo 64×64 | Limitado, sem escalabilidade | Sistema de chunks |
| Sem LOD | Renderiza tudo sempre | LOD + frustum culling |
| Física sem broadphase | O(n²) em cenários grandes | Spatial hash grid |
| Entidades monolíticas | Difícil adicionar comportamentos | ECS pattern |
| UI acoplada ao game loop | Rerenders desnecessários | React/Preact HUD |
| Sem persistência | Jogador perde progresso | IndexedDB + cloud |
| Sem testes | Regressões frequentes | Vitest + Playwright |

---

## Arquitetura Alvo (v2 — Modular ECS)

```text
src/
├── core/
│   ├── Engine.ts           # Loop principal, clock, states
│   ├── Renderer.ts         # Three.js setup, resize, quality
│   ├── InputManager.ts     # Keyboard, mouse, touch, gamepad
│   ├── EventBus.ts         # Pub/sub desacoplado
│   └── AssetLoader.ts      # Textures, audio, models
│
├── ecs/
│   ├── World.ts            # ECS world (não confundir com game world)
│   ├── Entity.ts           # Entidade base
│   ├── Component.ts        # Componente base
│   ├── System.ts           # Sistema base
│   └── components/
│       ├── Transform.ts
│       ├── Renderable.ts
│       ├── Collider.ts
│       ├── Velocity.ts
│       ├── Health.ts
│       ├── Inventory.ts
│       ├── AI.ts
│       └── ...
│
├── world/
│   ├── ChunkManager.ts     # Carregar/descarregar chunks
│   ├── Chunk.ts            # 16×16×256 blocks
│   ├── TerrainGenerator.ts # Noise, biomes
│   ├── BiomeRegistry.ts    # Definição de biomas
│   ├── BlockRegistry.ts    # Tipos de blocos
│   └── WorldSerializer.ts  # Save/load de chunks
│
├── physics/
│   ├── PhysicsEngine.ts    # Gravidade, integração
│   ├── SpatialHash.ts      # Broadphase
│   ├── AABB.ts             # Collision primitives
│   └── Raycast.ts          # Raycasting otimizado
│
├── entities/
│   ├── PlayerController.ts
│   ├── NPCFactory.ts
│   ├── FamilyNPCConfig.ts
│   └── CoinSpawner.ts
│
├── systems/
│   ├── RenderSystem.ts     # Sincroniza ECS com Three.js
│   ├── PhysicsSystem.ts    # Move + colide
│   ├── AISystem.ts         # Behavior trees
│   ├── InventorySystem.ts
│   ├── CraftingSystem.ts
│   ├── QuestSystem.ts
│   ├── DayNightSystem.ts
│   ├── WeatherSystem.ts
│   ├── AudioSystem.ts
│   └── ParticleSystem.ts
│
├── ui/
│   ├── HUD.tsx             # React/Preact
│   ├── Inventory.tsx
│   ├── QuestLog.tsx
│   ├── Chat.tsx
│   ├── Minimap.tsx
│   └── Settings.tsx
│
├── network/
│   ├── NetworkClient.ts    # WebSocket
│   ├── SyncManager.ts      # State sync
│   └── Protocol.ts         # Message types
│
├── audio/
│   ├── AudioEngine.ts      # Howler.js ou Web Audio
│   ├── MusicManager.ts     # Adaptive music
│   └── SFXPool.ts          # Sound pooling
│
├── utils/
│   ├── math.ts
│   ├── noise.ts
│   ├── color.ts
│   └── constants.ts
│
└── main.ts                 # Bootstrap
```

---

## Padrões de Design Utilizados

| Padrão | Onde | Por quê |
| ------ | ---- | ------- |
| **ECS** | Entidades e sistemas | Composição sobre herança, performance |
| **Event Bus** | Comunicação entre sistemas | Desacoplamento |
| **Factory** | Criação de NPCs, blocos | Encapsula complexidade |
| **Registry** | Blocos, biomas, receitas | Centraliza definições |
| **Object Pool** | Partículas, sons | Reduz GC pressure |
| **State Machine** | Game states, NPC AI | Comportamento previsível |
| **Observer** | UI reativa | Atualiza apenas o necessário |
| **Strategy** | Terrain generation | Diferentes algoritmos por bioma |
| **Command** | Input, undo/redo building | Desacopla input de ação |

---

## Fluxo de Dados

```text
Input Manager ──► Event Bus ──► Player Controller ──► Physics System
                     │                                       │
                     ▼                                       ▼
              AI System ──► NPC Entities ──► Physics System ──► Collision
                     │                                       │
                     ▼                                       ▼
              Quest System                            Render System
                     │                                       │
                     ▼                                       ▼
              UI (React) ◄─── Event Bus ◄─── State Changes
```

---

## Decisões Técnicas Chave

### Por que Vite (não Webpack)?

- HMR instantâneo
- Build 10-100x mais rápido
- Suporte nativo a ES Modules
- Configuração mínima
- Suporte a TypeScript out of the box

### Por que TypeScript?

- Autocompletar rico no VSCode
- Bugs detectados em compile-time
- Refactoring seguro
- Documentação embutida via tipos

### Por que ECS (não herança)?

- Performance: dados contíguos em memória
- Flexibilidade: composição de comportamentos
- Escalabilidade: adicionar sistemas sem tocar entidades
- Testabilidade: sistemas são funções puras

### Por que React/Preact para UI?

- Declarativo: UI reflete estado
- Virtual DOM: só atualiza o que mudou
- Ecossistema: componentes prontos
- Preact: 3KB — quase zero overhead
