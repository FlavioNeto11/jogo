# Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

---

## [Unreleased]

### Added

- Estrutura de build com Vite e scripts npm para `dev`, `build`, `preview` e `typecheck`
- Diretório `src/` com módulos TypeScript para todos os sistemas do jogo
- Arquivo de tipagem compartilhada em `src/types.ts`

### Changed

- Migração de scripts globais para ES Modules com imports/exports explícitos
- `index.html` agora usa apenas entrypoint modular (`/src/game.ts`)
- Three.js migrado de CDN r128 para dependência npm (`three@latest`)
- Renderer atualizado para API de color space moderna (`outputColorSpace` + `SRGBColorSpace`)

### Removed

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
