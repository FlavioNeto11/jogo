# Copilot Instructions — MaFe & Juju World

## Contexto do Projeto

Este é o jogo **MaFe & Juju World**, um jogo 3D voxel no navegador inspirado no Roblox, feito para a Família Padilha. Usa Three.js para renderização 3D.

## Regras Gerais

1. **Idioma**: Código em inglês, comentários e UI em português (pt-BR)
2. **Framework**: Three.js (versão definida em package.json)
3. **Linguagem alvo**: TypeScript com strict mode (migração em progresso)
4. **Bundler**: Vite (migração em progresso — pode ainda ser vanilla)
5. **Sem dependências desnecessárias**: Prefira soluções nativas quando possível
6. **Performance é prioridade**: Frame budget de 16ms (60 FPS)

## Padrões de Código

- Nomes de classes em PascalCase
- Nomes de métodos e variáveis em camelCase
- Constantes em UPPER_SNAKE_CASE
- Interfaces prefixadas com I apenas quando ambíguo
- Uma classe por arquivo
- Máximo 300 linhas por arquivo
- Máximo 15 de complexidade cognitiva por função
- JSDoc/TSDoc em todas as APIs públicas

## Padrões Three.js

- Prefira `MeshLambertMaterial` sobre `MeshStandardMaterial` (performance)
- Use `InstancedMesh` para objetos repetidos (blocos)
- Sempre faça `dispose()` de geometrias e materiais quando não necessários
- Minimize draw calls — merge meshes quando possível
- Sombras: `BasicShadowMap` (performance)

## Estrutura de Diretórios

Consulte `docs/ARCHITECTURE.md` para a estrutura alvo do projeto.

## Família Padilha — Personagens do Jogo

- **Papai Flávio**: Pai forte, careca com barba, camiseta preta, bermuda bege, scale 1.15
- **Mamãe Ana Paula**: Mãe carinhosa, cabelo castanho, camiseta preta, jardineira jeans, scale 1.0
- **Maria Fernanda (MaFe)**: Filha mais velha, cabelo longo escuro, crop preta, jeans claro, scale 0.9
- **Juju (Julia)**: Caçulinha, cabelo claro com franja, lacinho, blusa creme, scale 0.65

## Roadmap

Consulte `docs/ROADMAP.md` para o roadmap completo e `docs/sprints/` para instruções detalhadas de cada sprint.

## Agentes

Consulte `docs/agents/AGENTS.md` para a documentação completa dos agentes especializados.
