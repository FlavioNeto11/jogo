# Sprint 12 — Quest System

> **Fase**: 2 — Gameplay  
> **Agente Principal**: `@gameplay`  
> **Agentes de Apoio**: `@ui-designer`, `@entity-master`  
> **Dependências**: Sprint 09 (Inventory), Sprint 11 (AI)  
> **Duração Estimada**: 3 dias  

---

## Objetivo

Sistema de missões para dar direção ao gameplay. Quests temáticas da família com objetivos progressivos, recompensas e tracking visual.

---

## Passo 1 — Quest Data Model

**Agente**: `@gameplay`

**Prompt**:
```
Crie src/gameplay/quests/types.ts

enum QuestStatus { Locked, Available, Active, Completed, Failed }
enum ObjectiveType { Collect, Craft, Build, TalkTo, Explore, Destroy }

interface QuestObjective {
  id: string;
  type: ObjectiveType;
  description: string;
  target: string;          // itemId, npcName, location, blockType
  requiredCount: number;
  currentCount: number;
  completed: boolean;
}

interface QuestReward {
  items?: { itemId: string; quantity: number }[];
  coins?: number;
  xp?: number;
  unlocks?: string[];      // IDs de quests ou recipes desbloqueados
}

interface Quest {
  id: string;
  title: string;
  description: string;
  giver: string;            // NPC que dá a quest
  category: QuestCategory;
  objectives: QuestObjective[];
  rewards: QuestReward;
  prerequisites: string[];  // Quest IDs necessários
  status: QuestStatus;
  isMainQuest: boolean;
  dialog: {
    start: string[];        // Diálogo ao aceitar
    progress: string[];     // Diálogo durante
    complete: string[];     // Diálogo ao completar
  };
}

enum QuestCategory { MainStory, Family, Building, Exploration, Collection }
```

---

## Passo 2 — Quest Registry & Default Quests

**Agente**: `@gameplay`

**Prompt**:
```
Crie src/gameplay/quests/QuestRegistry.ts com quests padrão.

QUEST LINE PRINCIPAL — "Família Padilha: O Novo Mundo"

Q1: "Primeiros Passos" (Ana Paula)
  - Coletar 10 blocos de madeira
  - Colocar 5 blocos
  - Recompensa: Picareta de madeira, 50 coins
  
Q2: "Casa da Família" (Ana Paula)
  - Construir estrutura 5×5×3 (detectar paredes e teto)
  - Colocar porta (block especial)
  - Recompensa: Materiais de decoração, 100 coins
  - Prerequisito: Q1

Q3: "Aventura da MaFe" (MaFe)
  - Explorar 3 biomas diferentes
  - Coletar 5 flores (items especiais)
  - Recompensa: Mapa do tesouro, 75 coins
  - Prerequisito: Q1

Q4: "Brinquedos da Juju" (Juju)
  - Coletar 20 coins
  - Craftar 3 blocos de lã colorida
  - Recompensa: Bloco especial (arco-íris), 50 coins
  - Prerequisito: Q1

Q5: "A Grande Construção" (Flávio)
  - Completar Q2, Q3, Q4
  - Construir playground (área 10x10 com itens específicos)
  - Recompensa: Desbloqueio de blocos especiais, 500 coins
  - Prerequisito: Q2, Q3, Q4

SIDE QUESTS:
S1: "Colecionador" — Coletar 100 coins total
S2: "Arquiteto" — Colocar 200 blocos
S3: "Explorador" — Andar 1000 blocos de distância
S4: "Chef" — Craftar 10 itens diferentes
```

---

## Passo 3 — Quest Manager

**Agente**: `@gameplay`

**Prompt**:
```
Crie src/gameplay/quests/QuestManager.ts

class QuestManager {
  private quests: Map<string, Quest>;
  private activeQuests: Set<string>;
  private eventBus: EventBus;
  private inventory: InventoryManager;
  
  // Quest lifecycle
  startQuest(questId: string): boolean;
  abandonQuest(questId: string): void;
  completeQuest(questId: string): void;
  
  // Progress tracking
  updateObjective(questId: string, objectiveId: string, increment?: number): void;
  checkAutoComplete(questId: string): boolean;
  
  // Queries
  getActiveQuests(): Quest[];
  getAvailableQuests(): Quest[];
  getCompletedQuests(): Quest[];
  getQuestByNPC(npcName: string): Quest[];
  
  // Event handlers automáticos
  private setupEventListeners(): void;
  // Escuta 'coin:collected' → atualiza quests de collect coin
  // Escuta 'block:placed' → atualiza quests de build
  // Escuta 'crafting:crafted' → atualiza quests de craft
  // Escuta 'npc:interact' → verifica se NPC tem quest
  
  // Prerequisitos
  private checkPrerequisites(questId: string): boolean;
  private unlockDependentQuests(completedQuestId: string): void;
  
  // Recompensas
  private grantRewards(quest: Quest): void;
  
  // Serialização
  serialize(): string;
  deserialize(json: string): void;
}
```

---

## Passo 4 — Quest UI

**Agente**: `@ui-designer`

**Prompt**:
```
Crie interfaces de quest:

1. Quest Tracker (HUD) — canto superior direito
   - Mostra quest ativa principal
   - Até 3 objetivos visíveis com checkboxes
   - Progress bar para objetivos numéricos
   - Minimizável com click
   
2. Quest Journal (abre com J)
   - Tabs: Ativas | Disponíveis | Completas
   - Lista de quests com ícone de categoria
   - Detalhes da quest selecionada
   - Botões: Aceitar / Abandonar / Rastrear
   
3. Quest Dialog
   - Quando falar com NPC que tem quest
   - Mostra diálogo do NPC (typewriter effect)
   - Mostra objetivos e recompensas
   - Botões: Aceitar / Recusar
   
4. Quest Complete
   - Overlay de celebração
   - Mostra recompensas recebidas com animação
   - Partículas douradas
   - Som de fanfarra

5. NPC Quest Indicator
   - "!" amarelo flutuante acima de NPC com quest disponível
   - "?" amarelo acima de NPC com quest em progresso
   - "!" cinza acima de NPC com quest locked
   - Sprite ou 3D text (Three.js Sprite)
```

---

## Passo 5 — Integração com NPCs

**Agente**: `@entity-master`

**Prompt**:
```
Integre quests com NPCs via ECS:

1. Novo componente: QuestGiverComponent
   interface QuestGiverComponent {
     questIds: string[];
     hasAvailableQuest: boolean;
     hasActiveQuest: boolean;
     indicatorMesh: THREE.Sprite | null;
   }

2. QuestIndicatorSystem:
   - Atualiza indicadores (!, ?) baseado no status das quests
   - Billboard (sempre virado para câmera)
   - Bounce animation

3. Interação:
   - Quando jogador interage com NPC (E):
     - Se tem quest disponível: abre Quest Dialog
     - Se tem quest ativa: mostra progress dialog
     - Se quest completa: mostra completion dialog
     - Se nenhuma: diálogo normal do NPC
```

---

## Checklist de Conclusão

- [ ] Quest data model com objectives e rewards
- [ ] 5 quests da main story line implementadas
- [ ] 4+ side quests implementadas
- [ ] QuestManager com lifecycle completo
- [ ] Event-driven progress tracking
- [ ] Quest Tracker no HUD
- [ ] Quest Journal com tabs
- [ ] Quest Dialog com typewriter effect
- [ ] Quest Complete overlay com celebração
- [ ] NPC indicators (!, ?)
- [ ] Prerequisitos funcionam
- [ ] Recompensas concedidas corretamente
- [ ] Serialização para save/load
