# Sprint 5 — LOD + Frustum Culling + Otimizações de Renderização

> **Agente:** `@engine`
> **Duração estimada:** 2-3 sessões de Copilot
> **Pré-requisito:** Sprint 4 (Chunks)
> **Resultado:** Performance profissional com técnicas avançadas de rendering

---

## Objetivo

Implementar LOD (Level of Detail), frustum culling manual, e otimizações de renderização para manter 60 FPS mesmo com muitos chunks carregados.

---

## Passo a Passo

### Passo 1 — Frustum Culling por Chunk

```text
Agente: @engine
Prompt: Implemente frustum culling manual por chunk.
Chunks fora do frustum da câmera não devem ser renderizados.
Three.js faz frustum culling por objeto, mas queremos por chunk group.
```

**Estrutura:**

```typescript
export class ChunkCuller {
  private frustum: THREE.Frustum;
  private projScreenMatrix: THREE.Matrix4;
  
  update(camera: THREE.Camera): void {
    this.projScreenMatrix.multiplyMatrices(
      camera.projectionMatrix, camera.matrixWorldInverse
    );
    this.frustum.setFromProjectionMatrix(this.projScreenMatrix);
  }
  
  isChunkVisible(chunkX: number, chunkZ: number, maxY: number): boolean {
    const box = new THREE.Box3(
      new THREE.Vector3(chunkX * 16, 0, chunkZ * 16),
      new THREE.Vector3(chunkX * 16 + 16, maxY, chunkZ * 16 + 16)
    );
    return this.frustum.intersectsBox(box);
  }
}
```

---

### Passo 2 — LOD por Distância

```text
Agente: @engine
Prompt: Implemente LOD para chunks.
Chunks próximos: full detail.
Chunks médios: merged mesh (menos draw calls).
Chunks distantes: flat colored planes ou hidden.
```

**Níveis de LOD:**

| Distância (chunks) | LOD | Detalhes |
| ------------------- | --- | -------- |
| 0-3 | Full | Todas as faces, sombras |
| 4-6 | Medium | Faces externas apenas, sem sombras |
| 7-8 | Low | Heightmap como PlaneGeometry colorido |

---

### Passo 3 — Greedy Meshing

```text
Agente: @engine + @world-builder
Prompt: Implemente greedy meshing no ChunkMeshBuilder.
Em vez de 1 face por bloco, merge faces adjacentes do mesmo tipo
em quads maiores.
```

**Resultado:** Reduz faces renderizadas em ~60-80%.

**Algoritmo:**
1. Para cada fatia (Y layer), scan em X e Z
2. Se blocos adjacentes são do mesmo tipo, merge em um quad maior
3. Criar geometria com quads ao invés de cubes individuais

---

### Passo 4 — Object Pooling para Chunks

```text
Agente: @engine
Prompt: Implemente pool de objetos para chunks.
Quando um chunk é descarregado, seu mesh é reciclado (não destruído).
```

**Benefício:** Menos GC pressure, menos allocations.

---

### Passo 5 — Occlusion Culling Básico

```text
Agente: @engine
Prompt: Implemente occlusion culling simples.
Chunks completamente atrás de montanhas não devem ser renderizados.
Use raycasting simples do jogador para cada chunk.
```

**Abordagem simplificada:**
- Para cada chunk no frustum, fazer 1 ray do player ao centro do chunk
- Se o ray bate em terreno alto antes do chunk, não renderizar
- Cache de resultados (re-checar apenas ao mover)

---

### Passo 6 — Performance Budget Monitor

```text
Agente: @engine
Prompt: Crie um PerformanceMonitor que mede tempo de cada sistema por frame.
Exiba como overlay no HUD de debug.
```

**Métricas:**
- Frame time total
- Physics time
- Render time
- Chunk load/unload time
- Entity update time
- Draw calls
- Triangles

---

## Checklist de Conclusão

- [ ] Frustum culling por chunk implementado
- [ ] LOD em 3 níveis funcionando
- [ ] Greedy meshing reduz faces em ≥50%
- [ ] Object pool para meshes de chunk
- [ ] Occlusion culling básico
- [ ] Performance monitor no HUD
- [ ] 60 FPS com renderDistance=8
- [ ] Draw calls < 100 em cena normal
