# 🎮 MaFe & Juju World - Família Padilha

> Um jogo 3D estilo Roblox feito com amor para a Família Padilha! 💕

![Three.js](https://img.shields.io/badge/Three.js-r128-black?logo=threedotjs)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)

## 📖 Sobre

**MaFe & Juju World** é um jogo 3D voxel no navegador inspirado no Roblox, criado especialmente para a Família Padilha. Explore um mundo colorido, construa estruturas, colete estrelas e encontre toda a família!

### 👨‍👩‍👧‍👧 Personagens da Família

| Personagem | Descrição |
| ---------- | --------- |
| 💪 **Papai Flávio** | O pai forte e carinhoso, sempre motivando a família! |
| 💕 **Mamãe Ana Paula** | A mãe amorosa que cuida de todos! |
| ⭐ **Maria Fernanda (MaFe)** | A filha mais velha, exploradora e aventureira! |
| 🎀 **Juju** | A caçulinha fofa com seu lacinho! |

## 🚀 Como Jogar

### Pré-requisitos

- Navegador moderno com suporte a WebGL (Chrome, Firefox, Edge, Safari)
- Servidor HTTP local (recomendado: `http-server`)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/mafe-juju-world.git

# Entre na pasta do projeto
cd "jogo roblox"

# Instale o http-server (se necessário)
npm install -g http-server

# Inicie o servidor
http-server -p 8080 -c-1
```

Acesse `http://localhost:8080` no navegador.

### 🎮 Controles

| Tecla | Ação |
| ----- | ---- |
| **WASD** | Movimentação |
| **Mouse** | Olhar ao redor |
| **Espaço** | Pular (duplo pulo disponível!) |
| **Shift** | Correr |
| **1-9** | Selecionar bloco na toolbar |
| **Click esquerdo** | Colocar bloco |
| **Shift + Click** ou **Click direito** | Remover bloco |
| **V** | Alternar câmera (1ª/3ª pessoa) |
| **Scroll** | Zoom da câmera |
| **ESC** | Pausar/Continuar |

## 🏗️ Arquitetura do Projeto

```text
jogo roblox/
├── index.html          # Página principal (HTML semântico)
├── css/
│   └── style.css       # Estilos do jogo (responsivo, HUD, menus)
├── js/
│   ├── utils.js        # Utilitários (noise, lerp, clamp, cores)
│   ├── audio.js        # Sistema de áudio (Web Audio API)
│   ├── world.js        # Geração de mundo (terreno, água, árvores, casas)
│   ├── character.js    # Personagem jogável (modelo Roblox-style)
│   ├── physics.js      # Sistema de física (gravidade, colisão AABB)
│   ├── building.js     # Sistema de construção (colocar/remover blocos)
│   ├── entities.js     # Entidades (NPCs da família, moedas, NPCs genéricos)
│   ├── particles.js    # Sistema de partículas (coleta, pulo, pouso)
│   ├── ui.js           # Interface do usuário (HUD, toolbar, minimap, chat)
│   └── game.js         # Motor principal do jogo (loop, câmera, input)
├── .gitignore          # Arquivos ignorados pelo Git
└── README.md           # Este arquivo
```

### 📐 Padrões de Arquitetura

- **Separação por responsabilidade**: Cada arquivo JS é uma classe independente com uma responsabilidade clara
- **InstancedMesh**: O mundo usa `THREE.InstancedMesh` para renderizar milhares de blocos com alta performance
- **MeshLambertMaterial**: Material otimizado para performance (menos cálculos de iluminação)
- **Classe centralizada (Game)**: Orquestra todos os subsistemas
- **Sem dependências externas**: Apenas Three.js r128 via CDN

## ✨ Funcionalidades

- 🌍 **Mundo procedural**: Terreno gerado com noise FBM (Fractal Brownian Motion)
- 🏠 **Estruturas**: Casas, plataforma de spawn e árvores geradas automaticamente
- 🌊 **Água animada**: Plano de água com ondulação suave
- ☁️ **Céu dinâmico**: Skybox com gradiente, nuvens animadas e sol
- 🧱 **Construção**: 18 tipos de blocos para construir (tijolo, madeira, vidro, neon...)
- ⭐ **Coleta de estrelas**: Moedas/estrelas espalhadas pelo mundo
- 🏆 **Sistema de níveis**: XP por coleta de estrelas
- 👨‍👩‍👧‍👧 **NPCs da família**: Personagens com diálogos únicos e personalidades
- 🗺️ **Minimapa**: Visão aérea do mundo em tempo real
- 💬 **Chat**: Mensagens do sistema e diálogos dos NPCs
- 🎵 **Áudio**: Música ambiente e efeitos sonoros gerados proceduralmente
- 📸 **Câmera dual**: Primeira e terceira pessoa
- ⚙️ **Configurações**: Qualidade gráfica, sensibilidade, volume, distância de renderização
- 📱 **Responsivo**: Adaptado para diferentes tamanhos de tela

## 🛠️ Tecnologias

| Tecnologia | Uso |
| ---------- | --- |
| **Three.js r128** | Renderização 3D (WebGL) |
| **Web Audio API** | Geração de sons procedurais |
| **Canvas API** | Minimapa e texturas de nome dos NPCs |
| **CSS3** | Interface, animações, backdrop-filter |
| **HTML5** | Estrutura semântica |
| **JavaScript ES6+** | Lógica do jogo (classes, async/await, optional chaining) |

## 🎨 Tipos de Blocos

| Bloco | Cor | Uso |
| ----- | --- | --- |
| Grama | 🟢 Verde | Terreno |
| Terra | 🟤 Marrom | Subsolo |
| Pedra | ⚪ Cinza | Montanhas |
| Areia | 🟡 Amarelo | Praia |
| Madeira | 🟫 Marrom escuro | Troncos / Construção |
| Folhas | 🟢 Verde escuro | Árvores |
| Tijolo | 🔴 Vermelho | Construção |
| Vidro | 🔵 Azul claro | Janelas (transparente) |
| Ouro | 🟡 Dourado | Decoração |
| Neve | ⬜ Branco | Montanhas altas |
| Neon Rosa | 💖 Rosa | Decoração brilhante |
| Neon Azul | 💙 Azul | Decoração brilhante |

## 📊 Performance

- **InstancedMesh** para renderização otimizada de blocos
- **MeshLambertMaterial** ao invés de MeshStandardMaterial
- **BasicShadowMap** para sombras leves
- **Partículas limitadas** com auto-remoção
- **Nuvens e partículas ambiente reduzidas**
- Meta: **60 FPS** em hardware médio

## 💖 Créditos

Feito com ❤️ para a **Família Padilha** - Flávio, Ana Paula, Maria Fernanda e Julia.

---

*"Família unida, família feliz!"* 👨‍👩‍👧‍👧
