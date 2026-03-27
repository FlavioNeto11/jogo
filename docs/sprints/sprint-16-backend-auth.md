# Sprint 16 — Backend & Auth (Firebase/Supabase)

> **Fase**: 3 — Persistência  
> **Agente Principal**: `@network`  
> **Agentes de Apoio**: `@architect`, `@devops`  
> **Dependências**: Sprint 15 (Save/Load)  
> **Duração Estimada**: 3-4 dias  

---

## Objetivo

Adicionar backend para autenticação, cloud saves e leaderboards usando Firebase ou Supabase (BaaS — Backend as a Service).

---

## Passo 1 — Escolha e Setup do BaaS

**Agente**: `@architect`

**Prompt**:
```
Avalie e configure o BaaS para o projeto.

OPÇÃO A — Firebase (Google):
+ Free tier generoso (Spark plan)
+ Firestore para dados, Auth pronto
+ Hosting incluído
- Vendor lock-in Google

OPÇÃO B — Supabase (Open Source):
+ PostgreSQL real
+ Row Level Security
+ Open source
- Menos features no free tier

RECOMENDAÇÃO: Firebase para MVP (mais simples, tudo integrado)

Setup Firebase:
1. npm install firebase
2. Criar firebase.config.ts com credenciais
3. Criar src/services/firebase.ts com inicialização
4. Configurar .env para API keys
5. Adicionar .env ao .gitignore

NÃO commitar API keys no repositório!
```

---

## Passo 2 — Authentication

**Agente**: `@network`

**Prompt**:
```
Crie src/services/AuthService.ts

class AuthService {
  // Login methods
  static async signInAnonymously(): Promise<User>;
  static async signInWithGoogle(): Promise<User>;
  static async signInWithEmail(email: string, password: string): Promise<User>;
  static async signUp(email: string, password: string, displayName: string): Promise<User>;
  
  // Session
  static getCurrentUser(): User | null;
  static isAuthenticated(): boolean;
  static async signOut(): Promise<void>;
  
  // Profile
  static async updateDisplayName(name: string): Promise<void>;
  static async updateAvatar(avatarData: string): Promise<void>;
  
  // Events
  static onAuthStateChanged(callback: (user: User | null) => void): () => void;
}

interface User {
  uid: string;
  displayName: string;
  email: string | null;
  isAnonymous: boolean;
  avatarUrl: string | null;
  createdAt: Date;
}

FLUXO:
1. Primeira visita: login anônimo automático
2. Opção de vincular conta Google para não perder progresso
3. Login com email para acesso multi-dispositivo
```

---

## Passo 3 — Cloud Saves

**Agente**: `@network`

**Prompt**:
```
Crie src/services/CloudSaveService.ts

class CloudSaveService {
  // Save
  static async saveToCloud(saveData: SaveData): Promise<string>; // Returns save ID
  static async autoSyncToCloud(): Promise<void>;
  
  // Load
  static async loadFromCloud(): Promise<SaveData | null>;
  static async listCloudSaves(): Promise<CloudSaveInfo[]>;
  
  // Conflict resolution
  static async resolveConflict(local: SaveData, cloud: SaveData): Promise<SaveData>;
  
  // Delete
  static async deleteCloudSave(saveId: string): Promise<void>;
}

interface CloudSaveInfo {
  id: string;
  timestamp: Date;
  playTime: number;
  coins: number;
  thumbnail: string | null;
}

FIRESTORE SCHEMA:
- users/{uid}/saves/{saveId} — SaveData
- users/{uid}/profile — User profile data
- users/{uid}/stats — Aggregated stats

REGRAS:
- Max 3 cloud saves por usuário (free tier)
- Sync automático a cada 10 minutos (se online)
- Offline-first: salva local, synca quando online
- Conflict: mais recente vence (com opção de escolher)
```

---

## Passo 4 — Leaderboard

**Agente**: `@network`

**Prompt**:
```
Crie src/services/LeaderboardService.ts

class LeaderboardService {
  static async submitScore(category: string, score: number): Promise<void>;
  static async getTopScores(category: string, limit?: number): Promise<LeaderboardEntry[]>;
  static async getPlayerRank(category: string): Promise<number>;
  static async getAroundPlayer(category: string, range?: number): Promise<LeaderboardEntry[]>;
}

interface LeaderboardEntry {
  rank: number;
  uid: string;
  displayName: string;
  score: number;
  timestamp: Date;
}

CATEGORIAS:
- 'coins' — Total de coins coletados
- 'blocks_placed' — Total de blocos colocados
- 'quests_completed' — Quests completadas
- 'play_time' — Tempo total jogado
- 'distance' — Distância percorrida

FIRESTORE:
- leaderboards/{category}/scores/{uid}
- Usar Cloud Functions ou Firestore rules para validação
- Atualizar rank com Firestore increment
```

---

## Passo 5 — Login & Leaderboard UI

**Agente**: `@ui-designer`

**Prompt**:
```
Crie interfaces:

1. Login Screen (antes do jogo):
   - Logo "MaFe & Juju World"
   - "Jogar como Visitante" (anônimo)
   - "Entrar com Google" (botão estilizado)
   - "Email e Senha" (form simples)
   
2. Profile Badge (in-game, canto superior):
   - Avatar + Nome
   - Click abre menu: Profile, Cloud Saves, Logout

3. Leaderboard UI (abre com L):
   - Tabs por categoria
   - Top 10 com destaque para jogador
   - Rank do jogador em cada categoria
   - Refresh button
   - Scroll para ver mais
```

---

## Passo 6 — Security Rules

**Agente**: `@devops`

**Prompt**:
```
Configure Firestore Security Rules:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Leaderboards: anyone can read, only own scores writable
    match /leaderboards/{category}/scores/{userId} {
      allow read: if true;
      allow write: if request.auth != null 
        && request.auth.uid == userId
        && request.resource.data.score is number
        && request.resource.data.score >= 0;
    }
  }
}
```

---

## Checklist de Conclusão

- [ ] Firebase/Supabase configurado
- [ ] API keys em .env (não no código)
- [ ] Login anônimo funciona
- [ ] Login Google funciona
- [ ] Cloud save/load funciona
- [ ] Offline-first com sync
- [ ] Conflict resolution
- [ ] Leaderboard 5 categorias
- [ ] Login UI estilizada
- [ ] Leaderboard UI funcional
- [ ] Security rules configuradas
- [ ] Rate limiting básico
