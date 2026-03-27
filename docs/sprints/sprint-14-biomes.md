# Sprint 14 — Biomes & Procedural Terrain

> **Fase**: 2 — Gameplay  
> **Agente Principal**: `@world-builder`  
> **Agentes de Apoio**: `@engine`, `@entity-master`  
> **Dependências**: Sprint 04 (Chunks), Sprint 05 (LOD)  
> **Duração Estimada**: 3-4 dias  

---

## Objetivo

Expandir o mundo com múltiplos biomas, cada um com terreno, vegetação, cores e atmosfera distintos. Geração procedural baseada em ruído multi-layer.

---

## Passo 1 — Biome Definitions

**Agente**: `@world-builder`

**Prompt**:
```
Crie src/world/biomes/types.ts

interface BiomeDefinition {
  id: string;
  name: string;
  temperature: number;     // -1 (gelado) a 1 (quente)
  humidity: number;        // 0 (deserto) a 1 (floresta)
  heightModifier: number;  // Multiplica altura do terreno
  baseHeight: number;      // Altura base do terreno
  surfaceBlock: number;    // BlockType da superfície
  subsurfaceBlock: number; // BlockType abaixo da superfície
  deepBlock: number;       // BlockType profundo
  waterLevel: number;      // Nível da água (-1 se sem água)
  
  // Vegetação
  treeFrequency: number;   // 0-1
  treeTypes: string[];     // IDs de templates de árvores
  foliageFrequency: number;
  
  // Visual
  fogColor: number;
  fogDensity: number;
  ambientColor: number;
  
  // Estruturas
  structureTypes: string[];
  structureFrequency: number;
}
```

---

## Passo 2 — Biome Types

**Agente**: `@world-builder`

**Prompt**:
```
Crie src/world/biomes/BiomeRegistry.ts com biomas:

1. PLAINS (Planície) — Bioma atual, padrão
   - Grama verde, terreno suave ondulado
   - Árvores esparsas, flores
   - height: 20, surface: grass
   
2. FOREST (Floresta Densa)
   - Muitas árvores altas e juntas
   - Undergrowth (arbustos)
   - height: 25, surface: grass (verde escuro)
   - treeFrequency: 0.3 (alta)

3. DESERT (Deserto)
   - Areia, dunas
   - Cactos (template especial)
   - Sem árvores normais
   - height: 18, surface: sand
   - Sem água
   
4. MOUNTAINS (Montanhas)
   - Terreno muito alto e irregular
   - Neve no topo (acima de Y=40)
   - Pedra exposta
   - height: 50, heightModifier: 2.5
   - surface: stone (alto), grass (baixo)

5. BEACH (Praia)
   - Faixa entre bioma e água
   - Areia, palmeiras
   - Auto-gerado na borda de qualquer bioma com água
   
6. SNOW (Tundra)
   - Neve no chão
   - Árvores de pinheiro (template)
   - Lago congelado (bloco de gelo)
   - temperature: -0.8

7. JUNGLE (Selva) — Futuro, preparar interface
   - Árvores gigantes
   - Muita folhagem
   - Rios
```

---

## Passo 3 — Biome Map Generator

**Agente**: `@world-builder`

**Prompt**:
```
Crie src/world/biomes/BiomeMap.ts

class BiomeMap {
  private seed: number;
  
  // Determina bioma para coordenada (x, z)
  getBiome(worldX: number, worldZ: number): BiomeDefinition;
  
  // Implementação:
  // 1. Temperature noise: FBM(x * 0.002, z * 0.002) → -1 a 1
  // 2. Humidity noise: FBM(x * 0.003 + 1000, z * 0.003 + 1000) → 0 a 1
  // 3. Mapa de Whittaker simplificado:
  //    temp < -0.3 → SNOW
  //    temp > 0.5 && humidity < 0.3 → DESERT
  //    humidity > 0.7 && temp > 0 → FOREST (ou JUNGLE)
  //    heightNoise > 0.6 → MOUNTAINS
  //    else → PLAINS
  //
  // 4. BEACH é gerado proceduralmente nas bordas da água
  
  // Blend entre biomas nas bordas (evitar transição abrupta)
  getBiomeBlend(worldX: number, worldZ: number): BiomeBlendResult;
  // Samplea biomas em 4-8 pontos próximos, retorna pesos
  
  // Debug
  getTemperature(x: number, z: number): number;
  getHumidity(x: number, z: number): number;
}

interface BiomeBlendResult {
  primary: BiomeDefinition;
  weights: Map<string, number>; // biomeId → weight (0-1)
}
```

---

## Passo 4 — Terrain Generator com Biomes

**Agente**: `@world-builder`

**Prompt**:
```
Atualize TerrainGenerator para usar biomas:

1. Para cada coluna (x, z) do chunk:
   a. getBiome(worldX, worldZ)
   b. Gerar height baseado em:
      - Base noise * biome.heightModifier + biome.baseHeight
      - Biome-specific noise layers
   c. Preencher blocos:
      - Surface: biome.surfaceBlock
      - 3 blocos abaixo: biome.subsurfaceBlock
      - Restante: biome.deepBlock (stone)
      - Abaixo de waterLevel: water blocks

2. Biome blending:
   - Nas bordas entre biomas, interpolar height
   - Interpolar tipo de bloco por probabilidade
   - Ex: 70% plains + 30% desert → 70% chance de grass, 30% de sand

3. Caves (básico):
   - 3D noise para buracos no terreno
   - Threshold: 0.6 = ar, else = sólido
   - Apenas abaixo de Y=30
```

---

## Passo 5 — Vegetation & Structures

**Agente**: `@world-builder`

**Prompt**:
```
Crie src/world/structures/StructureGenerator.ts

Templates de vegetação:
1. OakTree: tronco 4-6 alto + copa esférica de folhas
2. PineTree: tronco 6-8 + copa cônica (para SNOW)
3. PalmTree: tronco curvo 5-7 + folhas no topo (para BEACH/DESERT)
4. Cactus: 2-4 blocos verdes empilhados + braços
5. Bush: 1 bloco de folha no chão
6. Flower: bloco colorido no topo de grass

Templates de estruturas:
1. Rock: cluster de 3-8 blocos de pedra
2. Ruin: paredes de pedra parciais (2-3 paredes, sem teto)
3. Well: poço de pedra 3x3 com água no centro
4. Bridge: (próximo a rios) tábuas de madeira

Cada bioma referencia quais templates usa e a frequência.
Templates são aplicados após geração de terreno, respeitando limites de chunk.
```

---

## Passo 6 — Minimap com Biomes

**Agente**: `@ui-designer`

**Prompt**:
```
Atualize o minimap para mostrar biomas:

1. Cada bioma tem cor no minimap:
   - Plains: verde claro
   - Forest: verde escuro
   - Desert: amarelo
   - Mountains: cinza
   - Snow: branco
   - Beach: bege
   - Water: azul

2. Canvas minimap colorido por bioma
3. Ícone do jogador centralizado
4. Chunks carregados visíveis vs não carregados (escuros)
5. NPCs como pontos coloridos
```

---

## Checklist de Conclusão

- [ ] 6+ biomas definidos com propriedades distintas
- [ ] BiomeMap gera biomas por temperature/humidity
- [ ] Terrain varia por bioma (height, blocks)
- [ ] Blending suave entre biomas
- [ ] 4+ templates de árvores
- [ ] 2+ templates de estruturas
- [ ] Caves básicas funcionam
- [ ] Minimap mostra cores de bioma
- [ ] Performance OK com múltiplos biomas
- [ ] Seed determinístico (mesmo seed = mesmo mundo)
