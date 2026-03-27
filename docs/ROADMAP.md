# 🗺️ Roadmap — MaFe & Juju World: Do Protótipo ao Nível Profissional

> Versão: 1.0 | Última atualização: Março 2026
> Este documento é a referência central para todas as sprints de evolução do jogo.

## 📊 Estado Atual do Projeto (Baseline)

| Métrica | Valor Atual |
| ------- | ----------- |
| Arquitetura | Monolítica — 10 scripts globais carregados via `<script>` tags |
| Bundler / Build | Nenhum — CDN direto |
| Engine | Three.js r128 (defasada — atual r170+) |
| Renderização | InstancedMesh básico, sem LOD, sem frustum culling manual |
| Mundo | 64×64 fixo, sem chunks, sem streaming |
| Física | AABB caseiro, sem broadphase |
| NPCs | 4 família + 4 genéricos, IA simplificada (wander + olhar player) |
| Áudio | Web Audio procedural, sem assets reais |
| UI | DOM puro, sem framework, sem acessibilidade |
| Testes | Nenhum |
| CI/CD | Nenhum |
| Mobile | Parcial (responsivo CSS, sem touch controls) |
| Multiplayer | Nenhum |
| Save/Load | Nenhum |

---

## 🎯 Visão — Onde Queremos Chegar

Um jogo 3D voxel **completo, publicável e profissional** no navegador com:

- ✅ Mundo infinito com chunks e LOD
- ✅ Sistema de inventário e crafting
- ✅ NPCs com IA por árvore de comportamento
- ✅ Sistema de quests
- ✅ Save/Load persistente (IndexedDB + cloud)
- ✅ Multiplayer cooperativo básico
- ✅ Controles mobile (touch)
- ✅ Pipeline de build profissional (Vite + TypeScript)
- ✅ Testes automatizados
- ✅ CI/CD com deploy automático
- ✅ Áudio profissional com assets reais
- ✅ Performance AAA para navegador (60 FPS em hardware médio)

---

## 📅 Fases do Roadmap

### FASE 0 — Fundação Técnica (Sprints 1–3)

> **Objetivo:** Modernizar a base de código sem alterar funcionalidades visíveis.

| Sprint | Título | Entrega |
| ------ | ------ | ------- |
| 1 | Migração para ES Modules + Vite | Build system, hot reload, import/export |
| 2 | Migração para TypeScript | Type safety, interfaces, enums |
| 3 | Upgrade Three.js r170+ | WebGPU-ready, novos shaders, melhor performance |

### FASE 1 — Motor do Jogo (Sprints 4–8)

> **Objetivo:** Sistemas de engine de nível profissional.

| Sprint | Título | Entrega |
| ------ | ------ | ------- |
| 4 | Sistema de Chunks + Streaming | Mundo infinito, carregar/descarregar dinâmico |
| 5 | LOD + Frustum Culling + Occlusion | Performance profissional |
| 6 | Physics Engine v2 | Broadphase (spatial hash), raycasting otimizado |
| 7 | ECS Architecture | Entity Component System para entidades |
| 8 | Event Bus + State Machine | Comunicação desacoplada, estados do jogo |

### FASE 2 — Gameplay (Sprints 9–14)

> **Objetivo:** Sistemas de jogo que tornam o gameplay envolvente.

| Sprint | Título | Entrega |
| ------ | ------ | ------- |
| 9 | Sistema de Inventário | Inventory UI, drag & drop, stacking |
| 10 | Sistema de Crafting | Receitas, mesa de craft, progressão |
| 11 | IA Avançada para NPCs | Behavior Trees, pathfinding (A*), schedules |
| 12 | Sistema de Quests | Quest log, objetivos, recompensas |
| 13 | Ciclo Dia/Noite + Clima | Sol dinâmico, lua, chuva, neve, iluminação |
| 14 | Biomas + Geração Avançada | Deserto, floresta, neve, cavernas, dungeons |

### FASE 3 — Persistência e Rede (Sprints 15–18)

> **Objetivo:** Salvar progresso e permitir multiplayer.

| Sprint | Título | Entrega |
| ------ | ------ | ------- |
| 15 | Save/Load Local | IndexedDB, serialização de mundo |
| 16 | Backend + Auth | Node.js/Express, JWT, contas de jogador |
| 17 | Cloud Save + Leaderboard | Sincronização, ranking de jogadores |
| 18 | Multiplayer Cooperativo | WebSocket, sincronização de mundo |

