# Sprint 11 — NPC AI & Behavior Trees

> **Fase**: 2 — Gameplay  
> **Agente Principal**: `@entity-master`  
> **Agentes de Apoio**: `@gameplay`, `@architect`  
> **Dependências**: Sprint 07 (ECS), Sprint 08 (Event Bus)  
> **Duração Estimada**: 3 dias  

---

## Objetivo

Substituir a IA atual (simples random walk) por Behavior Trees configuráveis, com estados ricos e personalidades distintas para cada membro da família.

---

## Passo 1 — Behavior Tree Framework

**Agente**: `@entity-master`

**Prompt**:
```
Crie src/ai/BehaviorTree.ts com o framework de árvore de comportamento.

// Status de execução
enum BTStatus { Running, Success, Failure }

// Nó base
abstract class BTNode {
  abstract tick(entity: number, world: ECSWorld, dt: number): BTStatus;
  reset?(): void;
}

// Composite nodes
class Sequence extends BTNode {
  // Executa filhos em ordem, falha se qualquer um falhar
  constructor(children: BTNode[]);
}

class Selector extends BTNode {
  // Tenta filhos em ordem, sucesso se qualquer um ter sucesso
  constructor(children: BTNode[]);
}

class RandomSelector extends BTNode {
  // Escolhe filho aleatório
  constructor(children: BTNode[], weights?: number[]);
}

// Decorator nodes
class Inverter extends BTNode {
  // Inverte resultado do filho
  constructor(child: BTNode);
}

class Repeater extends BTNode {
  // Repete filho N vezes ou infinitamente
  constructor(child: BTNode, times?: number);
}

class Cooldown extends BTNode {
  // Só executa filho se cooldown expirou
  constructor(child: BTNode, cooldownMs: number);
}

class Condition extends BTNode {
  // Verifica condição sem efeito colateral
  constructor(predicate: (entity: number, world: ECSWorld) => boolean);
}

// Action nodes (folhas)
class Action extends BTNode {
  constructor(action: (entity: number, world: ECSWorld, dt: number) => BTStatus);
}
```

---

## Passo 2 — Action Library

**Agente**: `@entity-master`

**Prompt**:
```
Crie src/ai/actions/ com ações reutilizáveis:

1. MoveTo.ts — Move entidade até posição alvo
   - Calcula direção, aplica velocity
   - Retorna Running enquanto longe, Success ao chegar
   - Parâmetros: targetPos, speed, arrivalDistance

2. Wander.ts — Caminhada aleatória
   - Escolhe ponto aleatório em raio
   - Move até lá, espera, escolhe novo ponto
   - Parâmetros: radius, pauseDuration, speed

3. LookAt.ts — Rotaciona para olhar alvo
   - Lerp suave da rotação
   - Success quando aligned

4. Wait.ts — Espera por duração
   - Running durante espera, Success ao fim

5. PlayAnimation.ts — (preparação para futuro)
   - Seta estado de animação no componente
   
6. SpeakDialog.ts — Emite evento de diálogo
   - Escolhe fala aleatória da lista
   - Emite 'npc:speak' com texto e NPC info

7. FollowEntity.ts — Segue outra entidade
   - Mantém distância mínima
   - Para quando alvo para

8. IsPlayerNearby.ts — Condition
   - Retorna true se jogador está dentro de raio

9. IsTimeOfDay.ts — Condition
   - Retorna true se hora do dia está no range (para dia/noite futuro)
```

---

## Passo 3 — Personality Trees

**Agente**: `@entity-master`

