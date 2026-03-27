# Sprint 2 — Migração para TypeScript

> **Agente:** `@migrator` + `@devops`
> **Duração estimada:** 3-4 sessões de Copilot
> **Pré-requisito:** Sprint 1 (ES Modules + Vite)
> **Resultado:** Todo o código em TypeScript com tipagem completa

---

## Objetivo

Converter todos os arquivos `.js` para `.ts` com tipagem forte, interfaces bem definidas, e zero erros de compilação.

---

## Passo a Passo

### Passo 1 — Configurar TypeScript

```text
Agente: @devops
Prompt: Configure TypeScript no projeto com Vite. 
Instale typescript e @types/three.
Crie tsconfig.json com strict mode.
```

**Ações:**

1. `npm install -D typescript @types/three`
2. Criar `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "target": "ES2022",
       "module": "ESNext",
       "moduleResolution": "bundler",
       "lib": ["ES2022", "DOM", "DOM.Iterable"],
       "strict": true,
       "noUnusedLocals": true,
       "noUnusedParameters": true,
       "noFallthroughCasesInSwitch": true,
       "forceConsistentCasingInFileNames": true,
       "resolveJsonModule": true,
       "isolatedModules": true,
       "esModuleInterop": true,
       "skipLibCheck": true,
       "outDir": "dist",
       "sourceMap": true,
       "declaration": true,
       "declarationMap": true,
       "jsx": "preserve",
       "paths": {
         "@/*": ["./src/*"]
       }
     },
     "include": ["src/**/*.ts", "src/**/*.tsx"],
     "exclude": ["node_modules", "dist"]
   }
   ```

**Validação:**
- `npx tsc --noEmit` executa (pode ter erros — ok por agora)

---

### Passo 2 — Definir interfaces base

```text
Agente: @architect
Prompt: Crie o arquivo src/types.ts com todas as interfaces e tipos 
que serão usados no projeto. Analise o código atual para extrair os tipos.
```

**Ações — criar `src/types.ts`:**

```typescript
import * as THREE from 'three';

// ===== Block System =====
export interface BlockType {
  color: number;
  topColor?: number;
  name: string;
  emissive?: number;
  emissiveIntensity?: number;
  transparent?: boolean;
  opacity?: number;
}

export type BlockTypeKey = string;

export interface BlockHit {
  position: { x: number; y: number; z: number };
  block: string;
  placePosition: { x: number; y: number; z: number };
}

// ===== Character =====
export interface CharacterBodyParts {
  head: THREE.Mesh;
  torso: THREE.Mesh;
  leftArm: THREE.Mesh;
  rightArm: THREE.Mesh;
  leftLeg: THREE.Mesh;
  rightLeg: THREE.Mesh;
  shadow: THREE.Mesh;
}

export interface AABB {
  min: { x: number; y: number; z: number };
  max: { x: number; y: number; z: number };
}

// ===== NPC System =====
export type FamilyMember = 'flavio' | 'anapaula' | 'mafe' | 'julia';

export interface NPCConfig {
  name: string;
  skinColor: number;
  shirtColor: number;
  pantsColor: number;
  hairColor: number | null;
  hasBeard: boolean;
  beardColor?: number;
  longHair?: boolean;
  hasBangs?: boolean;
  hasBow?: boolean;
  scale: number;
  dialogues: string[];
}

export interface NPCData {
  type: 'npc';
  family?: FamilyMember;
  walkTimer: number;
  walkDuration: number;
  walkDir: THREE.Vector3;
  idleTimer: number;
  isIdle: boolean;
  leftArm: THREE.Mesh;
  rightArm: THREE.Mesh;
  leftLeg: THREE.Mesh;
  rightLeg: THREE.Mesh;
  heart?: THREE.Mesh;
  startPos: THREE.Vector3;
  speed: number;
  wanderRadius: number;
  dialogues: string[];
  lastDialogueTime: number;
  dialogueCooldown: number;
}

export interface CoinData {
  type: 'coin';
  baseY: number;
  rotSpeed: number;
  bobSpeed: number;
  bobAmount: number;
  collected: boolean;
}

// ===== Entity Update Result =====
export interface EntityUpdateResult {
  coinsCollected: number;
  dialogues: string[];
}

// ===== Game Settings =====
export interface GameSettings {
  quality: 'low' | 'medium' | 'high';
  sensitivity: number;
  volume: number;
  renderDistance: number;
}

export type GameState = 'loading' | 'menu' | 'playing' | 'paused';

// ===== Particle System =====
export interface ParticleData {
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  gravity: number;
  rotSpeed: THREE.Vector3;
}

// ===== Input =====
export interface MouseState {
  x: number;
  y: number;
  dx: number;
  dy: number;
}
```

