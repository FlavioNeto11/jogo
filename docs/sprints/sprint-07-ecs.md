# Sprint 07 — Entity Component System (ECS)

> **Fase**: 1 — Motor de Jogo  
> **Agente Principal**: `@entity-master`  
> **Agentes de Apoio**: `@architect`, `@engine`  
> **Dependências**: Sprint 02 (TypeScript)  
> **Duração Estimada**: 3-4 dias  

---

## Objetivo

Implementar um sistema ECS (Entity-Component-System) leve e customizado para gerenciar todas as entidades do jogo (NPCs, jogador, coins, partículas, blocos dinâmicos) de forma desacoplada e performática.

---

## Conceitos

- **Entity**: apenas um ID (number)
- **Component**: dados puros (sem lógica), armazenados em arrays tipados ou Maps
- **System**: lógica pura que opera sobre entidades que possuem determinados componentes
- **World**: container que gerencia entities, components e systems

---

## Passo 1 — Entity Manager

**Agente**: `@entity-master`

**Prompt**:
```
Crie src/ecs/EntityManager.ts que gerencia IDs de entidades com reciclagem.
- entityCounter auto-incremento
- Pool de IDs reciclados (freeIds: number[])
- create(): number — retorna próximo ID (do pool ou novo)
- destroy(id): void — adiciona ao pool
- isAlive(id): boolean — Set<number> de entidades vivas
- getAll(): ReadonlySet<number>
```

**Validação**:
- [ ] IDs são reciclados corretamente
- [ ] isAlive retorna false após destroy
- [ ] getAll retorna apenas entidades vivas

---

## Passo 2 — Component Storage

**Agente**: `@entity-master`

**Prompt**:
```
Crie src/ecs/ComponentStorage.ts com armazenamento genérico de componentes.

Interface ComponentStorage<T>:
- set(entity: number, data: T): void
- get(entity: number): T | undefined
- has(entity: number): boolean
- delete(entity: number): void
- entries(): IterableIterator<[number, T]>
- size: number

Implementação SparseMap<T>:
- Usa Map<number, T> internamente
- Eficiente para componentes raros (ex: PlayerControlled)

Implementação DenseArray<T>:
- Usa array contíguo + entityToIndex Map
- Eficiente para componentes frequentes (ex: Transform)
```

**Validação**:
- [ ] SparseMap funciona para add/get/remove
- [ ] DenseArray mantém dados contíguos
- [ ] Ambos implementam a mesma interface

---

## Passo 3 — Component Definitions

**Agente**: `@entity-master`

**Prompt**:
```
Crie src/ecs/components.ts com todos os componentes do jogo.
Cada componente é uma interface simples de dados puros.

// Posição e orientação
interface TransformComponent {
  x: number; y: number; z: number;
  rotationY: number;
}

// Velocidade
interface VelocityComponent {
  vx: number; vy: number; vz: number;
}

// Renderização
interface MeshComponent {
  mesh: THREE.Object3D;
  visible: boolean;
}

// Colisão
interface ColliderComponent {
  width: number; height: number; depth: number;
  offsetY: number;
  isStatic: boolean;
}

// Controle do jogador
interface PlayerControlledComponent {
  moveSpeed: number;
  jumpForce: number;
  isJumping: boolean;
  isGrounded: boolean;
}

// NPC
interface NPCComponent {
  name: string;
  role: 'family' | 'generic';
  state: 'idle' | 'walking' | 'talking';
  dialog: string[];
  interactionRadius: number;
}

// Colecionável
interface CollectibleComponent {
  type: 'coin' | 'gem' | 'powerup';
  value: number;
  collected: boolean;
}

// Animação de bobbing
interface BobbingComponent {
  amplitude: number;
  frequency: number;
  baseY: number;
  phase: number;
}

// Gravidade
interface GravityComponent {
  enabled: boolean;
  multiplier: number;
}

// Saúde
interface HealthComponent {
  current: number;
  max: number;
}

// Tag components (sem dados, apenas marcadores)
type FamilyMemberTag = {};
type GroundedTag = {};

// Registry de tipos de componentes para type safety
enum ComponentType {
  Transform, Velocity, Mesh, Collider,
  PlayerControlled, NPC, Collectible,
  Bobbing, Gravity, Health,
  FamilyMember, Grounded
}
```

**Validação**:
- [ ] Todos os componentes são dados puros (sem métodos)
- [ ] ComponentType enum mapeia todos os tipos
- [ ] Interfaces exportadas corretamente

---

## Passo 4 — System Base

**Agente**: `@entity-master`

**Prompt**:
```
Crie src/ecs/System.ts com a classe base de systems.

abstract class System {
  abstract readonly requiredComponents: ComponentType[];
  priority: number = 0; // Menor = executa primeiro
  enabled: boolean = true;

  abstract update(dt: number, entities: ReadonlySet<number>, world: ECSWorld): void;
  
  // Lifecycle hooks opcionais
  onEntityAdded?(entity: number, world: ECSWorld): void;
  onEntityRemoved?(entity: number, world: ECSWorld): void;
  init?(world: ECSWorld): void;
  destroy?(world: ECSWorld): void;
}
```

