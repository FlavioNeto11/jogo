# Sprint 10 — Crafting System

> **Fase**: 2 — Gameplay  
> **Agente Principal**: `@gameplay`  
> **Agentes de Apoio**: `@ui-designer`  
> **Dependências**: Sprint 09 (Inventory)  
> **Duração Estimada**: 2 dias  

---

## Objetivo

Sistema de crafting inspirado em Minecraft: grid 3×3, receitas definidas por patterns, UI intuitiva com preview do resultado.

---

## Passo 1 — Recipe System

**Agente**: `@gameplay`

**Prompt**:
```
Crie src/gameplay/crafting/types.ts e RecipeRegistry.ts

interface CraftingRecipe {
  id: string;
  pattern: (string | null)[][]; // Grid 3x3 ou 2x2
  ingredients: Map<string, string>; // Símbolo → itemId ('W' → 'block_wood_planks')
  result: { itemId: string; quantity: number };
  category: CraftingCategory;
  unlocked: boolean; // Para progressão futura
}

enum CraftingCategory { Tools, Blocks, Decorative, Special }

class RecipeRegistry {
  private recipes: CraftingRecipe[];
  
  register(recipe: CraftingRecipe): void;
  findMatch(grid: (string | null)[][]): CraftingRecipe | null;
  getByCategory(cat: CraftingCategory): CraftingRecipe[];
  getAll(): CraftingRecipe[];
  
  static createDefault(): RecipeRegistry;
}

Receitas padrão:
- 4x wood_log → 16x wood_planks
- 2x wood_planks (vertical) → 4x stick
- 3x wood_planks top + 2x stick center/bottom → wood_pickaxe
- 3x wood_planks top + 2x stick center/bottom (linha) → wood_axe
- 1x wood_planks + 2x stick → wood_shovel
- 2x wood_planks + 1x stick → wood_sword
- 4x cobblestone → 4x stone_brick
- 1x sand (fogo) → 1x glass
- 3x wool → 1x bed
```

---

## Passo 2 — Crafting Manager

**Agente**: `@gameplay`

**Prompt**:
```
Crie src/gameplay/crafting/CraftingManager.ts

class CraftingManager {
  private grid: (ItemStack | null)[][]; // 3x3
  private registry: RecipeRegistry;
  private inventory: InventoryManager;
  
  setSlot(row: number, col: number, stack: ItemStack | null): void;
  getSlot(row: number, col: number): ItemStack | null;
  clearGrid(): void;
  
  // Verifica se grid atual matcha alguma receita
  getResult(): { recipe: CraftingRecipe; result: ItemStack } | null;
  
  // Executa craft: consome ingredientes, retorna resultado
  craft(): ItemStack | null;
  
  // Quick craft: se jogador tem materiais, craft direto sem grid
  quickCraft(recipeId: string, quantity?: number): boolean;
  
  // Retornar itens do grid para inventário
  returnItemsToInventory(): void;
}

REGRAS:
- Pattern matching deve ser flexível: 
  receita 2x2 pode estar em qualquer posição do grid 3x3
- Shaped recipes: posição importa
- Craft consome 1 de cada ingrediente no grid
- Se resultado não cabe no inventário, não craftar
```

---

## Passo 3 — Crafting UI

**Agente**: `@ui-designer`

**Prompt**:
```
Crie a interface de crafting.

1. Abre com C ou botão no inventário
2. Layout:
   - Esquerda: Grid 3×3 de crafting (slots arrastáveis)
   - Centro: Seta → Slot de resultado
   - Direita: Recipe book (lista de receitas conhecidas)
   
3. Interações:
   - Drag item do inventário para grid
   - Resultado aparece automaticamente quando pattern matcha
   - Click no resultado para craftar
   - Shift+click para craftar máximo possível
   
4. Recipe Book:
   - Lista de receitas organizadas por categoria
   - Click numa receita mostra preview dos ingredientes
   - Receitas sem materiais ficam acinzentadas
   - "Quick Craft" button se tem materiais

5. Visual:
   - Mesmo estilo do inventário
   - Grid com bordas arredondadas
   - Seta animada quando resultado disponível
   - Partículas/glow ao craftar
```

---

## Passo 4 — Eventos e Integração

**Agente**: `@gameplay`

**Prompt**:
```
Integre crafting com EventBus e game loop.

Eventos:
- 'crafting:opened' / 'crafting:closed'
- 'crafting:slotChanged' { row, col, item }
- 'crafting:resultAvailable' { recipe, result }
- 'crafting:crafted' { recipe, result, quantity }

Integração:
- Pausa input do jogo enquanto crafting aberto
- Ao fechar, retorna itens do grid para inventário
- Crafting UI é um modal que pode coexistir com inventário
- Notificação "Craftou [item] x[quantity]!"
- Som ao craftar (ping agudo satisfatório)
```

---

## Checklist de Conclusão

- [ ] RecipeRegistry com 10+ receitas
- [ ] Pattern matching funciona (2x2 e 3x3)
- [ ] CraftingManager consome e produz itens
- [ ] Crafting UI com grid 3x3 drag & drop
- [ ] Recipe book mostra receitas por categoria
- [ ] Quick craft funciona
- [ ] Shift+click para craft em massa
- [ ] Itens retornados ao fechar crafting
- [ ] Eventos de crafting emitidos
- [ ] Som de crafting funciona
- [ ] Notificação visual ao craftar
