# Sprint 18 — Basic Multiplayer

> **Fase**: 3 — Persistência  
> **Agente Principal**: `@network`  
> **Agentes de Apoio**: `@architect`, `@entity-master`  
> **Dependências**: Sprint 07 (ECS), Sprint 16 (Backend)  
> **Duração Estimada**: 5-7 dias  

---

## Objetivo

Multiplayer básico para até 4 jogadores na mesma sessão. Lobby system, sincronização de posição e chat em tempo real.

---

## Passo 1 — Architecture Decision

**Agente**: `@architect`

**Prompt**:
```
Defina a arquitetura de multiplayer:

OPÇÃO A — WebSocket (Socket.IO):
+ Baixa latência
+ Bidirecional
- Requer servidor dedicado

OPÇÃO B — Firebase Realtime Database:
+ Serverless, zero infra
+ Sync automático
- Latência maior (~100-200ms)
- Custo por read/write

OPÇÃO C — WebRTC (Peer-to-Peer):
+ Sem servidor para dados
+ Menor latência possível
- Complexo, NAT traversal
- Sem autoridade central

RECOMENDAÇÃO para MVP: Firebase Realtime Database
- Mais simples de implementar
- Funciona sem servidor dedicado
- Latência aceitável para jogo cooperativo (não competitivo)
- Scale: até 4 jogadores
- Evolução futura: migrar para WebSocket se precisar de mais jogadores
```

---

## Passo 2 — Room/Lobby System

**Agente**: `@network`

**Prompt**:
```
Crie src/network/RoomManager.ts

interface Room {
  id: string;
  name: string;
  hostUid: string;
  players: Map<string, PlayerInfo>;
  maxPlayers: number;
  worldSeed: number;
  createdAt: number;
  status: 'waiting' | 'playing';
}

interface PlayerInfo {
  uid: string;
  displayName: string;
  characterColor: number;
  isHost: boolean;
  isReady: boolean;
  lastSeen: number;
}

class RoomManager {
  async createRoom(name: string): Promise<Room>;
  async joinRoom(roomId: string): Promise<Room>;
  async leaveRoom(): Promise<void>;
  async listRooms(): Promise<Room[]>;
  
  // Room controls (host only)
  async kickPlayer(uid: string): Promise<void>;
  async startGame(): Promise<void>;
  
  // Presence
  private startHeartbeat(): void;  // Ping a cada 5s
  private cleanupDisconnected(): void;
  
  // Eventos
  onPlayerJoined(callback: (player: PlayerInfo) => void): void;
  onPlayerLeft(callback: (uid: string) => void): void;
  onGameStarted(callback: () => void): void;
}
```

---

## Passo 3 — State Synchronization

**Agente**: `@network`

**Prompt**:
```
Crie src/network/SyncManager.ts

class SyncManager {
  private localPlayerId: string;
  private syncInterval: number = 100; // ms (10 Hz)
  
  // Enviar estado local
  sendPlayerState(state: PlayerNetState): void;
  sendBlockChange(change: BlockChange): void;
  sendChatMessage(message: string): void;
  
  // Receber estado remoto
  onRemotePlayerState(callback: (uid: string, state: PlayerNetState) => void): void;
  onRemoteBlockChange(callback: (change: BlockChange) => void): void;
  onRemoteChatMessage(callback: (uid: string, message: string) => void): void;
  
  // Interpolação
  interpolatePosition(prev: Vector3, next: Vector3, t: number): Vector3;
}

interface PlayerNetState {
  position: { x: number; y: number; z: number };
  rotation: number;
  animation: string;  // 'idle' | 'walking' | 'jumping'
  timestamp: number;
}

interface BlockChange {
  x: number; y: number; z: number;
  blockType: number;  // 0 = removed
  playerId: string;
  timestamp: number;
}

FIREBASE REALTIME DB SCHEMA:
rooms/{roomId}/players/{uid}/state → PlayerNetState
rooms/{roomId}/blocks/{timestamp} → BlockChange
rooms/{roomId}/chat/{timestamp} → ChatMessage

OTIMIZAÇÕES:
- Enviar estado apenas quando muda (delta compression)
- Throttle: max 10 updates/segundo
- Interpolar posições remotas (smooth movement)
- Buffer de 100ms para reordenar pacotes
```

---

## Passo 4 — Remote Player Rendering

**Agente**: `@entity-master`

**Prompt**:
```
Crie src/network/RemotePlayerEntity.ts

Para cada jogador remoto:
1. Criar entidade ECS com: Transform, Mesh, Velocity
2. Character mesh com cor personalizada
3. Nametag flutuante acima da cabeça (Sprite)
4. Interpolação suave de posição (lerp entre states recebidos)
5. Ghost trail se latência alta (>300ms)
6. Fade in/out ao entrar/sair

RemotePlayerManager:
- Cria/remove entidades conforme jogadores entram/saem
- Atualiza posições a cada frame (interpolação)
- Mostra indicador de ping por jogador
```

---

## Passo 5 — Multiplayer UI

**Agente**: `@ui-designer`

**Prompt**:
```
1. Lobby Screen:
   - Lista de salas disponíveis
   - "Criar Sala" / "Entrar por Código"
   - Em cada sala: nome, jogadores, status
   
2. Room Waiting Screen:
   - Lista de jogadores com status "Pronto"
   - Botão "Pronto" / "Iniciar" (host)
   - Chat simples
   - Código da sala para compartilhar

3. In-Game Multiplayer HUD:
   - Lista de jogadores online (canto)
   - Ping indicator por jogador
   - Chat integrado (Enter para abrir)
   - "Jogador entrou" / "Jogador saiu" notifications

4. Player list:
   - Nomes coloridos
   - Ícone de host (coroa)
   - Opção de kick (host)
```

---

## Checklist de Conclusão

- [ ] Room create/join/leave funciona
- [ ] Lobby lista salas disponíveis
- [ ] Até 4 jogadores simultâneos
- [ ] Posição sincronizada em tempo real
- [ ] Interpolação suave
- [ ] Blocos sincronizados
- [ ] Chat funciona
- [ ] Nametags visíveis
- [ ] Heartbeat e cleanup de desconectados
- [ ] Latência < 200ms (Firebase)
- [ ] Lobby UI completa
- [ ] In-game player list
