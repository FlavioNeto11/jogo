# Sprint 21 — Mobile Support & Touch Controls

> **Fase**: 4 — Polimento  
> **Agente Principal**: `@ui-designer`  
> **Agentes de Apoio**: `@engine`  
> **Dependências**: Sprint 20 (UI/UX Pro)  
> **Duração Estimada**: 2-3 dias  

---

## Objetivo

Tornar o jogo totalmente jogável em dispositivos móveis com controles touch, responsividade e otimizações de performance.

---

## Passo 1 — Touch Controls

**Agente**: `@ui-designer`

**Prompt**:
```
Crie src/input/TouchControls.ts

1. Virtual Joystick (esquerda):
   - Círculo touch para movimento (WASD)
   - Deadzone central
   - Analog: distância do centro = velocidade
   - Visual: círculo externo + thumb interno

2. Camera Touch (direita):
   - Arrastar lado direito da tela = rotação câmera
   - Sensibilidade configurável
   - Pinch to zoom (terceira pessoa)

3. Action Buttons:
   - Jump: botão flutuante canto inferior direito
   - Place/Break: tap no centro da tela
   - Inventory: botão no canto
   - Chat: botão

4. Hotbar Swipe:
   - Swipe horizontal no hotbar para mudar slot
   - Ou tap direto no slot

5. Gesture Support:
   - Double tap: interagir com NPC
   - Long press: remover bloco
   - Tap: colocar bloco
```

---

## Passo 2 — Responsive Layout

**Agente**: `@ui-designer`

**Prompt**:
```
Adapte toda a UI para mobile:

1. Media queries:
   @media (max-width: 768px) — Tablet
   @media (max-width: 480px) — Mobile
   @media (pointer: coarse) — Touch device

2. Adaptações:
   - HUD: elementos menores, mais espaçados para toque
   - Hotbar: slots maiores (mínimo 44px touch target)
   - Menus: full screen em mobile
   - Inventory: grid 2 colunas em portrait, 4 em landscape
   - Chat: teclado virtual não cobre o chat
   - Minimap: ocultável em mobile

3. Orientação:
   - Forçar landscape para gameplay
   - Mostrar aviso "Gire o dispositivo" em portrait
   - Lock orientation via Screen API se disponível

4. Safe areas:
   - Respeitar env(safe-area-inset-*) para notch
```

---

## Passo 3 — Performance Mobile

**Agente**: `@engine`

**Prompt**:
```
Otimizações específicas para mobile:

1. Detectar mobile:
   const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent) 
     || (navigator.maxTouchPoints > 0 && window.innerWidth < 1024);

2. Configurações automáticas para mobile:
   - Render distance: 4 chunks (vs 8 desktop)
   - Shadow quality: disabled ou low (512)
   - Pixel ratio: max 1.5 (vs 2.0)
   - Max draw calls: 30
   - Particle count: 50% do desktop
   - LOD distance: 50% do desktop
   - Fog closer
   - Lower poly NPCs (futuro)

3. Frame rate:
   - Target 30 FPS em mobile (vs 60 desktop)
   - Adaptive quality: se FPS < 25, reduzir automaticamente

4. Memory:
   - Chunk cache menor (8 vs 16)
   - Texture compression
   - Dispose agressivo de chunks distantes

5. Battery saving:
   - requestAnimationFrame respeitado
   - Pausar quando tab não visível
   - Throttle physics quando longe de entidades
```

---

## Passo 4 — PWA Hints

**Agente**: `@devops`

**Prompt**:
```
Preparar para PWA (Sprint 25):
- viewport meta tag correto
- theme-color meta tag
- apple-mobile-web-app-capable
- Fullscreen API ao iniciar
- Disable zoom (user-scalable=no) durante gameplay
- Re-enable zoom em menus/configurações
```

---

## Checklist de Conclusão

- [ ] Virtual joystick funciona
- [ ] Camera touch funciona
- [ ] Action buttons responsivos
- [ ] Gestures (tap, long press, double tap)
- [ ] Layout responsivo em todas as telas
- [ ] Landscape forçado durante gameplay
- [ ] Safe areas respeitadas
- [ ] Performance estável 30FPS em mobile médio
- [ ] Adaptive quality funciona
- [ ] Touch targets ≥ 44px
- [ ] Hotbar usável com dedos
- [ ] Inventário usável em mobile
