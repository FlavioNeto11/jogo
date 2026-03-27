# Sprint 3 — Upgrade Three.js para r170+

> **Agente:** `@migrator` + `@engine`
> **Duração estimada:** 2-3 sessões de Copilot
> **Pré-requisito:** Sprint 2 (TypeScript)
> **Resultado:** Three.js atualizado para versão mais recente estável

---

## Objetivo

Atualizar Three.js de r128 para r170+ aproveitando melhorias de performance, novos features, e preparação para WebGPU.

---

## Breaking Changes Principais (r128 → r170)

| API Antiga (r128) | API Nova (r170+) | Impacto |
| ------------------ | ----------------- | ------- |
| `renderer.outputEncoding = sRGBEncoding` | `renderer.outputColorSpace = SRGBColorSpace` | `game.ts` |
| `THREE.sRGBEncoding` | `THREE.SRGBColorSpace` | `game.ts` |
| `geometry.dispose()` em InstancedMesh | Mesma API, melhor performance | Nenhum |
| `material.flatShading` | Permanece | Nenhum |
| Shaders com `gl_FragColor` | Pode precisar de `out vec4 fragColor` | `game.ts` skybox shader |
| `WebGLRenderer` | `WebGLRenderer` (WebGPURenderer opcional) | Futuro |

---

## Passo a Passo

### Passo 1 — Atualizar dependência

```text
Agente: @devops
Prompt: Atualize three.js para a versão estável mais recente.
Atualize também @types/three.
```

**Ações:**
1. `npm install three@latest`
2. `npm install -D @types/three@latest`
3. Verificar versão: `npm list three`

---

### Passo 2 — Corrigir deprecated APIs

```text
Agente: @migrator
Prompt: Busque por APIs deprecated do Three.js no código e atualize.
Referências: outputEncoding → outputColorSpace, sRGBEncoding → SRGBColorSpace.
```

**Ações em `game.ts`:**

```typescript
// ANTES:
this.renderer.outputEncoding = THREE.sRGBEncoding;

// DEPOIS:
this.renderer.outputColorSpace = THREE.SRGBColorSpace;
```

---

### Passo 3 — Atualizar shaders customizados

```text
Agente: @engine
Prompt: Revise o shader do skybox em game.ts para compatibilidade com Three.js r170+.
Verifique se gl_FragColor precisa ser substituído.
```

**Ações:**
- Testar shader no browser
- Se necessário, migrar para `ShaderMaterial` com `glslVersion: THREE.GLSL3`

---

### Passo 4 — Testar todos os materiais

```text
Agente: @engine
Prompt: Verifique que todos os MeshLambertMaterial, MeshBasicMaterial 
e ShaderMaterial renderizam corretamente após o upgrade.
```

**Checklist de materiais:**
- [ ] Blocos do mundo (InstancedMesh com Lambert)
- [ ] Água (transparent, doubleside)
- [ ] Vidro (transparent)
- [ ] NPCs (Lambert)
- [ ] Partículas (Lambert)
- [ ] Skybox (ShaderMaterial)
- [ ] Sol e glow (BasicMaterial, transparent)
- [ ] Nuvens (Lambert, transparent)

---

### Passo 5 — Testar performance

```text
Agente: @engine
Prompt: Compare FPS antes e depois do upgrade usando Chrome DevTools Performance tab.
O jogo deve manter 60 FPS no mesmo hardware.
```

**Ações:**
1. Abrir Chrome DevTools → Performance
2. Gravar 10 segundos de gameplay
3. Verificar frame times (devem ser ≤ 16ms)
4. Comparar draw calls e GPU time

---

### Passo 6 — Aproveitar novos features

```text
Agente: @engine
Prompt: Avalie quais novos features do Three.js r170+ podemos usar:
- BatchedMesh (substituto otimizado de InstancedMesh para muitos tipos)
- TextureLoader melhorado
- Novos post-processing
```

**Avaliar (não implementar tudo agora):**
- `BatchedMesh` para o mundo (melhor que InstancedMesh para multi-material)
- `WebGPURenderer` (experimental, futuro)
- Novos helpers de debug

---

## Checklist de Conclusão

- [ ] Three.js atualizado para r170+
- [ ] @types/three atualizado
- [ ] `outputColorSpace` substituiu `outputEncoding`
- [ ] Shaders funcionando
- [ ] Todos os materiais renderizam corretamente
- [ ] Performance mantida (≥ 60 FPS)
- [ ] Zero warnings de deprecated no console
- [ ] Build de produção funciona