**Validação**:
- [ ] System é abstrata e requer implementação de update
- [ ] requiredComponents filtra entidades corretas
- [ ] Priority sorting funciona

---

## Passo 5 — ECS World

**Agente**: `@entity-master`

**Prompt**:
```
Crie src/ecs/World.ts — o container principal do ECS.

class ECSWorld {
  private entityManager: EntityManager;
  private componentStorages: Map<ComponentType, ComponentStorage<any>>;
  private systems: System[];
  private queries: Map<string, Set<number>>; // Cache de queries

  // Entities
  createEntity(): number;
  destroyEntity(entity: number): void;
  
  // Components
  addComponent<T>(entity: number, type: ComponentType, data: T): void;
  removeComponent(entity: number, type: ComponentType): void;
  getComponent<T>(entity: number, type: ComponentType): T | undefined;
  hasComponent(entity: number, type: ComponentType): boolean;
  
  // Systems
  addSystem(system: System): void;
  removeSystem(system: System): void;
  
  // Queries (cached)
  query(...components: ComponentType[]): ReadonlySet<number>;
  
  // Update loop
  update(dt: number): void; // Executa todos os systems em ordem de priority
  
  // Lifecycle
  init(): void;
  destroy(): void;
}

Detalhes de implementação:
- query() cacheia resultados e invalida quando componentes mudam
- update() itera systems por priority, passando apenas entidades relevantes
- destroyEntity() limpa todos os componentes e invalida caches
```

**Validação**:
- [ ] createEntity/destroyEntity funciona
- [ ] addComponent/getComponent/removeComponent funciona
- [ ] query() retorna entidades corretas
- [ ] query() cache é invalidado ao mudar componentes
- [ ] update() executa systems na ordem certa

---

## Passo 6 — Systems Iniciais

**Agente**: `@entity-master`

**Prompt**:
```
Crie os systems iniciais em src/ecs/systems/:

1. MovementSystem.ts
   - Requer: Transform, Velocity
   - Aplica velocity à posição: pos += vel * dt
   
2. GravitySystem.ts
   - Requer: Velocity, Gravity
   - Aplica gravidade: vel.vy -= 9.81 * gravity.multiplier * dt

3. RenderSyncSystem.ts
   - Requer: Transform, Mesh
   - Sincroniza posição do Three.js mesh com Transform component
   - mesh.position.set(t.x, t.y, t.z)
   - mesh.rotation.y = t.rotationY

4. BobbingSystem.ts
   - Requer: Transform, Bobbing
   - Aplica animação senoidal: y = baseY + sin(time * freq + phase) * amp

5. CollectibleSystem.ts
   - Requer: Transform, Collectible
   - Verifica proximidade com jogador
   - Marca como collected, emite evento

Priority order: Gravity(10) → Movement(20) → Bobbing(30) → Collectible(40) → RenderSync(90)
```

**Validação**:
- [ ] Cada system opera apenas nos componentes declarados
- [ ] GravitySystem aplica antes de MovementSystem
- [ ] RenderSync executa por último (maior priority)
- [ ] CollectibleSystem detecta coleta corretamente

---

## Passo 7 — Integração com Game

**Agente**: `@entity-master` + `@architect`

**Prompt**:
```
Integre o ECS no Game existente:

1. Game cria ECSWorld no init
2. Player é uma entidade com: Transform, Velocity, Collider, PlayerControlled, Mesh, Gravity, Health
3. Cada NPC familiar é uma entidade com: Transform, Velocity, Collider, NPC, Mesh, FamilyMember, Bobbing
4. Cada NPC genérico é uma entidade com: Transform, Velocity, Collider, NPC, Mesh, Bobbing
5. Cada coin é uma entidade com: Transform, Collectible, Mesh, Bobbing
6. Game.update() chama ecsWorld.update(dt) ao invés de atualizar entidades manualmente

IMPORTANTE: Migrar gradualmente — manter código antigo comentado como referência
```

**Validação**:
- [ ] Player controlado via ECS
- [ ] NPCs gerenciados via ECS
- [ ] Coins gerenciados via ECS
- [ ] Partículas ainda funcionam (migrar depois)
- [ ] Sem regressão visual
- [ ] FPS >= 60

---

## Checklist de Conclusão

- [ ] EntityManager com reciclagem de IDs
- [ ] ComponentStorage (SparseMap + DenseArray)
- [ ] 12+ Component definitions
- [ ] System base class com priority e lifecycle
- [ ] ECSWorld com queries cacheadas
- [ ] 5+ Systems iniciais implementados
- [ ] Player migrado para ECS
- [ ] NPCs migrados para ECS
- [ ] Coins migrados para ECS
- [ ] Zero regressões visuais
- [ ] Performance >= 60 FPS
- [ ] Código antigo de entities removido ou isolado

---

## Notas de Migração

A migração do sistema atual (classes monolíticas) para ECS deve ser **gradual**:

1. Primeiro, criar a infraestrutura ECS (passos 1-5) sem alterar o jogo
2. Depois, criar entidades ECS que **coexistem** com o sistema atual
3. Gradualmente mover lógica dos `update()` das classes antigas para Systems
4. Só remover código antigo quando o ECS estiver 100% funcional
5. Manter testes visuais a cada passo
