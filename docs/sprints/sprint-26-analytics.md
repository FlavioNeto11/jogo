# Sprint 26 — Analytics & Monitoring

> **Fase**: 5 — Beyond  
> **Agente Principal**: `@devops`  
> **Agentes de Apoio**: `@architect`  
> **Dependências**: Sprint 16 (Backend), Sprint 17 (Cloud Deploy)  
> **Duração Estimada**: 1-2 dias  

---

## Objetivo

Instrumentar o jogo com analytics para entender comportamento do jogador, performance em produção e métricas de engajamento.

---

## Passo 1 — Analytics Service

**Agente**: `@devops`

**Prompt**:
```
Crie src/services/AnalyticsService.ts

class AnalyticsService {
  private static enabled: boolean = true;  // Respeitar opt-out
  
  // Page/Screen tracking
  static trackScreen(screenName: string): void;
  
  // Events
  static trackEvent(category: string, action: string, label?: string, value?: number): void;
  
  // Game-specific
  static trackGameStart(): void;
  static trackGameEnd(playTimeSeconds: number): void;
  static trackQuestStarted(questId: string): void;
  static trackQuestCompleted(questId: string, timeSeconds: number): void;
  static trackBlockPlaced(blockType: string): void;
  static trackBiomeVisited(biomeId: string): void;
  static trackCoinCollected(total: number): void;
  static trackDeath(cause: string): void;
  static trackCraft(recipeId: string): void;
  static trackMultiplayerJoin(roomId: string, playerCount: number): void;
  
  // Performance
  static trackPerformance(metrics: PerformanceMetrics): void;
  
  // User properties
  static setUserProperty(key: string, value: string | number): void;
  
  // Consent
  static setEnabled(enabled: boolean): void;
}

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  drawCalls: number;
  triangles: number;
  heapUsed: number;
  chunksLoaded: number;
}

IMPLEMENTAÇÃO:
- Firebase Analytics (Google Analytics 4)
- Fallback para custom analytics se Firebase não disponível
- Batch events para enviar em lotes (reduzir network)
- Respeitar Do Not Track header
- Cookie consent popup (LGPD)
```

---

## Passo 2 — Performance Monitoring

**Agente**: `@devops`

**Prompt**:
```
Crie src/debug/PerformanceMonitor.ts

class PerformanceMonitor {
  private samples: PerformanceMetrics[] = [];
  private sampleInterval: number = 5000; // 5s
  
  start(): void;
  stop(): void;
  
  // Coleta automática
  private collectMetrics(): PerformanceMetrics;
  
  // Envio periódico para analytics
  private reportToAnalytics(): void;
  
  // Alertas
  private checkThresholds(): void;
  // Se FPS < 20 por 10s → reportar slow device
  // Se heap > 500MB → reportar memory issue
  // Se drawCalls > 100 → reportar rendering issue
  
  // In-game overlay (F12)
  renderDebugOverlay(): void;
  // FPS graph, memory usage, draw calls, chunk count
}
```

---

## Passo 3 — Error Tracking

**Agente**: `@devops`

**Prompt**:
```
Configure error tracking:

1. window.onerror handler global
2. window.onunhandledrejection handler
3. Enviar para Firebase Crashlytics ou serviço custom
4. Incluir: stack trace, user agent, game state, performance metrics
5. Rate limiting: max 10 errors por sessão

Crie src/services/ErrorTracker.ts:
class ErrorTracker {
  static init(): void;
  static captureError(error: Error, context?: Record<string, any>): void;
  static captureMessage(message: string, level: 'info' | 'warning' | 'error'): void;
  static setContext(key: string, value: any): void;
}
```

---

## Passo 4 — LGPD/Privacy

**Agente**: `@ui-designer`

**Prompt**:
```
Implemente consentimento de dados (LGPD):

1. Cookie consent banner na primeira visita:
   "Este jogo usa cookies e analytics para melhorar sua experiência."
   [Aceitar Todos] [Apenas Necessários] [Configurar]

2. Se "Apenas Necessários":
   - Analytics desabilitado
   - Apenas localStorage para save
   - Sem Firebase Analytics

3. Settings > Privacidade:
   - Toggle analytics
   - Toggle cloud saves
   - "Deletar meus dados" button
   - Link para política de privacidade

4. Respeitar Do Not Track header automaticamente
```

---

## Passo 5 — Dashboard (Opcional)

**Agente**: `@devops`

**Prompt**:
```
Configurar Firebase Analytics dashboard com:

1. Métricas principais:
   - DAU/MAU (Daily/Monthly Active Users)
   - Session duration médio
   - Retention D1/D7/D30
   - Eventos por sessão

2. Game metrics:
   - Quests mais completadas
   - Biomas mais visitados
   - Blocos mais usados
   - Tempo médio por sessão
   - Completion rate por quest

3. Technical metrics:
   - FPS médio por device
   - Crash rate
   - Load time distribution
   - Browser/OS distribution
```

---

## Checklist de Conclusão

- [ ] AnalyticsService implementado
- [ ] 10+ event types rastreados
- [ ] Performance monitor com overlay
- [ ] Error tracking global
- [ ] LGPD consent banner
- [ ] Opt-out funciona
- [ ] Do Not Track respeitado
- [ ] Firebase Analytics configurado
- [ ] Dashboard com métricas chave
- [ ] Rate limiting em erros
- [ ] Batch sending de eventos
