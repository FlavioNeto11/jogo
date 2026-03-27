# Sprint 20 — Professional UI/UX

> **Fase**: 4 — Polimento  
> **Agente Principal**: `@ui-designer`  
> **Agentes de Apoio**: `@architect`  
> **Dependências**: Sprint 01 (Vite), Sprint 08 (Event Bus)  
> **Duração Estimada**: 3-4 dias  

---

## Objetivo

Redesign completo da UI com React/Preact, animações fluídas, responsividade, acessibilidade e design system consistente.

---

## Passo 1 — Preact Setup

**Agente**: `@architect`

**Prompt**:
```
Configure Preact como UI framework (menor que React, mesma API).

1. npm install preact
2. Configure alias em vite.config.ts: react → preact/compat
3. Crie src/ui/ como diretório raiz de componentes
4. Crie src/ui/App.tsx como componente raiz
5. Mount Preact em div#ui-root (separado do canvas Three.js)

Estrutura:
src/ui/
  App.tsx
  hooks/           — Custom hooks (useGameState, useInventory, etc.)
  components/
    hud/           — HUD elements (health, coins, toolbar)
    menus/         — Menus (pause, settings, inventory)
    dialogs/       — Dialog boxes (quest, NPC, confirm)
    common/        — Shared (Button, Modal, Tooltip, ProgressBar)
  styles/
    variables.css  — CSS custom properties (design tokens)
    animations.css — Reusable animations
    base.css       — Reset + typography
  store/           — State management (signals ou zustand)
```

---

## Passo 2 — Design System

**Agente**: `@ui-designer`

**Prompt**:
```
Crie src/ui/styles/variables.css — design tokens.

:root {
  /* Colors — Família Padilha theme */
  --color-primary: #FF6B35;       /* Laranja quente */
  --color-secondary: #5B8C5A;     /* Verde natureza */
  --color-accent: #FFD700;        /* Dourado (coins) */
  --color-danger: #E63946;
  --color-success: #2ECC71;
  --color-info: #3498DB;
  
  /* Backgrounds */
  --bg-dark: rgba(0, 0, 0, 0.85);
  --bg-medium: rgba(20, 20, 40, 0.75);
  --bg-light: rgba(255, 255, 255, 0.1);
  --bg-glass: rgba(255, 255, 255, 0.05);
  
  /* Borders */
  --border-subtle: rgba(255, 255, 255, 0.1);
  --border-active: var(--color-accent);
  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  --border-radius-lg: 12px;
  
  /* Typography */
  --font-primary: 'Press Start 2P', 'Courier New', monospace;
  --font-ui: 'Inter', system-ui, sans-serif;
  --font-size-xs: 10px;
  --font-size-sm: 12px;
  --font-size-md: 14px;
  --font-size-lg: 18px;
  --font-size-xl: 24px;
  
  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  
  /* Shadows */
  --shadow-sm: 0 2px 4px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.4);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.5);
  --shadow-glow: 0 0 20px rgba(255, 215, 0, 0.3);
  
  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 300ms ease;
  --transition-slow: 500ms ease;
  
  /* Z-indices */
  --z-hud: 100;
  --z-menu: 200;
  --z-modal: 300;
  --z-tooltip: 400;
  --z-notification: 500;
}
```

---

## Passo 3 — HUD Components

**Agente**: `@ui-designer`

**Prompt**:
```
Crie componentes HUD em Preact:

1. src/ui/components/hud/HealthBar.tsx
   - Barra de vida com gradiente verde→vermelho
   - Animação de dano (flash + shake)
   - Número de HP visível
   
2. src/ui/components/hud/CoinCounter.tsx
   - Ícone de moeda + contagem
   - Animação de incremento (number ticker)
   - Glow ao coletar
   
3. src/ui/components/hud/Hotbar.tsx
   - 9 slots responsivos
   - Ícones de itens
   - Tooltip on hover
   - Borda animada no slot selecionado
   
4. src/ui/components/hud/Crosshair.tsx
   - Crosshair central customizável
   - Muda de cor ao mirar bloco/NPC
   
5. src/ui/components/hud/Minimap.tsx
   - Canvas minimap com biome colors
   - Rotate com jogador
   - NPCs como dots
   - Zoom in/out com +/-

6. src/ui/components/hud/QuestTracker.tsx
   - Quest ativa com checkboxes
   - Collapsible
   - Progress bars animadas

Todos os HUD components usam hook useGameState() para obter dados.
```

---

## Passo 4 — Menu System

**Agente**: `@ui-designer`

**Prompt**:
```
Crie sistema de menus:

1. PauseMenu.tsx — ESC
   - Resume, Save, Load, Settings, Quit
   - Blur background
   - Smooth enter/exit animation

2. SettingsMenu.tsx
   - Tabs: Video | Audio | Controls | Gameplay
   - Video: render distance, quality, shadows, FOV
   - Audio: volumes (master, music, sfx, ambient)
   - Controls: sensitivity, invert Y, key rebinding
   - Gameplay: language, auto-save interval

3. InventoryScreen.tsx — E
   - Grid layout responsivo
   - Drag & drop com Preact
   - Item details panel
   - Category filters

4. CraftingScreen.tsx — C
   - Crafting grid + recipe book
   - Smooth animations

Todas as telas usam <Modal> component base com:
- Backdrop blur
- Enter/exit animations (scale + opacity)
- ESC para fechar
- Focus trap (acessibilidade)
```

---

## Passo 5 — Animations & Polish

**Agente**: `@ui-designer`

**Prompt**:
```
Crie src/ui/styles/animations.css

/* Entradas */
@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
@keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { ... } }
@keyframes scaleIn { from { transform: scale(0.8); opacity: 0 } to { ... } }
@keyframes bounceIn { 0% { scale: 0 } 60% { scale: 1.1 } 100% { scale: 1 } }

/* Efeitos */
@keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.7 } }
@keyframes glow { 0%, 100% { box-shadow: ... } 50% { box-shadow: brighter } }
@keyframes shake { 0%, 100% { transform: translateX(0) } 25% { translateX(-4px) } 75% { translateX(4px) } }
@keyframes numberTick { from { transform: translateY(-100%) } to { ... } }

/* Notifications */
@keyframes notifyEnter { slideIn from right }
@keyframes notifyExit { slideOut to right }

Componente NotificationStack.tsx:
- Canto superior direito
- Stack de notificações com auto-dismiss
- Tipos: success (verde), info (azul), warning (amarelo), error (vermelho)
- Animação de entrada e saída
- Max 5 visíveis, FIFO
```

---

## Passo 6 — Accessibility (a11y)

**Agente**: `@quality`

**Prompt**:
```
Garanta acessibilidade básica:

1. Todos os botões com aria-label
2. Focus visible em todos os interativos
3. Tab navigation funciona em menus
4. Contraste mínimo WCAG AA (4.5:1)
5. Screen reader friendly nos menus
6. Reduced motion: respeitar prefers-reduced-motion
7. Fonte escalável (rem units)
8. Colorblind-friendly: não depender só de cor
```

---

## Checklist de Conclusão

- [ ] Preact renderiza UI corretamente
- [ ] Design system com tokens CSS
- [ ] 6+ HUD components
- [ ] Pause menu funcional
- [ ] Settings menu com todas as tabs
- [ ] Inventory redesenhada em Preact
- [ ] Crafting redesenhada em Preact
- [ ] Animações suaves em todas as transições
- [ ] Notifications system funciona
- [ ] Focus trap em modais
- [ ] Tab navigation funciona
- [ ] prefers-reduced-motion respeitado
- [ ] Fonte legível em todos os tamanhos
