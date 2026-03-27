# Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

---

### Added (Sprint 5 — LOD + Frustum Culling + Otimizações de Renderização)

- `src/world/ChunkCuller.ts` — Frustum culling por chunk usando `THREE.Frustum.intersectsBox()`; oculta chunks fora do campo de visão da câmera a zero custo de GPU; objetos `THREE.Box3` e `THREE.Matrix4` pré-alocados para zero GC por frame
- `src/world/ChunkMeshBuilder.ts` — Reescrita completa com *greedy meshing*: varre os 6 eixos de face e funde quads adjacentes do mesmo bloco em retângulos maiores (~60-80% menos triângulos vs face-per-block); normais planas explícitas por face (flat shading correto); geometria não-indexada elimina averaging de normais entre faces
- `src/world/PerformanceMonitor.ts` — Monitor de frame-time com ring buffer de 60 frames para FPS rolling; expõe `record()`, `getStats()` e `getHudText()` para overlay de debug
- Sistema de 3 níveis de LOD em `ChunkManager`:
	- `full` (0–3 chunks de distância): greedy mesh + sombras ativas
	- `medium` (4–5 chunks): greedy mesh + sombras desativas
	- `low` (6+ chunks): plano heightmap flat com vertex colours (single draw call por chunk)
- `ChunkCuller` integrado ao `ChunkManager`: visibilidade por chunk é avaliada a cada frame em `applyLodAndCulling()`
- Transições automáticas de LOD por distância Chebyshev do jogador: chunks que mudam de zona reconstróem o mesh no próximo frame

### Changed (Sprint 5)

- `ChunkManager.updateWithCamera(playerX, playerZ, camera)` substitui `update()` como chamada primária do loop: atualiza frustum → streaming → LOD+culling em uma única chamada
- `game.ts` chama `chunkManager.updateWithCamera()` passando a câmera real; instancia e alimenta `PerformanceMonitor` com dados de `renderer.info.render` a cada frame
- `ChunkManager.loadChunk()` determina o LOD inicial baseado na distância ao jogador em vez de sempre usar `full`

## [Unreleased]

### Added (Sprint 4 — Sistema de Chunks + Streaming)

- `src/world/BlockRegistry.ts` — Registro tipado de blocos com IDs numéricos e metadados (solid, transparent, emissive)
- `src/world/Chunk.ts` — Estrutura de chunk 16×16×256 com `Uint8Array` (65 KB por chunk)
- `src/world/TerrainGenerator.ts` — Geração de terreno seed-based extraída do World legado; suporte a estruturas cross-chunk (plataforma spawn, casas)
- `src/world/ChunkMeshBuilder.ts` — Constrói `THREE.Group` por chunk com face culling: faces entre blocos opacos são omitidas (~80% menos triângulos)
- `src/world/ChunkManager.ts` — Carrega/descarrega chunks dinamicamente baseado na posição do jogador; implementa `IWorldQuery` para compatibilidade com sistemas legados
- Interface `IWorldQuery` em `src/types.ts` — Contrato compartilhado entre World legado e ChunkManager novo

### Changed (Sprint 4)

- `game.ts` agora instancia `ChunkManager` (com `BlockRegistry` + `TerrainGenerator`) em vez de `World`; chama `chunkManager.update()` no loop de update
- Loading screen exibe progresso real de geração de chunks (X/81 chunks)
- `physics.ts`, `building.ts`, `entities.ts`, `ui.ts` — `World` substituído por `IWorldQuery` para desacoplar dos sistemas legados
- Plano de água agora é um `PlaneGeometry(512, 512)` global (sem blocos individuais de água)

### Added (Sprint 0 — Fundação Técnica)

- Estrutura de build com Vite e scripts npm para `dev`, `build`, `preview` e `typecheck`
- Diretório `src/` com módulos TypeScript para todos os sistemas do jogo
- Arquivo de tipagem compartilhada em `src/types.ts`

### Changed (Sprint 0)

- Migração de scripts globais para ES Modules com imports/exports explícitos
- `index.html` agora usa apenas entrypoint modular (`/src/game.ts`)
- Three.js migrado de CDN r128 para dependência npm (`three@latest`)
- Renderer atualizado para API de color space moderna (`outputColorSpace` + `SRGBColorSpace`)

### Removed (Sprint 0)

- Cadeia de `<script>` globais antiga
- Pasta legada `js/`
- Dependência de `css/style.css` fora de `src/`

---

## [0.1.0] — 2024-XX-XX — Protótipo Funcional

### Added
- Mundo voxel 3D com geração procedural (Perlin noise)
- Personagem estilo Roblox com animação de caminhada
- Câmera primeira e terceira pessoa (toggle com V)
- 14 tipos de blocos (grama, terra, pedra, areia, madeira, etc.)
- Colocar e remover blocos com ghost preview
- 4 NPCs da família Padilha (Flávio, Ana Paula, MaFe, Juju)
- NPCs genéricos com caminhada aleatória
- Sistema de coins colecionáveis (20 coins no mapa)
- Partículas visuais (colocar bloco, coletar coin, construir)
- Sistema de áudio procedural (Web Audio API)
- HUD com vida, coins, toolbar de blocos, minimap
- Sistema de chat básico
- Física com colisão AABB
- Sky shader com gradiente dia
- Água animada com transparência
- Árvores e casas procedurais
- Qualidade gráfica configurável (Low/Medium/High)
- Iluminação com sombras (DirectionalLight + AmbientLight)
- Tela de loading com barra de progresso
- README.md com instruções
- .gitignore configurado

### Technical
- Three.js r128 via CDN
- 10 classes JavaScript (Game, World, Entities, Character, Physics, Building, Particles, UI, Audio, Utils)
- InstancedMesh para blocos do mundo
- Perlin noise 2D para terreno
- Responsive canvas (resize handler)

---

## Formato de Versão

- **MAJOR**: mudanças que quebram compatibilidade de saves
- **MINOR**: novas features
- **PATCH**: bug fixes e melhorias

## Como Documentar

Para cada sprint completada, adicionar entrada no formato:

```markdown
## [X.Y.Z] — YYYY-MM-DD — Nome da Sprint

### Added
- Feature nova 1
- Feature nova 2

### Changed
- Alteração em feature existente

### Fixed
- Bug corrigido

### Removed
- Feature removida

### Technical
- Detalhes técnicos relevantes
```
