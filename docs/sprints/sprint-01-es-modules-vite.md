# Sprint 1 — Migração para ES Modules + Vite

> **Agente:** `@migrator` + `@devops`
> **Duração estimada:** 2-3 sessões de Copilot
> **Pré-requisito:** Nenhum (primeira sprint)
> **Resultado:** Projeto rodando com Vite, ES Modules, hot reload

---

## Objetivo

Migrar de scripts globais carregados via `<script>` para ES Modules com Vite como bundler, sem alterar funcionalidades.

---

## Passo a Passo

### Passo 1 — Inicializar projeto Node.js

```text
Agente: @devops
Prompt: Inicialize o package.json e instale Vite como dev dependency neste projeto.
```

**Ações:**

1. Criar `package.json`:
   ```json
   {
     "name": "mafe-juju-world",
     "version": "1.0.0",
     "type": "module",
     "scripts": {
       "dev": "vite",
       "build": "vite build",
       "preview": "vite preview"
     }
   }
   ```
2. Instalar: `npm install -D vite`
3. Criar `vite.config.js`:
   ```javascript
   import { defineConfig } from 'vite';

   export default defineConfig({
     root: '.',
     publicDir: 'public',
     server: {
       port: 8080,
       open: true
     },
     build: {
       outDir: 'dist',
       sourcemap: true
     }
   });
   ```

**Validação:**
- `npm run dev` abre o browser
- Jogo funciona idêntico ao antes

---

### Passo 2 — Instalar Three.js via npm

```text
Agente: @devops
Prompt: Substitua o CDN do Three.js por instalação via npm.
```

**Ações:**

1. `npm install three@0.128.0` (manter mesma versão por ora)
2. Em cada arquivo JS que usa THREE, adicionar no topo:
   ```javascript
   import * as THREE from 'three';
   ```
3. Remover a tag `<script src="...three.min.js">` do `index.html`

**Validação:**
- Three.js carrega via bundle
- Console sem erros
- Performance idêntica

---

### Passo 3 — Converter utils.js para ES Module

```text
Agente: @migrator
Prompt: Converta js/utils.js de objeto global para ES Module com named exports.
Mantenha backward compatibility temporária.
```

**Ações:**

1. Mover `js/utils.js` para `src/utils.js`
2. Converter:
   ```javascript
   // ANTES: const Utils = { lerp(a,b,t) {...}, ... }
   // DEPOIS:
   export function lerp(a, b, t) { return a + (b - a) * t; }
   export function clamp(val, min, max) { ... }
   export function randomRange(min, max) { ... }
   // ... todas as funções
   
   // Backward compat (temporário)
   const Utils = { lerp, clamp, randomRange, ... };
   export default Utils;
   ```
3. Nos arquivos que usam Utils, adicionar import temporário:
   ```javascript
   import Utils from './utils.js';
   ```

**Validação:**
- `Utils.lerp()` funciona
- Imports resolvidos pelo Vite

---

### Passo 4 — Converter audio.js para ES Module

```text
Agente: @migrator
Prompt: Converta js/audio.js para ES Module. Exporte a classe AudioSystem.
```

**Ações:**

1. Mover para `src/audio.js`
2. Adicionar `export` na classe:
   ```javascript
   export class AudioSystem { ... }
   ```
3. Remover referência global `globalThis`

**Validação:**
- `import { AudioSystem } from './audio.js'` funciona em game.js
- Sons tocam normalmente

---

### Passo 5 — Converter world.js para ES Module

```text
Agente: @migrator
Prompt: Converta js/world.js para ES Module. 
Adicione import de THREE e Utils.
```

**Ações:**

1. Mover para `src/world.js`
2. Adicionar imports:
   ```javascript
   import * as THREE from 'three';
   import Utils from './utils.js';
   ```
3. Adicionar `export class World { ... }`

**Validação:**
- Mundo gera normalmente
- Blocos visíveis

---

### Passo 6 — Converter character.js, physics.js, building.js

```text
Agente: @migrator
Prompt: Converta character.js, physics.js e building.js para ES Modules.
Cada um deve importar THREE e Utils conforme necessário.
```

**Ações por arquivo:**
- Adicionar imports de THREE, Utils
- Adicionar `export class`
- Mover para `src/`

**Validação após cada arquivo:**
- Jogo roda sem erros
- Funcionalidade preservada

---

### Passo 7 — Converter entities.js, particles.js, ui.js

```text
Agente: @migrator
Prompt: Converta entities.js, particles.js e ui.js para ES Modules.
```

**Ações:**
- Mesmo processo do Passo 6
- `ui.js` pode precisar de `globalThis.game` temporariamente

**Validação:**
- NPCs aparecem e falam
- Partículas funcionam
- HUD atualiza

---

### Passo 8 — Converter game.js (entry point)

```text
Agente: @migrator
Prompt: Converta game.js para ES Module.
Ele é o entry point que importa todos os outros módulos.
Atualize index.html para usar <script type="module">.
```

**Ações:**

1. Mover para `src/game.js`
2. Adicionar todos os imports:
   ```javascript
   import * as THREE from 'three';
   import Utils from './utils.js';
   import { AudioSystem } from './audio.js';
   import { World } from './world.js';
   import { Character } from './character.js';
   import { Physics } from './physics.js';
   import { BuildingSystem } from './building.js';
   import { EntitySystem } from './entities.js';
   import { ParticleSystem } from './particles.js';
   import { UISystem } from './ui.js';
   ```
3. Atualizar `index.html`:
   ```html
   <!-- Remover TODOS os <script> antigos -->
   <!-- Substituir por: -->
   <script type="module" src="/src/game.js"></script>
   ```

**Validação:**
- Vite serve o projeto
- HMR funciona (editar código atualiza sem reload)
- Jogo completo funciona

---

### Passo 9 — Limpar arquivos antigos

```text
Agente: @devops
Prompt: Remova a pasta js/ antiga (agora tudo está em src/).
Atualize .gitignore para incluir node_modules e dist.
```

**Ações:**

1. Deletar pasta `js/`
2. Atualizar `.gitignore`:
   ```text
   node_modules/
   dist/
   .vite/
   ```
3. Mover `css/style.css` para `src/style.css` (importar via JS)
4. Em `src/game.js` (ou `main.js`), adicionar:
   ```javascript
   import './style.css';
   ```

**Validação final:**
- `npm run dev` funciona
- `npm run build` gera bundle em `dist/`
- `npm run preview` serve a versão buildada
- Tudo funciona idêntico ao original

---

## Checklist de Conclusão

- [ ] `package.json` criado com scripts dev/build/preview
- [ ] Vite configurado e funcionando
- [ ] Three.js via npm (não mais CDN)
- [ ] Todos os 10 arquivos JS migrados para ES Modules em `src/`
- [ ] `index.html` usa `<script type="module">`
- [ ] Pasta `js/` antiga removida
- [ ] CSS importado via JS
- [ ] HMR (Hot Module Reload) funcionando
- [ ] Build de produção gera bundle otimizado
- [ ] Zero erros no console
- [ ] Jogo funciona identicamente ao original
