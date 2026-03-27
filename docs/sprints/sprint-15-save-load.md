# Sprint 15 — Save/Load System

> **Fase**: 3 — Persistência  
> **Agente Principal**: `@gameplay`  
> **Agentes de Apoio**: `@architect`  
> **Dependências**: Sprint 09 (Inventory), Sprint 12 (Quests)  
> **Duração Estimada**: 2 dias  

---

## Objetivo

Persistir todo o estado do jogo em localStorage (e IndexedDB para mundos grandes), permitindo salvar e carregar progresso do jogador.

---

## Passo 1 — Save Data Schema

**Agente**: `@architect`

**Prompt**:
```
Crie src/persistence/types.ts

interface SaveData {
  version: number;         // Schema version para migrations
  timestamp: number;
  playTime: number;        // Segundos jogados
  
  player: PlayerSaveData;
  world: WorldSaveData;
  inventory: InventorySaveData;
  quests: QuestSaveData;
  settings: GameSettings;
}

interface PlayerSaveData {
  position: { x: number; y: number; z: number };
  rotation: number;
  health: number;
  coins: number;
  stats: {
    blocksPlaced: number;
    blocksRemoved: number;
    coinsCollected: number;
    distanceWalked: number;
    timePlayed: number;
  };
}

interface WorldSaveData {
  seed: number;
  modifiedBlocks: ModifiedBlock[]; // Apenas blocos alterados pelo jogador
  gameTime: number;                // Hora do dia
  weather: string;
}

interface ModifiedBlock {
  x: number; y: number; z: number;
  blockType: number;              // 0 = removido
  timestamp: number;
}

interface InventorySaveData {
  slots: (SerializedItemStack | null)[];
  selectedSlot: number;
}

interface SerializedItemStack {
  itemId: string;
  quantity: number;
}

interface QuestSaveData {
  active: string[];
  completed: string[];
  objectives: Record<string, Record<string, number>>; // questId → objectiveId → count
}
```

---

## Passo 2 — SaveManager

**Agente**: `@gameplay`

**Prompt**:
```
Crie src/persistence/SaveManager.ts

class SaveManager {
  private static readonly STORAGE_KEY = 'mafe-juju-world-save';
  private static readonly VERSION = 1;
  
  // Save
  static save(game: Game): boolean;
  static autoSave(game: Game): void; // A cada 5 minutos
  
  // Load
  static load(): SaveData | null;
  static hasSave(): boolean;
  
  // Delete
  static deleteSave(): void;
  
  // Export/Import (para compartilhar saves)
  static exportSave(): string; // Base64 encoded JSON
  static importSave(data: string): boolean;
  
  // Versioning
  static migrate(data: any): SaveData; // Migra schemas antigos
  
  // Compressão para mundos grandes
  private static compressBlocks(blocks: ModifiedBlock[]): string;
  private static decompressBlocks(data: string): ModifiedBlock[];
}

IMPORTANTE:
- Salvar APENAS blocos modificados pelo jogador (não o mundo inteiro)
- O mundo é regenerado pela seed, modificações são reaplicadas em cima
- localStorage limit ~5MB, então comprimir blocos
- AutoSave não deve causar lag (requestIdleCallback ou Web Worker)
```

---

## Passo 3 — World Reconstruction

**Agente**: `@world-builder`

**Prompt**:
```
Implemente reconstrução do mundo a partir de save:

1. Carregar seed → regenerar terreno procedural
2. Aplicar modifiedBlocks em cima do terreno
3. Restaurar posição do jogador
4. Restaurar inventário
5. Restaurar quests (status e progresso)
6. Restaurar hora do dia e clima
7. Restaurar NPCs nas posições default (NPCs não persistem posição)

Ordem de carregamento:
1. Parse save data
2. Init world with seed
3. Generate chunks ao redor do jogador
4. Apply block modifications
5. Spawn player na posição salva
6. Restore inventory
7. Restore quests
8. Resume game time
```

---

## Passo 4 — Save/Load UI

**Agente**: `@ui-designer`

**Prompt**:
```
Crie interfaces de save/load:

1. Pause Menu (ESC):
   - Continuar
   - Salvar Jogo ✅ (feedback visual)
   - Carregar Jogo
   - Novo Jogo
   - Configurações
   
2. Save Confirmation:
   - "Jogo salvo!" com ícone de check verde
   - Fade out em 2 segundos
   
3. Load Confirmation:
   - "Carregar jogo salvo? Progresso não salvo será perdido."
   - Mostrar: data do save, tempo jogado, coins
   - Botões: Carregar / Cancelar

4. New Game Confirmation:
   - "Iniciar novo jogo? O save atual será apagado."
   - Botões: Novo Jogo / Cancelar

5. Auto-save Indicator:
   - Ícone de disquete/salvar no canto
   - Aparece brevemente durante auto-save
   - "Salvando..." → "Salvo ✓"
```

---

## Passo 5 — IndexedDB para Mundos Grandes

**Agente**: `@architect`

**Prompt**:
```
Crie src/persistence/WorldDB.ts usando IndexedDB para dados grandes.

class WorldDB {
  private db: IDBDatabase;
  
  static async open(): Promise<WorldDB>;
  
  // Chunks modificados (muito dado para localStorage)
  async saveChunkModifications(chunkKey: string, blocks: ModifiedBlock[]): Promise<void>;
  async loadChunkModifications(chunkKey: string): Promise<ModifiedBlock[]>;
  
  // Thumbnails dos saves (screenshot do jogo)
  async saveThumbnail(saveId: string, imageData: Blob): Promise<void>;
  async loadThumbnail(saveId: string): Promise<Blob | null>;
  
  // Cleanup
  async clear(): Promise<void>;
}

Usar apenas quando localStorage não é suficiente.
Fallback para localStorage se IndexedDB não disponível.
```

---

## Checklist de Conclusão

- [ ] SaveData schema versionado
- [ ] Save para localStorage funciona
- [ ] Load reconstrói mundo corretamente
- [ ] Auto-save a cada 5 minutos
- [ ] Pause menu com save/load/new game
- [ ] Export/import de saves
- [ ] Blocos modificados persistidos
- [ ] Inventário persistido
- [ ] Quests persistidas
- [ ] Schema migration funciona
- [ ] IndexedDB para mundos grandes
- [ ] Auto-save indicator no HUD
- [ ] Sem lag durante save
