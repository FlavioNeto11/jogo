# Copilot Instructions — Three.js & 3D Rendering

## Versão do Three.js

- Atualmente: r128 (upgrade planejado para r170+)
- Importação: via CDN (migração para npm planejada na Sprint 1)

## Padrões de Rendering

### Materiais
- **Blocos/Mundo**: `MeshLambertMaterial` (performance)
- **Efeitos/Glow**: `MeshBasicMaterial` com transparência
- **Sky**: `ShaderMaterial` customizado
- **Água**: `MeshLambertMaterial` transparent, DoubleSide
- **Vidro**: `MeshLambertMaterial` transparent, opacity 0.35
- **Nunca use** `MeshStandardMaterial` ou `MeshPhysicalMaterial` (muito pesado)

### Geometrias
- **Blocos**: `BoxGeometry(1,1,1)` compartilhada via `InstancedMesh`
- **Coins**: `CylinderGeometry`
- **Partículas**: `BoxGeometry` pequenas (0.05-0.15)
- **Sky**: `SphereGeometry(250)` com BackSide
- **Sempre compartilhar** geometrias entre objetos do mesmo tipo

### Instancing
- O mundo usa `InstancedMesh` agrupado por tipo de bloco
- Cada tipo de bloco = 1 InstancedMesh = 1 draw call
- Ao adicionar/remover blocos dinâmicos: mesh individual (não instanced)

### Sombras
- Tipo: `BasicShadowMap` (performance)
- Shadow map: 1024×1024
- Apenas DirectionalLight (sun) projeta sombras
- Sombra do personagem: CircleGeometry no chão (fake shadow)

### Performance Targets
- Draw calls: < 50 em cena normal
- Triangles: < 100K visíveis
- Frame time: ≤ 16ms
- Pixel ratio: capped em 1.5 (medium) ou 2 (high)

## Padrões de Código Three.js

```typescript
// ✅ Correto: compartilhar geometria e material
const sharedGeo = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshLambertMaterial({ color: 0xff0000 });
const mesh1 = new THREE.Mesh(sharedGeo, material);
const mesh2 = new THREE.Mesh(sharedGeo, material);

// ❌ Errado: criar geometria para cada objeto
const mesh1 = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshLambertMaterial(...));
const mesh2 = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshLambertMaterial(...));

// ✅ Correto: dispose ao remover
scene.remove(mesh);
mesh.geometry.dispose();
mesh.material.dispose();

// ❌ Errado: remover sem dispose (memory leak)
scene.remove(mesh);
```

## Camera System

- Modos: Primeira pessoa e Terceira pessoa (toggle com V)
- Terceira pessoa: orbita atrás do personagem, estilo Roblox
- Smooth follow com lerp
- Colisão com terreno (câmera não entra no chão)
- Pitch clamp: -0.8 a 1.2 radianos
