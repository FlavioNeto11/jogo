# Sprint 13 — Day/Night Cycle & Weather

> **Fase**: 2 — Gameplay  
> **Agente Principal**: `@engine`  
> **Agentes de Apoio**: `@world-builder`, `@audio-engineer`  
> **Dependências**: Sprint 01 (ES Modules)  
> **Duração Estimada**: 2 dias  

---

## Objetivo

Ciclo dia/noite com transição suave de cores, iluminação dinâmica e sistema de clima básico que afeta a ambientação.

---

## Passo 1 — Time Manager

**Agente**: `@engine`

**Prompt**:
```
Crie src/core/TimeManager.ts

class TimeManager {
  private gameTime: number = 0;     // 0-24000 (ticks, 1 dia = 24000)
  private timeScale: number = 72;   // 72x = 1 dia real em 20 min
  private paused: boolean = false;
  
  update(realDeltaMs: number): void;
  
  getHour(): number;              // 0-23
  getMinute(): number;            // 0-59
  getTimeString(): string;        // "14:30"
  getNormalizedTime(): number;    // 0-1 (0=meia-noite, 0.5=meio-dia)
  
  isDay(): boolean;               // 6h-18h
  isNight(): boolean;             // 18h-6h  
  isDawn(): boolean;              // 5h-7h
  isDusk(): boolean;              // 17h-19h
  
  setTime(hour: number): void;    // Para debug
  setTimeScale(scale: number): void;
  pause(): void;
  resume(): void;
  
  // Eventos
  // 'time:dawn', 'time:day', 'time:dusk', 'time:night'
}
```

---

## Passo 2 — Sky System

**Agente**: `@engine`

**Prompt**:
```
Refatore o sky shader em src/rendering/SkySystem.ts

1. Atualizar cores do céu baseado na hora:
   - Noite: azul escuro #0a0a2e com estrelas
   - Amanhecer: gradiente laranja/rosa → azul
   - Dia: azul claro #87ceeb → branco no horizonte  
   - Entardecer: gradiente vermelho/laranja/roxo

2. Sol e Lua:
   - Sol: esfera amarela que percorre arco no céu (leste→oeste)
   - Lua: esfera branca/cinza na posição oposta
   - Ambos representados por Sprite com glow

3. Estrelas:
   - Aparecem gradualmente à noite (fade in)
   - PointCloud com 500-1000 pontos
   - Twinkle effect (variação de opacidade)
   - Desaparecem ao amanhecer

4. Nuvens simples:
   - Planos com textura procedural
   - Movem lentamente com vento
   - 10-20 nuvens no céu
```

---

## Passo 3 — Lighting System

**Agente**: `@engine`

**Prompt**:
```
Crie src/rendering/LightingSystem.ts

Sincronizar iluminação com hora do dia:

1. DirectionalLight (sol):
   - Posição segue arco do sol
   - Intensidade: 0 (noite) → 1.0 (dia)
   - Cor: branco (dia), laranja (dawn/dusk), azul escuro (noite)
   
2. AmbientLight:
   - Intensidade: 0.1 (noite) → 0.4 (dia)
   - Cor: azul escuro (noite) → branco quente (dia)

3. HemisphereLight:
   - Sky color muda com hora
   - Ground color levemente mais escuro

4. Shadow direction segue sol

5. Fog:
   - Mais densa à noite
   - Cor acompanha céu
   - Distância: 100 (noite) → 200 (dia)

Todas as transições usam lerp suave, nunca mudanças abruptas.
```

---

## Passo 4 — Weather System

**Agente**: `@world-builder`

**Prompt**:
```
Crie src/world/WeatherSystem.ts

enum Weather { Clear, Cloudy, Rain, Storm, Fog }

class WeatherSystem {
  private current: Weather = Weather.Clear;
  private transition: number = 0; // 0-1 para blend entre estados
  private nextChange: number = 0;
  
  update(dt: number): void;
  setWeather(weather: Weather): void;
  getWeather(): Weather;
  
  // Efeitos visuais por clima:
  
  Clear:
  - Céu normal, sem efeitos extras
  
  Cloudy:
  - Mais nuvens, escurecer levemente
  - Reduzir intensidade do sol em 30%
  
  Rain:
  - Partículas de chuva (linhas finas caindo)
  - 500-1000 partículas recicladas
  - Splash particles ao tocar chão
  - Escurecer ambiente
  - Som de chuva (audio)
  
  Storm:
  - Rain + flash de relâmpago (tela branca momentânea)
  - Som de trovão (delay baseado em distância)
  - Vento mais forte nas nuvens
  
  Fog:
  - Aumentar fog density drasticamente
  - Reduzir view distance
  - Efeito misterioso
  
  Mudanças de clima a cada 5-10 minutos de game time.
  Probabilidades: Clear 40%, Cloudy 30%, Rain 15%, Storm 5%, Fog 10%
}
```

---

## Passo 5 — Audio Integration

**Agente**: `@audio-engineer`

**Prompt**:
```
Integre sons ambientes com dia/noite e clima:

1. Dia: pássaros cantando (loop suave)
2. Noite: grilos, corujas (loop suave)
3. Dawn/Dusk: mixagem entre dia e noite
4. Chuva: som de chuva contínuo (intensidade variável)
5. Trovão: som de trovão aleatório durante storm
6. Vento: som suave de vento (presente sempre, mais forte em storm)

Crossfade entre ambientes em 3-5 segundos.
Volume baseado em: clima (peso 0.7) + hora (peso 0.3)
```

---

## Passo 6 — HUD & Debug

**Agente**: `@ui-designer`

**Prompt**:
```
1. Relógio no HUD:
   - Canto superior esquerdo
   - Formato: "☀️ 14:30" ou "🌙 22:15"
   - Ícone muda com dia/noite
   - Mini-barra de progresso do dia

2. Indicador de clima:
   - Ícone ao lado do relógio
   - ☀️ Clear | ☁️ Cloudy | 🌧️ Rain | ⛈️ Storm | 🌫️ Fog

3. Debug (F11):
   - Slider para mudar hora manualmente
   - Botões para forçar clima
   - Valores de iluminação em tempo real
```

---

## Checklist de Conclusão

- [ ] TimeManager com ciclo de 20 minutos reais
- [ ] Sky muda de cor suavemente (4 períodos)
- [ ] Sol e Lua no céu
- [ ] Estrelas aparecem à noite
- [ ] Iluminação sincronizada com hora
- [ ] Sombras seguem sol
- [ ] Fog muda com hora e clima
- [ ] 5 tipos de clima implementados
- [ ] Partículas de chuva funcionam
- [ ] Relâmpagos visuais e sonoros
- [ ] Sons ambientes dia/noite
- [ ] Relógio no HUD
- [ ] Transições suaves (sem pop)