**Prompt**:
```
Crie src/ai/personalities.ts — Behavior Trees únicos para cada membro da família.

// MaFe (filha mais velha, 7 anos) — Exploradora curiosa
function createMaFeTree(): BTNode {
  return new Selector([
    new Sequence([
      new IsPlayerNearby(5),
      new LookAt('player'),
      new Cooldown(new SpeakDialog([
        "Papai, olha o que eu achei! 🌟",
        "Vamos explorar ali!",
        "Eu sou a MaFe aventureira!",
        "Achei uma flor bonita! 🌸"
      ]), 8000)
    ]),
    new Sequence([
      new Wander(15, 3000, 2.5), // Anda mais longe, mais rápido
      new RandomSelector([
        new Wait(2000),
        new Action(() => { /* jump animation */ return BTStatus.Success; })
      ])
    ])
  ]);
}

// Juju (filha mais nova, 3 anos) — Seguidora fofa
function createJujuTree(): BTNode {
  return new Selector([
    new Sequence([
      new IsPlayerNearby(3),
      new FollowEntity('player', 2, 1.5), // Segue de pertinho, devagar
      new Cooldown(new SpeakDialog([
        "Papai! Papai! 💕",
        "Juju quer colo!",
        "Upa! Upa!",
        "Olha, borboleta! 🦋"
      ]), 6000)
    ]),
    new Sequence([
      new Wander(5, 4000, 1.2), // Anda pouco, devagar
      new Wait(3000) // Para bastante
    ])
  ]);
}

// Ana Paula (mãe) — Protetora organizada
function createAnaPaulaTree(): BTNode {
  return new Selector([
    new Sequence([
      new IsPlayerNearby(8),
      new LookAt('player'),
      new Cooldown(new SpeakDialog([
        "Cuidado com as crianças, amor! 👩‍👧‍👧",
        "Que lugar lindo pra família!",
        "Não esquece o protetor solar! 😄",
        "Vamos tirar uma foto aqui!"
      ]), 10000)
    ]),
    new Sequence([
      new Condition((e, w) => /* Juju está longe */ true),
      new FollowEntity('juju', 4, 2.0) // Segue a Juju
    ]),
    new Wander(8, 5000, 1.8)
  ]);
}

// Flávio (pai/jogador) — controlado pelo jogador, sem AI tree
```

---

## Passo 4 — AIComponent & AISystem

**Agente**: `@entity-master`

**Prompt**:
```
Integre Behavior Trees com ECS.

1. Novo componente: AIComponent
   interface AIComponent {
     tree: BTNode;
     blackboard: Map<string, any>; // Dados compartilhados entre nós
     personality: string; // 'mafe' | 'juju' | 'ana_paula' | 'generic'
   }

2. AISystem (src/ecs/systems/AISystem.ts):
   - Requer: Transform, AIComponent
   - update(dt): para cada entidade, executa tree.tick()
   - Priority: 15 (antes de Movement)

3. Blackboard pode conter:
   - 'target_position': Vector3
   - 'home_position': Vector3
   - 'player_entity': number
   - 'last_spoke_at': number
   - 'wander_target': Vector3

4. Criação de NPCs familiares:
   Ao criar NPC familiar, atribuir AIComponent com tree da personalidade
```

---

## Passo 5 — NPC Genéricos

**Agente**: `@entity-master`

**Prompt**:
```
Crie trees para NPCs genéricos em src/ai/genericNPCs.ts

1. Villager — NPC pacífico
   - Caminha pela vila
   - Para em pontos de interesse
   - Fala quando jogador se aproxima

2. Merchant — (preparação futura)
   - Fica parado num ponto fixo
   - Cumprimentar jogador quando se aproxima
   - Abre UI de trade quando interagir

3. Animal — (bicho solto)
   - Wander aleatório
   - Foge se jogador corre em direção
   - Volta ao normal se jogador se afasta

Cada tipo tem variações de diálogo e velocidade
```

---

## Passo 6 — Debug Visual

**Agente**: `@quality`

**Prompt**:
```
Crie src/debug/AIDebugOverlay.ts

1. Toggle com F10
2. Mostra acima de cada NPC:
   - Nome
   - Estado atual do behavior tree (nó ativo)
   - Seta na direção do movimento
3. Mostra raio de detecção do jogador (wireframe circle)
4. Mostra target position (marker no chão)
5. Log no console do fluxo da behavior tree
```

---

## Checklist de Conclusão

- [ ] BehaviorTree framework completo (Sequence, Selector, Decorators)
- [ ] 9+ Action nodes reutilizáveis
- [ ] MaFe tem personalidade exploradora
- [ ] Juju tem personalidade seguidora
- [ ] Ana Paula tem personalidade protetora
- [ ] NPCs genéricos com 3 tipos de behavior
- [ ] AIComponent integrado no ECS
- [ ] AISystem executa trees a cada frame
- [ ] Blackboard funciona para compartilhar dados
- [ ] Diálogos personalizados por NPC
- [ ] Debug overlay funcional
- [ ] Performance OK com 20+ NPCs simultâneos
