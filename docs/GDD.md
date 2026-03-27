# 🎮 Game Design Document — MaFe & Juju World

## Informações Gerais

| Campo | Valor |
|-------|-------|
| **Nome** | MaFe & Juju World — Família Padilha |
| **Gênero** | Sandbox / Voxel / Aventura Familiar |
| **Plataforma** | Web (Desktop + Mobile) |
| **Público-Alvo** | Família, crianças 5+, casual gamers |
| **Engine** | Three.js (WebGL) |
| **Inspirações** | Roblox, Minecraft, Animal Crossing |
| **Tom** | Alegre, colorido, familiar, seguro |

---

## Visão do Jogo

> Um mundo voxel 3D onde a **Família Padilha** (Flávio, Ana Paula, MaFe e Juju) explora, constrói e vive aventuras juntos. O jogador controla o pai (Flávio) enquanto os membros da família interagem com IA própria, dando quests, seguindo, e tornando o mundo vivo.

---

## Personagens

### 👨 Flávio (Jogador)
- **Papel**: Protagonista controlável
- **Cor**: Azul (#3498DB)
- **Personalidade**: Aventureiro, protetor
- **Habilidades**: Construir, minerar, explorar

### 👩 Ana Paula (NPC — Mãe)
- **Papel**: Quest giver, protetora
- **Cor**: Rosa (#E91E63)
- **Personalidade**: Organizada, carinhosa, atenta às crianças
- **IA**: Segue a Juju, dá quests de construção e organização
- **Frases**: "Cuidado com as crianças, amor!", "Vamos tirar uma foto aqui!"

### 👧 MaFe (NPC — Filha mais velha, 7 anos)
- **Papel**: Exploradora, quest giver
- **Cor**: Roxo (#9B59B6)
- **Personalidade**: Curiosa, aventureira, corajosa
- **IA**: Explora longe, descobre coisas, convida para aventuras
- **Frases**: "Papai, olha o que eu achei! 🌟", "Vamos explorar ali!"

### 👶 Juju (NPC — Filha mais nova, 3 anos)
- **Papel**: Companheira fofa, quest giver
- **Cor**: Rosa claro (#FF69B4)
- **Personalidade**: Fofa, grudenta, curiosa com coisas simples
- **IA**: Segue o pai de perto, anda devagar, para bastante
- **Frases**: "Papai! Papai! 💕", "Juju quer colo!", "Olha, borboleta! 🦋"

---

## Pilares de Design

### 1. 🏠 Construção Criativa
- Colocar e remover blocos livremente
- 15+ tipos de blocos com visual distinto
- Sistema de crafting para criar novos materiais
- Editor avançado para construções elaboradas

### 2. 🗺️ Exploração
- Mundo procedural infinito com 6+ biomas
- Estruturas geradas (casas, ruínas, poços)
- Ciclo dia/noite com clima dinâmico
- Recompensas por explorar (coins, itens raros)

### 3. 👨‍👩‍👧‍👦 Família
- NPCs familiares com personalidade e IA única
- Quests que envolvem construir para a família
- Diálogos carinhosos e contextuais
- O jogo celebra a convivência familiar

### 4. 🌈 Acessibilidade
- Jogável por crianças de 5+ anos
- Sem violência, morte permanente ou conteúdo assustador
- Controles simples (WASD + mouse ou touch)
- UI clara com ícones grandes

---

## Gameplay Loop

```
Explorar Mundo → Coletar Recursos → Craftar Itens → 
Construir Estruturas → Completar Quests → Desbloquear Novos Biomas/Itens →
(Repetir com novos objetivos)
```

### Loop de 30 segundos
1. Andar pelo mundo
2. Encontrar recurso ou objetivo
3. Interagir (minerar, coletar, falar com NPC)
4. Feedback (som, partícula, notificação)

### Loop de 5 minutos
1. Explorar área
2. Coletar recursos
3. Voltar para base
4. Construir/craftar
5. Progresso em quest

### Loop de 30 minutos
1. Completar quest
2. Desbloquear nova área/item
3. Expandir base
4. Interagir com família

---

## Progressão

### Quest Line Principal
1. **Primeiros Passos** — Coletar e colocar blocos (tutorial)
2. **Casa da Família** — Construir primeira casa
3. **Aventura da MaFe** — Explorar biomas
4. **Brinquedos da Juju** — Craftar itens coloridos
5. **A Grande Construção** — Projeto final épico

### Side Quests
- Colecionador de coins
- Arquiteto (blocos colocados)
- Explorador (distância)
- Chef (crafts)

### Unlocks
- Novos tipos de blocos
- Novas receitas de crafting
- Acesso a biomas distantes
- Itens decorativos especiais

---

## Controles

### Desktop
| Ação | Input |
|------|-------|
| Mover | WASD |
| Pular | Espaço |
| Câmera | Mouse |
| Colocar bloco | Click esquerdo |
| Remover bloco | Click direito |
| Interagir NPC | E |
| Inventário | E / Tab |
| Crafting | C |
| Quests | J |
| Chat | Enter |
| Pausa | ESC |
| Trocar câmera | V |
| Hotbar | 1-9 / Scroll |

### Mobile
| Ação | Input |
|------|-------|
| Mover | Joystick virtual (esquerda) |
| Câmera | Arrastar (direita) |
| Pular | Botão |
| Colocar | Tap |
| Remover | Long press |
| Interagir | Double tap |

---

## Mundo

### Biomas
| Bioma | Superfície | Vegetação | Clima |
|-------|-----------|-----------|-------|
| Planície | Grama | Árvores, flores | Ameno |
| Floresta | Grama escura | Árvores densas | Úmido |
| Deserto | Areia | Cactos | Seco |
| Montanha | Pedra/neve | Pinheiros | Frio |
| Praia | Areia | Palmeiras | Tropical |
| Tundra | Neve | Pinheiros | Gelado |

### Blocos
| Tipo | Cor | Uso |
|------|-----|-----|
| Grama | Verde | Superfície de planície |
| Terra | Marrom | Subsuperfície |
| Pedra | Cinza | Construção, deep layer |
| Areia | Bege | Praias, deserto |
| Tronco | Marrom escuro | Árvores |
| Tábuas | Marrom claro | Construção |
| Folhas | Verde escuro | Copa de árvores |
| Tijolo | Vermelho | Construção |
| Vidro | Transparente | Janelas |
| Pedregulho | Cinza mosqueado | Construção |
| Lã (cores) | Variado | Decoração |
| Neve | Branco | Tundra |
| Gelo | Azul claro | Lagos congelados |
| Água | Azul transparente | Oceanos, rios |

---

## Audio

- **Música**: procedural, muda por bioma, suave e alegre
- **SFX**: procedurais via Web Audio API
- **Ambiente**: dia (pássaros), noite (grilos), chuva, vento
- **Sem música licenciada** — tudo gerado programaticamente

---

## Restrições Técnicas

- Browser-only (sem instalação nativa)
- WebGL 1.0+ (compatibilidade máxima)
- Target: 60 FPS desktop, 30 FPS mobile
- Offline-capable (PWA)
- Max bundle: ~1.5MB gzipped
- Sem dependências pesadas além de Three.js

---

## Monetização

**Nenhuma.** Este é um projeto pessoal/familiar. Sem ads, sem IAP, sem paywalls.

---

## Classificação

**Livre** — Conteúdo seguro para todas as idades. Sem violência, sem texto ofensivo, sem interação com desconhecidos (multiplayer apenas por convite).
