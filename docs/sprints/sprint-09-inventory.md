# Sprint 09 — Inventory System

> **Fase**: 2 — Gameplay  
> **Agente Principal**: `@gameplay`  
> **Agentes de Apoio**: `@ui-designer`, `@entity-master`  
> **Dependências**: Sprint 07 (ECS), Sprint 08 (Event Bus)  
> **Duração Estimada**: 2-3 dias  

---

## Objetivo

Implementar sistema de inventário completo com hotbar, grid de inventário, drag & drop, stacking e integração com building system.

---

## Passo 1 — Data Model

**Agente**: `@gameplay`

**Prompt**:
```
Crie src/gameplay/inventory/types.ts com o modelo de dados.

interface ItemDefinition {
  id: string;           // 'block_grass', 'block_stone', 'tool_pickaxe'
  name: string;         // Nome de exibição
  category: ItemCategory;
  maxStack: number;     // 1 para ferramentas, 64 para blocos
  icon: string;         // CSS color ou emoji para MVP
  blockType?: number;   // Se for um bloco colocável
  toolType?: ToolType;  // Se for ferramenta
  rarity: Rarity;
}

enum ItemCategory { Block, Tool, Consumable, Material, Special }
enum ToolType { Pickaxe, Axe, Shovel, Sword }
enum Rarity { Common, Uncommon, Rare, Epic, Legendary }

interface ItemStack {
  itemId: string;
  quantity: number;
}

interface InventorySlot {
  stack: ItemStack | null;
}

// Inventário completo: 36 slots (9 hotbar + 27 backpack)
interface InventoryData {
  slots: InventorySlot[];  // 36 total
  hotbarSize: number;      // 9
  selectedSlot: number;    // 0-8 (hotbar ativo)
}
```

---

## Passo 2 — Item Registry

**Agente**: `@gameplay`

**Prompt**:
```
Crie src/gameplay/inventory/ItemRegistry.ts

class ItemRegistry {
  private items: Map<string, ItemDefinition>;
  
  register(item: ItemDefinition): void;
  get(id: string): ItemDefinition | undefined;
  getAll(): ItemDefinition[];
  getByCategory(cat: ItemCategory): ItemDefinition[];
  
  // Registrar todos os itens padrão
  static createDefault(): ItemRegistry;
}

Itens padrão a registrar:
- Blocos: grass, dirt, stone, sand, wood_log, wood_planks, leaves,
  brick, glass, cobblestone, wool_white, wool_red, wool_blue
- Ferramentas: pickaxe_wood, axe_wood, shovel_wood, sword_wood
- Especiais: coin_gold (collected coins)
```

---

## Passo 3 — Inventory Manager

**Agente**: `@gameplay`

**Prompt**:
```
Crie src/gameplay/inventory/InventoryManager.ts

class InventoryManager {
  private data: InventoryData;
  private registry: ItemRegistry;
  private eventBus: EventBus;
  
  constructor(registry: ItemRegistry);
  
  // Operações principais
  addItem(itemId: string, quantity?: number): number; // Retorna quantidade que não coube
  removeItem(itemId: string, quantity?: number): boolean;
  getSlot(index: number): InventorySlot;
  setSlot(index: number, stack: ItemStack | null): void;
  
  // Hotbar
  getSelectedSlot(): number;
  setSelectedSlot(index: number): void;
  getSelectedItem(): ItemStack | null;
  
  // Utilidades
  hasItem(itemId: string, quantity?: number): boolean;
  countItem(itemId: string): number;
  getFirstEmptySlot(): number | null;
  
  // Stacking logic
  canStack(slot: number, itemId: string): boolean;
  
  // Swap/Move
  swapSlots(from: number, to: number): void;
  splitStack(slot: number, targetSlot: number, quantity: number): void;
  
  // Serialização
  serialize(): string;
  deserialize(json: string): void;
  
  // Eventos emitidos:
  // 'inventory:changed' — qualquer alteração
  // 'inventory:slotSelected' — mudou slot ativo
  // 'inventory:itemAdded' — item adicionado
  // 'inventory:itemRemoved' — item removido
}

REGRAS DE STACKING:
- addItem busca primeiro slot com mesmo item que não está cheio
- Se não encontrar, usa primeiro slot vazio
- Se inventário cheio, retorna quantidade restante
- splitStack divide stack ao meio ou quantidade específica
```

---

## Passo 4 — Hotbar UI

**Agente**: `@ui-designer`

**Prompt**:
```
Refatore a toolbar existente em ui.ts para usar InventoryManager.

1. Hotbar mostra os 9 primeiros slots do inventário
2. Cada slot mostra: ícone do item + quantidade (se > 1)
3. Scroll do mouse ou teclas 1-9 mudam slot selecionado
4. Slot selecionado tem borda dourada
5. Slot vazio mostra fundo semi-transparente
6. Integrar com BuildingSystem: slot selecionado determina bloco a colocar

CSS:
- .hotbar { display: flex; gap: 2px; }
- .hotbar-slot { width: 48px; height: 48px; border: 2px solid rgba(255,255,255,0.3); }
- .hotbar-slot.selected { border-color: gold; box-shadow: 0 0 10px gold; }
- .hotbar-slot .quantity { position: absolute; bottom: 2px; right: 4px; font-size: 12px; }
```

---

## Passo 5 — Inventory Grid UI

**Agente**: `@ui-designer`

**Prompt**:
```
Crie a UI de inventário completa (abre com E ou Tab).

1. Modal overlay com grid 9×4 (hotbar separado embaixo)
2. Drag & drop entre slots (HTML5 drag API ou mousedown/move/up)
3. Click direito: split stack ao meio
4. Shift+click: move entre hotbar e backpack
5. Hover: tooltip com nome do item, raridade, descrição
6. Animação de abertura/fechamento (scale + fade)
7. Background blur no jogo enquanto aberto
8. ESC ou E fecha o inventário

IMPORTANTE: Pausar input do jogo enquanto inventário está aberto
(mouse não rotaciona câmera, WASD não move)
```

---

## Passo 6 — Integração com Building

**Agente**: `@gameplay`

**Prompt**:
```
Integre InventoryManager com BuildingSystem:

1. Colocar bloco (click esquerdo):
   - Verifica se slot selecionado tem bloco
   - Consome 1 do stack
   - Coloca bloco do tipo correspondente
   
2. Remover bloco (click direito):
   - Remove bloco do mundo
   - Adiciona ao inventário (se houver espaço)
   - Se inventário cheio: notificação "Inventário cheio!"

3. Inicialização:
   - Jogador começa com stack de cada tipo de bloco (10 cada)
   - Blocos iniciais configuráveis em GameSettings

4. Coins coletados vão para slot especial ou são contados separadamente
```

---

## Checklist de Conclusão

- [ ] ItemDefinition com 15+ itens registrados
- [ ] ItemRegistry com busca por ID e categoria
- [ ] InventoryManager com add/remove/swap/split
- [ ] Stacking funciona (max 64 para blocos)
- [ ] Hotbar UI renderiza corretamente
- [ ] 1-9 e scroll mudam slot
- [ ] Inventory grid abre/fecha com E
- [ ] Drag & drop funciona
- [ ] Split stack funciona
- [ ] Building consome itens do inventário
- [ ] Remover bloco adiciona ao inventário
- [ ] Input pausa enquanto inventário aberto
- [ ] Serialização funciona (para save/load futuro)
- [ ] Eventos disparados corretamente
