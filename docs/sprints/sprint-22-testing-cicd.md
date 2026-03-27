# Sprint 22 — Testing & CI/CD

> **Fase**: 4 — Polimento  
> **Agente Principal**: `@quality`  
> **Agentes de Apoio**: `@devops`  
> **Dependências**: Sprint 02 (TypeScript)  
> **Duração Estimada**: 2-3 dias  

---

## Objetivo

Cobertura de testes automatizados, linting, formatting e pipeline de CI/CD completa.

---

## Passo 1 — Test Setup

**Agente**: `@quality`

**Prompt**:
```
Configure Vitest para testes unitários e de integração.

1. npm install -D vitest @testing-library/preact jsdom
2. vitest.config.ts:
   - Environment: jsdom (para testes com DOM)
   - Coverage: v8
   - Globals: true

3. Estrutura de testes:
   src/
     ecs/__tests__/
       EntityManager.test.ts
       World.test.ts
       systems/
     gameplay/__tests__/
       InventoryManager.test.ts
       QuestManager.test.ts
       CraftingManager.test.ts
     core/__tests__/
       EventBus.test.ts
     physics/__tests__/
       AABB.test.ts
       SpatialHash.test.ts
```

---

## Passo 2 — Unit Tests (Core)

**Agente**: `@quality`

**Prompt**:
```
Escreva testes unitários para módulos core:

1. EntityManager.test.ts:
   - create() retorna IDs únicos
   - destroy() recicla IDs
   - isAlive() correto
   - getAll() retorna apenas vivos

2. EventBus.test.ts:
   - on/emit funciona
   - once dispara apenas 1 vez
   - off remove listener
   - unsubscribe function funciona
   - queue/flush funciona
   - removeAllListeners limpa tudo

3. AABB.test.ts:
   - Detecção de colisão entre caixas
   - Sem colisão quando separadas
   - Overlap correto

4. ComponentStorage.test.ts:
   - SparseMap add/get/remove
   - DenseArray add/get/remove
   - Iteração funciona

Coverage target: > 80% em módulos core
```

---

## Passo 3 — Unit Tests (Gameplay)

**Agente**: `@quality`

**Prompt**:
```
Testes para sistemas de gameplay:

1. InventoryManager.test.ts:
   - addItem single
   - addItem com stacking
   - addItem inventário cheio retorna resto
   - removeItem
   - swapSlots
   - splitStack
   - countItem
   - hasItem
   - serialize/deserialize

2. QuestManager.test.ts:
   - startQuest
   - updateObjective increments
   - autoComplete when objectives done
   - grantRewards
   - prerequisites block start
   - serialize/deserialize

3. CraftingManager.test.ts:
   - Pattern matching 2x2
   - Pattern matching 3x3
   - Craft consumes ingredients
   - No match returns null
   - Flexible positioning

4. ItemRegistry.test.ts:
   - Register and get by ID
   - Get by category
   - Default items loaded
```

---

## Passo 4 — Linting & Formatting

**Agente**: `@quality`

**Prompt**:
```
Configure ESLint + Prettier:

1. npm install -D eslint @typescript-eslint/eslint-plugin prettier eslint-config-prettier

2. .eslintrc.json:
   - extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended']
   - Rules: no-console (warn), no-unused-vars (error), prefer-const
   - Three.js globals

3. .prettierrc:
   - singleQuote: true
   - semi: true
   - tabWidth: 2
   - printWidth: 100
   - trailingComma: 'es5'

4. package.json scripts:
   - "lint": "eslint src/ --ext .ts,.tsx"
   - "lint:fix": "eslint src/ --ext .ts,.tsx --fix"
   - "format": "prettier --write src/"
   - "type-check": "tsc --noEmit"

5. Pre-commit hook com husky + lint-staged:
   - lint-staged: *.ts → eslint --fix, prettier --write
```

---

## Passo 5 — CI Pipeline

**Agente**: `@devops`

**Prompt**:
```
Atualize .github/workflows/ci.yml:

name: CI
on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test -- --coverage
      - uses: actions/upload-artifact@v4
        with: { name: coverage, path: coverage/ }
      
  build:
    needs: quality
    runs-on: ubuntu-latest
    steps:
      - run: npm ci
      - run: npm run build
      - name: Bundle size check
        run: |
          SIZE=$(du -sb dist/ | cut -f1)
          if [ $SIZE -gt 5242880 ]; then exit 1; fi

Coverage badge no README.
```

---

## Checklist de Conclusão

- [ ] Vitest configurado com jsdom
- [ ] 20+ testes unitários para core
- [ ] 20+ testes unitários para gameplay
- [ ] Coverage > 80% em módulos core
- [ ] ESLint configurado e passando
- [ ] Prettier configurado
- [ ] Pre-commit hooks funcionando
- [ ] CI pipeline no GitHub Actions
- [ ] Type-check no CI
- [ ] Bundle size check no CI
- [ ] Coverage badge no README
