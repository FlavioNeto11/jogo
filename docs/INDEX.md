# 📚 Documentação — MaFe & Juju World

## Índice Geral

### Documentos Principais

| Documento | Descrição |
|-----------|-----------|
| [ROADMAP.md](ROADMAP.md) | Roadmap completo: 6 fases, 26 sprints, dependências, critérios |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Arquitetura atual vs alvo, design patterns, data flow |
| [GDD.md](GDD.md) | Game Design Document: personagens, gameplay, controles, mundo |
| [agents/AGENTS.md](agents/AGENTS.md) | Catálogo dos 12 agentes Copilot com skills e instruções |

### Sprint Guides

#### Fase 0 — Fundação (Sprints 1-3)
| Sprint | Título | Agente | Duração |
|--------|--------|--------|---------|
| [01](sprints/sprint-01-es-modules-vite.md) | ES Modules + Vite | @migrator | 2-3 dias |
| [02](sprints/sprint-02-typescript.md) | TypeScript Migration | @migrator | 3-4 dias |
| [03](sprints/sprint-03-threejs-upgrade.md) | Three.js Upgrade | @engine | 1-2 dias |

#### Fase 1 — Motor de Jogo (Sprints 4-8)
| Sprint | Título | Agente | Duração |
|--------|--------|--------|---------|
| [04](sprints/sprint-04-chunks.md) | Chunk System | @world-builder | 3-4 dias |
| [05](sprints/sprint-05-lod-culling.md) | LOD & Culling | @engine | 2-3 dias |
| [06](sprints/sprint-06-physics-v2.md) | Physics V2 | @physics | 2-3 dias |
| [07](sprints/sprint-07-ecs.md) | Entity Component System | @entity-master | 3-4 dias |
| [08](sprints/sprint-08-event-bus.md) | Event Bus | @architect | 1-2 dias |

#### Fase 2 — Gameplay (Sprints 9-14)
| Sprint | Título | Agente | Duração |
|--------|--------|--------|---------|
| [09](sprints/sprint-09-inventory.md) | Inventory System | @gameplay | 2-3 dias |
| [10](sprints/sprint-10-crafting.md) | Crafting System | @gameplay | 2 dias |
| [11](sprints/sprint-11-ai-behavior.md) | NPC AI & Behavior Trees | @entity-master | 3 dias |
| [12](sprints/sprint-12-quests.md) | Quest System | @gameplay | 3 dias |
| [13](sprints/sprint-13-day-night-weather.md) | Day/Night & Weather | @engine | 2 dias |
| [14](sprints/sprint-14-biomes.md) | Biomes & Terrain | @world-builder | 3-4 dias |

#### Fase 3 — Persistência (Sprints 15-18)
| Sprint | Título | Agente | Duração |
|--------|--------|--------|---------|
| [15](sprints/sprint-15-save-load.md) | Save/Load System | @gameplay | 2 dias |
| [16](sprints/sprint-16-backend-auth.md) | Backend & Auth | @network | 3-4 dias |
| [17](sprints/sprint-17-cloud-deploy.md) | Cloud Deployment | @devops | 1-2 dias |
| [18](sprints/sprint-18-multiplayer.md) | Basic Multiplayer | @network | 5-7 dias |

#### Fase 4 — Polimento (Sprints 19-22)
| Sprint | Título | Agente | Duração |
|--------|--------|--------|---------|
| [19](sprints/sprint-19-audio-pro.md) | Professional Audio | @audio-engineer | 2-3 dias |
| [20](sprints/sprint-20-ui-ux-pro.md) | Professional UI/UX | @ui-designer | 3-4 dias |
| [21](sprints/sprint-21-mobile.md) | Mobile Support | @ui-designer | 2-3 dias |
| [22](sprints/sprint-22-testing-cicd.md) | Testing & CI/CD | @quality | 2-3 dias |

#### Fase 5 — Beyond (Sprints 23-26)
| Sprint | Título | Agente | Duração |
|--------|--------|--------|---------|
| [23](sprints/sprint-23-editor.md) | In-Game Editor | @world-builder | 4-5 dias |
| [24](sprints/sprint-24-marketplace.md) | Marketplace | @network | 3-4 dias |
| [25](sprints/sprint-25-pwa.md) | PWA | @devops | 1-2 dias |
| [26](sprints/sprint-26-analytics.md) | Analytics | @devops | 1-2 dias |

### Configuração de Agentes

| Agente | Arquivo | Especialidade |
|--------|---------|---------------|
| @architect | [architect.md](../. github/copilot/agents/architect.md) | Design patterns, estrutura |
| @engine | [engine.md](../.github/copilot/agents/engine.md) | Three.js, rendering, performance |
| @world-builder | [world-builder.md](../.github/copilot/agents/world-builder.md) | Terreno, chunks, biomas |
| @physics | [physics.md](../.github/copilot/agents/physics.md) | Colisões, raycasting |
| @entity-master | [entity-master.md](../.github/copilot/agents/entity-master.md) | ECS, NPCs, behavior trees |
| @gameplay | [gameplay.md](../.github/copilot/agents/gameplay.md) | Inventário, crafting, quests |
| @ui-designer | [ui-designer.md](../.github/copilot/agents/ui-designer.md) | Preact, CSS, responsivo |
| @audio-engineer | [audio-engineer.md](../.github/copilot/agents/audio-engineer.md) | Web Audio, música procedural |
| @network | [network.md](../.github/copilot/agents/network.md) | Firebase, multiplayer |
| @devops | [devops.md](../.github/copilot/agents/devops.md) | CI/CD, deploy, PWA |
| @migrator | [migrator.md](../.github/copilot/agents/migrator.md) | JS→TS, CDN→npm |
| @quality | [quality.md](../.github/copilot/agents/quality.md) | Testes, linting, a11y |

---

## Como Usar

### Executar uma Sprint

1. Abra o sprint guide correspondente
2. Siga os passos na ordem
3. Para cada passo, copie o prompt do agente indicado
4. Cole no Copilot Chat e execute
5. Valide com o checklist de cada passo
6. Marque o checklist de conclusão da sprint

### Usar um Agente

1. Abra o arquivo do agente em `.github/copilot/agents/`
2. O Copilot usará automaticamente como contexto
3. Ou referêncie o agente manualmente: "Atuando como @engine, ..."

### Ordem Recomendada

```
Sprint 01 → 02 → 03 (Fundação)
    ↓
Sprint 04 → 05 → 06 → 07 → 08 (Motor)
    ↓
Sprint 09 → 10 → 11 → 12 → 13 → 14 (Gameplay)
    ↓
Sprint 15 → 16 → 17 → 18 (Persistência)
    ↓
Sprint 19 → 20 → 21 → 22 (Polimento)
    ↓
Sprint 23 → 24 → 25 → 26 (Beyond)
```

Duração total estimada: **60-80 dias** de desenvolvimento focado.
