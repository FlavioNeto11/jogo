# Sprint 23 — In-Game World Editor

> **Fase**: 5 — Beyond  
> **Agente Principal**: `@world-builder`  
> **Agentes de Apoio**: `@ui-designer`, `@gameplay`  
> **Dependências**: Sprint 09 (Inventory), Sprint 14 (Biomes), Sprint 15 (Save/Load)  
> **Duração Estimada**: 4-5 dias  

---

## Objetivo

Editor de mundo in-game para criação de mapas customizados, com ferramentas de construção avançadas, copiar/colar, brushes e export/import.

---

## Passo 1 — Editor Mode Toggle

**Agente**: `@architect`

**Prompt**:
```
Crie src/editor/EditorMode.ts

class EditorMode {
  private active: boolean = false;
  
  toggle(): void;
  isActive(): boolean;
  
  // Quando ativo:
  // - Voo livre (sem gravidade, WASD + Space/Shift)
  // - Velocidade de movimento 3x
  // - Grid overlay visível
  // - Toolbar muda para editor tools
  // - Inventário infinito (todos os blocos)
  // - UI de editor aparece
  
  // Atalho: F1 para ativar/desativar
}
```

---

## Passo 2 — Advanced Building Tools

**Agente**: `@world-builder`

**Prompt**:
```
Crie src/editor/tools/ com ferramentas de editor:

1. BrushTool.ts — Pintar blocos
   - Tamanho: 1-5 blocos
   - Formato: cubo, esfera, cilindro
   - Click = preencher área com tipo de bloco selecionado
   
2. EraseTool.ts — Apagar área
   - Mesmo que brush mas remove blocos
   
3. FillTool.ts — Preencher volume
   - Selecionar 2 cantos → preencher retângulo
   - Com bloco selecionado ou ar (clear)
   
4. SelectTool.ts — Seleção de região
   - 2 cliques para selecionar região cúbica
   - Visual: wireframe dos limites
   - Operações: copy, paste, delete, fill, replace
   
5. ReplaceTool.ts — Substituir bloco
   - Seleciona tipo original → tipo novo
   - Aplica em seleção ou mundo inteiro (chunk)
   
6. TerrainTool.ts — Moldar terreno
   - Raise: elevar terreno
   - Lower: abaixar terreno
   - Smooth: suavizar
   - Flatten: nivelar
   - Brush size: 3-10
```

---

## Passo 3 — Copy/Paste & Schematics

**Agente**: `@world-builder`

**Prompt**:
```
Crie src/editor/SchematicManager.ts

interface Schematic {
  id: string;
  name: string;
  size: { x: number; y: number; z: number };
  blocks: { rx: number; ry: number; rz: number; type: number }[];
  author: string;
  createdAt: number;
}

class SchematicManager {
  copy(selection: Selection): Schematic;
  paste(schematic: Schematic, position: Vector3, rotation?: number): void;
  
  save(schematic: Schematic): void;      // Para localStorage
  load(id: string): Schematic | null;
  list(): SchematicInfo[];
  delete(id: string): void;
  
  exportJSON(schematic: Schematic): string;
  importJSON(json: string): Schematic;
  
  // Clipboard
  clipboard: Schematic | null;
  
  // Rotate/mirror before pasting
  rotate90(schematic: Schematic): Schematic;
  mirrorX(schematic: Schematic): Schematic;
  mirrorZ(schematic: Schematic): Schematic;
}

Uso: Ctrl+C para copiar seleção, Ctrl+V para colar, R para rotacionar preview.
```

---

## Passo 4 — Editor UI

**Agente**: `@ui-designer`

**Prompt**:
```
Crie UI do editor:

1. Editor Toolbar (topo):
   - Tool buttons: Brush, Erase, Fill, Select, Replace, Terrain
   - Tool-specific options (tamanho, formato)
   - Block picker (grid de todos os blocos)
   - Undo/Redo buttons

2. Properties Panel (lateral):
   - Propriedades da tool selecionada
   - Brush size slider
   - Shape selector
   - Preview do bloco

3. Schematic Library (lateral):
   - Lista de schematics salvos
   - Thumbnail preview
   - Import/Export buttons
   - Search/filter

4. Status Bar (inferior):
   - Coordenadas do cursor
   - Tamanho da seleção
   - Bloco sob cursor
   - FPS
```

---

## Passo 5 — Undo/Redo

**Agente**: `@architect`

**Prompt**:
```
Crie src/editor/History.ts — sistema de undo/redo.

class EditorHistory {
  private undoStack: EditorAction[];
  private redoStack: EditorAction[];
  private maxHistory: number = 100;
  
  push(action: EditorAction): void;
  undo(): void;
  redo(): void;
  canUndo(): boolean;
  canRedo(): boolean;
  clear(): void;
}

interface EditorAction {
  type: string;
  changes: BlockChange[];  // Blocos antes e depois
  timestamp: number;
}

Atalhos: Ctrl+Z = undo, Ctrl+Y = redo
Batch: múltiplos blocos de um brush stroke = 1 action
```

---

## Checklist de Conclusão

- [ ] Editor mode toggle com F1
- [ ] Voo livre no editor
- [ ] 6 ferramentas de editor
- [ ] Brush com tamanhos e formatos
- [ ] Fill de volumes
- [ ] Select + copy/paste
- [ ] Schematics save/load/export
- [ ] Rotate/mirror schematics
- [ ] Editor UI com toolbar e panels
- [ ] Block picker com todos os blocos
- [ ] Undo/redo funciona (100 steps)
- [ ] Terrain sculpting funciona