**Validação:**
- Arquivo compila sem erros

---

### Passo 3 — Migrar utils.js → utils.ts

```text
Agente: @migrator
Prompt: Converta src/utils.js para src/utils.ts.
Adicione tipagem a todas as funções. É o arquivo mais simples.
```

**Ordem de migração (menos dependências primeiro):**
1. `utils.ts` ← sem dependências
2. `audio.ts` ← sem dependências de outros módulos
3. `physics.ts` ← depende de World (interface)
4. `character.ts` ← depende de THREE
5. `particles.ts` ← depende de THREE
6. `building.ts` ← depende de World, Physics
7. `world.ts` ← depende de Utils
8. `entities.ts` ← depende de World, Utils, THREE
9. `ui.ts` ← depende de World
10. `game.ts` ← depende de tudo

**Para cada arquivo, o processo é:**
1. Renomear `.js` → `.ts`
2. Adicionar tipagem aos parâmetros e retornos
3. Substituir `any` por tipos corretos
4. Resolver erros do `tsc`
5. Testar no browser

---

### Passo 4 — Migrar audio.ts

```text
Agente: @migrator
Prompt: Converta src/audio.js para src/audio.ts com tipagem completa.
```

**Foco:** Tipar os campos da classe, AudioContext, e AudioBuffer.

---

### Passo 5 — Migrar physics.ts

```text
Agente: @migrator
Prompt: Converta src/physics.js para src/physics.ts.
Use a interface AABB de types.ts.
```

---

### Passo 6 — Migrar character.ts

```text
Agente: @migrator
Prompt: Converta src/character.js para src/character.ts.
Use CharacterBodyParts e AABB de types.ts.
```

---

### Passo 7 — Migrar particles.ts

```text
Agente: @migrator
Prompt: Converta src/particles.js para src/particles.ts.
Use ParticleData de types.ts.
```

---

### Passo 8 — Migrar building.ts, world.ts, entities.ts

```text
Agente: @migrator
Prompt: Converta building.js, world.js e entities.js para TypeScript.
Use os tipos de types.ts extensivamente.
```

---

### Passo 9 — Migrar ui.ts e game.ts

```text
Agente: @migrator
Prompt: Converta ui.js e game.js (entry point) para TypeScript.
game.ts é o mais complexo — importe tudo e tipe.
```

---

### Passo 10 — Strict mode e cleanup

```text
Agente: @quality
Prompt: Execute `npx tsc --noEmit` e corrija todos os erros restantes.
Garanta zero erros com strict: true no tsconfig.
```

**Ações:**
1. Resolver todos os erros de tipo
2. Remover `any` residuais
3. Adicionar return types explícitos
4. Verificar que ESLint está limpo

---

## Checklist de Conclusão

- [ ] TypeScript instalado e configurado
- [ ] `tsconfig.json` com strict mode
- [ ] `src/types.ts` com interfaces base
- [ ] Todos os 10 arquivos migrados para `.ts`
- [ ] `npx tsc --noEmit` sem erros
- [ ] `npm run dev` funciona com HMR
- [ ] `npm run build` gera bundle
- [ ] Jogo funciona identicamente
- [ ] IntelliSense do VSCode funciona com autocompletar
