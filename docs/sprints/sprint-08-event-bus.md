# Sprint 08 — Event Bus & Communication

> **Fase**: 1 — Motor de Jogo  
> **Agente Principal**: `@architect`  
> **Agentes de Apoio**: `@engine`, `@entity-master`  
> **Dependências**: Sprint 07 (ECS)  
> **Duração Estimada**: 1-2 dias  

---

## Objetivo

Implementar um sistema de eventos pub/sub tipado para comunicação desacoplada entre systems, UI e módulos do jogo. Eliminar dependências diretas entre módulos.

---

## Passo 1 — Event Types

**Agente**: `@architect`

**Prompt**:
```
Crie src/core/events.ts com todos os tipos de evento do jogo.

// Base
interface GameEvent {
  type: string;
  timestamp: number;
}

// Eventos do jogo
interface PlayerMovedEvent extends GameEvent {
  type: 'player:moved';
  position: { x: number; y: number; z: number };
}

interface PlayerJumpedEvent extends GameEvent {
  type: 'player:jumped';
}

interface CoinCollectedEvent extends GameEvent {
  type: 'coin:collected';
  entityId: number;
  value: number;
  totalCoins: number;
}

interface BlockPlacedEvent extends GameEvent {
  type: 'block:placed';
  position: { x: number; y: number; z: number };
  blockType: number;
}

interface BlockRemovedEvent extends GameEvent {
  type: 'block:removed';
  position: { x: number; y: number; z: number };
}

interface NPCInteractionEvent extends GameEvent {
  type: 'npc:interact';
  npcEntityId: number;
  npcName: string;
  dialog: string;
}

interface DamageTakenEvent extends GameEvent {
  type: 'player:damage';
  amount: number;
  source: string;
}

interface CameraModeChangedEvent extends GameEvent {
  type: 'camera:modeChanged';
  mode: 'first-person' | 'third-person';
}

interface ChunkLoadedEvent extends GameEvent {
  type: 'chunk:loaded';
  chunkX: number;
  chunkZ: number;
}

interface ChunkUnloadedEvent extends GameEvent {
  type: 'chunk:unloaded';
  chunkX: number;
  chunkZ: number;
}

interface GameStateChangedEvent extends GameEvent {
  type: 'game:stateChanged';
  from: string;
  to: string;
}

interface UINotificationEvent extends GameEvent {
  type: 'ui:notification';
  message: string;
  duration: number;
  style?: 'info' | 'success' | 'warning' | 'error';
}

// Union type para type-safe dispatch
type GameEventMap = {
  'player:moved': PlayerMovedEvent;
  'player:jumped': PlayerJumpedEvent;
  'coin:collected': CoinCollectedEvent;
  'block:placed': BlockPlacedEvent;
  'block:removed': BlockRemovedEvent;
  'npc:interact': NPCInteractionEvent;
  'player:damage': DamageTakenEvent;
  'camera:modeChanged': CameraModeChangedEvent;
  'chunk:loaded': ChunkLoadedEvent;
  'chunk:unloaded': ChunkUnloadedEvent;
  'game:stateChanged': GameStateChangedEvent;
  'ui:notification': UINotificationEvent;
};
```

---

## Passo 2 — EventBus Implementation

**Agente**: `@architect`