### FASE 4 — Polish e Publicação (Sprints 19–22)

> **Objetivo:** Qualidade de produto publicável.

| Sprint | Título | Entrega |
| ------ | ------ | ------- |
| 19 | Áudio Profissional | Assets reais, música adaptive, spatial audio |
| 20 | UI/UX Profissional | React HUD, acessibilidade, i18n |
| 21 | Mobile + Touch Controls | Joystick virtual, layout responsivo |
| 22 | CI/CD + Deploy | GitHub Actions, testes, deploy automático |

### FASE 5 — Além do MVP (Sprints 23+)

| Sprint | Título | Entrega |
| ------ | ------ | ------- |
| 23 | Editor de Mundo | In-game world editor, save/share maps |
| 24 | Marketplace de Skins | Customização de personagem |
| 25 | PWA + Offline Mode | Service Worker, instalável |
| 26 | Analytics + Telemetria | Tracking de gameplay, A/B testing |

---

## 🔗 Dependências entre Sprints

```text
Sprint 1 (ES Modules) ──► Sprint 2 (TypeScript) ──► Sprint 3 (Three.js upgrade)
                                                          │
                    ┌─────────────────────────────────────┘
                    ▼
            Sprint 4 (Chunks) ──► Sprint 5 (LOD) ──► Sprint 14 (Biomas)
                    │
                    ▼
            Sprint 6 (Physics v2)
                    │
            Sprint 7 (ECS) ──► Sprint 11 (IA) ──► Sprint 12 (Quests)
                    │
            Sprint 8 (Event Bus) ──► Sprint 15 (Save/Load) ──► Sprint 16 (Backend)
                                                                       │
                                              Sprint 17 (Cloud) ◄─────┘
                                                       │
                                              Sprint 18 (Multiplayer)

            Sprint 9 (Inventário) ──► Sprint 10 (Crafting)
            Sprint 13 (Dia/Noite) — independente após Sprint 3
            Sprint 19-22 (Polish) — após Sprints 1-14 completas
```

---

## 📏 Critérios de Qualidade por Sprint

Cada sprint DEVE atender a:

1. **Zero erros** no SonarQube e VSCode
2. **Cobertura de testes** ≥ 80% para código novo
3. **Performance**: ≤ 16ms por frame (60 FPS) no Chrome DevTools
4. **Documentação**: JSDoc/TSDoc em todas as APIs públicas
5. **PR Review**: Código revisado antes do merge
6. **Changelog**: Entrada no CHANGELOG.md

---

## 📂 Estrutura Alvo do Projeto (Pós-Fase 0)

```text
mafe-juju-world/
├── .github/
│   ├── workflows/          # CI/CD pipelines
│   ├── copilot/
│   │   ├── agents/         # Definições de agentes Copilot
│   │   └── instructions/   # Knowledge base por domínio
│   └── CODEOWNERS
├── docs/
│   ├── ROADMAP.md          # Este arquivo
│   ├── ARCHITECTURE.md     # Decisões de arquitetura
│   ├── sprints/            # Documentação detalhada de cada sprint
│   └── agents/             # Documentação dos agentes
├── src/
│   ├── core/               # Engine core (renderer, loop, input)
│   ├── ecs/                # Entity Component System
│   ├── world/              # Chunks, terrain, biomes
│   ├── physics/            # Collision, raycasting
│   ├── entities/           # NPCs, items, mobs
│   ├── systems/            # Game systems (inventory, crafting, quests)
│   ├── ui/                 # React components para HUD
│   ├── audio/              # Audio engine
│   ├── network/            # Multiplayer client
│   ├── utils/              # Utilities
│   └── main.ts             # Entry point
├── assets/
│   ├── audio/              # Sons e músicas
│   ├── textures/           # Texturas de blocos
│   └── models/             # Modelos 3D (se houver)
├── server/                 # Backend para multiplayer/saves
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── public/                 # Arquivos estáticos
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 🚦 Como Usar Este Roadmap

1. **Leia** a sprint desejada em `docs/sprints/sprint-XX.md`
2. **Carregue o agente** adequado (ver `docs/agents/`)
3. **Execute** os passos sequenciais da sprint
4. **Valide** com os critérios de qualidade
5. **Faça commit** e prossiga para a próxima sprint

Cada sprint é auto-contida e pode ser executada via Copilot Agent seguindo a documentação passo a passo.
