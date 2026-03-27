# AGENTS - Operational Index (VS Code Insiders)

Este documento padroniza como escolher o agente inicial, quando fazer handoff e como manter consistencia de execucao.

## Start Here

1. Se a solicitacao e ampla, ambigua, ou envolve mudanca estrutural: comece com ContextOpsArchitect.
2. Se a solicitacao e claramente tecnica de dominio: comece no especialista.
3. Para entrega segura: finalize com Quality e, quando aplicavel, DevOps.

## Agent Routing Matrix

| Tipo de solicitacao | Agente inicial | Handoff recomendado | Resultado esperado |
| --- | --- | --- | --- |
| Estrutura de docs, governanca, contexto, qualidade de prompts/agentes | ContextOpsArchitect | Architect -> Quality -> DevOps | Estrutura robusta, rastreabilidade e validacao |
| Arquitetura de modulos, contracts, padroes (ECS/Event Bus/Factory) | Architect | Engine ou EntityMaster -> Quality | Decisao arquitetural clara e implementavel |
| Rendering, game loop, draw calls, LOD, performance frame time | Engine | WorldBuilder ou Physics -> Quality | Melhorias de engine com meta de performance |
| Chunks, biomas, geracao procedural, terreno | WorldBuilder | Engine -> EntityMaster -> Quality | Mundo procedural estavel e eficiente |
| Colisao, raycasting, gravidade, resposta fisica | Physics | EntityMaster -> Engine -> Quality | Fisica integrada e validada |
| ECS, NPCs, AI, behavior trees, spawning | EntityMaster | Physics ou Gameplay -> Quality | Entidades e IA consistentes |
| Inventario, crafting, quests, save/load, loops de jogo | Gameplay | UIDesigner ou AudioEngineer -> Quality | Mecanicas completas e testaveis |
| UI/HUD/menus, responsividade, acessibilidade | UIDesigner | Gameplay ou AudioEngineer -> Quality | UI funcional e alinhada ao gameplay |
| Audio, musica adaptativa, spatial audio, SFX | AudioEngineer | Gameplay ou UIDesigner -> Quality | Sistema de audio integrado |
| Backend, multiplayer, sincronizacao, lobby | Network | Architect -> DevOps -> Quality | Fluxo online funcional e seguro |
| Migracao JS para TypeScript e modularizacao | Migrator | Architect -> Engine -> Quality | Migracao incremental sem regressao |
| Testes, review, cobertura, benchmark, gate de qualidade | Quality | Engine ou Migrator (correcoes) | Qualidade mensuravel e confiavel |
| Build, CI/CD, deploy, PWA, analytics | DevOps | Architect -> Quality | Pipeline e entrega operacional |

## Practical Execution Order

Use esta ordem como padrao quando houver duvida:

1. ContextOpsArchitect (quando houver risco de contexto/documentacao)
2. Architect (definicao estrutural)
3. Agente especialista (implementacao)
4. Quality (validacao)
5. DevOps (pipeline/deploy, quando necessario)

## Quick Handoff Rules

1. Evite ciclos de handoff sem criterio de saida.
2. Cada handoff deve ter objetivo claro e verificavel.
3. Limite handoffs por tarefa a no maximo 3 passos principais.
4. Se houver conflito entre agentes, Architect decide estrutura e ContextOpsArchitect decide governanca de contexto.

## VS Code Insiders Compatibility

1. Priorize aliases de tools suportados no workspace atual.
2. Remova toolsets externos quando gerarem Unknown tool.
3. Revalide diagnosticos sempre apos editar frontmatter de agents.

## Definition of Done (Agents)

Uma solicitacao esta pronta quando:

1. O agente inicial foi escolhido pela matriz acima.
2. Handoffs executados com objetivo claro.
3. Validacao de qualidade concluida (Quality quando aplicavel).
4. Nao existem erros de configuracao de agent frontmatter.

## Current Agent Catalog

- Architect
- AudioEngineer
- ContextOpsArchitect
- DevOps
- Engine
- EntityMaster
- Gameplay
- Migrator
- Network
- Physics
- Quality
- UIDesigner
- WorldBuilder
- Explore