**Prompt**:
```
Crie src/core/EventBus.ts — event bus tipado e singleton.

class EventBus {
  private static instance: EventBus;
  private listeners: Map<string, Set<Function>>;
  private onceListeners: Map<string, Set<Function>>;
  private eventQueue: GameEvent[]; // Para processamento em batch
  
  static getInstance(): EventBus;
  
  // Subscribe
  on<K extends keyof GameEventMap>(
    type: K,
    callback: (event: GameEventMap[K]) => void
  ): () => void; // Retorna função de unsubscribe
  
  // Subscribe once
  once<K extends keyof GameEventMap>(
    type: K,
    callback: (event: GameEventMap[K]) => void
  ): () => void;
  
  // Publish
  emit<K extends keyof GameEventMap>(
    type: K,
    data: Omit<GameEventMap[K], 'type' | 'timestamp'>
  ): void;
  
  // Batch processing (processar fila no final do frame)
  queue<K extends keyof GameEventMap>(
    type: K,
    data: Omit<GameEventMap[K], 'type' | 'timestamp'>
  ): void;
  flush(): void; // Processa todos os eventos da fila
  
  // Cleanup
  off<K extends keyof GameEventMap>(type: K, callback: Function): void;
  removeAllListeners(type?: string): void;
  
  // Debug
  getListenerCount(type?: string): number;
}

IMPORTANTE:
- emit() adiciona type e timestamp automaticamente
- on() retorna função de unsubscribe para facilitar cleanup
- queue/flush para eventos que podem ser batched (ex: chunk loading)
```

---

## Passo 3 — Integrar com Systems

**Agente**: `@entity-master`

**Prompt**:
```
Atualize os ECS Systems para usar EventBus ao invés de referências diretas.

1. CollectibleSystem:
   - Ao coletar coin: eventBus.emit('coin:collected', { entityId, value, totalCoins })
   - UI escuta 'coin:collected' para atualizar HUD (ao invés de referência direta)

2. Crie InputSystem (src/ecs/systems/InputSystem.ts):
   - Escuta keyboard/mouse events
   - Emite 'player:jumped' quando espaço é pressionado
   - Seta componentes de Velocity baseado em input

3. Crie NPCInteractionSystem:
   - Quando jogador está perto de NPC e pressiona E
   - Emite 'npc:interact' com dados do NPC
   - UI escuta para mostrar diálogo

4. Building System:
   - Ao colocar bloco: emit('block:placed', ...)
   - Ao remover bloco: emit('block:removed', ...)
   - ChunkManager escuta para atualizar mesh do chunk
```

---

## Passo 4 — UI Event Listeners

**Agente**: `@ui-designer`

**Prompt**:
```
Refatore ui.ts para usar EventBus.

1. UI escuta eventos ao invés de ser chamada diretamente:
   eventBus.on('coin:collected', (e) => this.updateCoinCounter(e.totalCoins));
   eventBus.on('npc:interact', (e) => this.showDialog(e.npcName, e.dialog));
   eventBus.on('ui:notification', (e) => this.showNotification(e.message, e.style));
   eventBus.on('player:damage', (e) => this.flashDamage());
   eventBus.on('game:stateChanged', (e) => this.updateGameState(e.to));

2. UI emite eventos para ações:
   - Chat submit: eventBus.emit('chat:message', { text })
   - Toolbar selection: eventBus.emit('toolbar:select', { slot })

3. Guardar funções de unsubscribe para cleanup no destroy()
```

---

## Passo 5 — Debug & Monitoring

**Agente**: `@quality`

**Prompt**:
```
Adicione ferramentas de debug ao EventBus:

1. EventBus.enableDebug(patterns: string[]): void
   - Loga eventos que matcham os patterns no console
   - Ex: enableDebug(['coin:*', 'player:*'])

2. EventBus.getStats(): { eventCounts: Record<string, number>, totalEmitted: number }
   - Conta quantos eventos de cada tipo foram emitidos
   - Útil para profiling

3. Crie src/debug/EventMonitor.ts
   - Overlay visual que mostra eventos em tempo real
   - Ativado com tecla F9
   - Mostra últimos 20 eventos com timestamp e dados
```

---

## Checklist de Conclusão

- [ ] GameEventMap com 12+ tipos de evento
- [ ] EventBus com on/off/once/emit/queue/flush
- [ ] Type-safe: TypeScript garante tipos corretos
- [ ] on() retorna unsubscribe function
- [ ] CollectibleSystem usa EventBus
- [ ] NPCInteractionSystem usa EventBus
- [ ] Building usa EventBus
- [ ] UI refatorada para listener pattern
- [ ] Debug tools funcionam
- [ ] Zero referências diretas entre systems e UI
- [ ] Performance: emit() < 0.1ms
