# Sprint 19 — Professional Audio System

> **Fase**: 4 — Polimento  
> **Agente Principal**: `@audio-engineer`  
> **Agentes de Apoio**: `@engine`  
> **Dependências**: Sprint 01 (ES Modules), Sprint 08 (Event Bus)  
> **Duração Estimada**: 2-3 dias  

---

## Objetivo

Upgrade do sistema de áudio para produção: mixagem profissional, spatial audio 3D, música procedural e sound design completo.

---

## Passo 1 — Audio Engine

**Agente**: `@audio-engineer`

**Prompt**:
```
Crie src/audio/AudioEngine.ts — motor de áudio profissional.

class AudioEngine {
  private context: AudioContext;
  private masterGain: GainNode;
  private compressor: DynamicsCompressorNode;
  
  // Mix buses
  private musicBus: GainNode;
  private sfxBus: GainNode;
  private ambientBus: GainNode;
  private uiBus: GainNode;
  
  // Volumes separados
  setMasterVolume(v: number): void;
  setMusicVolume(v: number): void;
  setSFXVolume(v: number): void;
  setAmbientVolume(v: number): void;
  
  // Spatial audio
  private listener: AudioListener;
  updateListenerPosition(pos: Vector3, forward: Vector3, up: Vector3): void;
  
  // Sound pool (evitar criar AudioBufferSourceNode a cada som)
  private soundPool: Map<string, AudioBuffer>;
  loadSound(id: string, url: string): Promise<void>;
  
  // Play
  playSFX(id: string, options?: SFXOptions): AudioSourceHandle;
  play3DSFX(id: string, position: Vector3, options?: SFXOptions): AudioSourceHandle;
  playMusic(id: string, options?: MusicOptions): void;
  playAmbient(id: string, options?: AmbientOptions): void;
  
  // Crossfade music
  crossfadeMusic(newId: string, duration?: number): void;
  
  // Resume (para autoplay policy)
  resume(): Promise<void>;
}

interface SFXOptions {
  volume?: number;     // 0-1
  pitch?: number;      // 0.5-2.0 (1 = normal)
  pitchVariance?: number; // Randomiza pitch ±variance
  loop?: boolean;
  bus?: 'sfx' | 'ambient' | 'ui';
}
```

---

## Passo 2 — Sound Design

**Agente**: `@audio-engineer`

**Prompt**:
```
Crie src/audio/SoundDesigner.ts — gerador de sons procedurais.

Gerar sons via Web Audio API (sem arquivos):

1. Block place: click curto + low thump
2. Block break: crack + debris scatter
3. Footstep grass: soft thud + rustle (com variação)
4. Footstep stone: hard click
5. Footstep sand: soft whoosh
6. Footstep wood: hollow knock
7. Jump: whoosh upward
8. Land: thump + slight crack
9. Coin collect: bright chime ascendente (C-E-G arpeggio rápido)
10. Quest complete: fanfarra (C-G-C ascendente com harmonics)
11. Menu click: subtle click
12. Menu hover: very subtle tick
13. Chat message: soft ping
14. NPC speak: subtle vocal hint (filtered noise)
15. Water splash: noise burst + filter sweep
16. Wind: filtered noise, intensity variável
17. Rain: many tiny noise bursts
18. Thunder: low noise burst + reverb

Cada som com pitch variance para não repetir identicamente.
Footsteps variam com velocidade do jogador e superfície.
```

---

## Passo 3 — Procedural Music

**Agente**: `@audio-engineer`

**Prompt**:
```
Crie src/audio/MusicGenerator.ts — música procedural por bioma.

class MusicGenerator {
  // Gera música generativa que muda com o contexto
  
  setMood(mood: Mood): void;   // Muda gradualmente
  setBiome(biome: string): void;
  setTimeOfDay(normalized: number): void;
  
  // Moods
  enum Mood { Peaceful, Adventurous, Tense, Celebration }
  
  // Elementos musicais por bioma:
  Plains: piano + strings, C major, 80 BPM
  Forest: woodwinds + harp, A minor, 70 BPM
  Desert: percussion + oud-like, D minor, 90 BPM
  Mountains: brass + choir pad, E minor, 60 BPM
  Snow: celesta + pads, F major, 65 BPM
  
  // Implementação com oscillators:
  - Melodia: sequencer com notas da escala, pattern semi-aleatório
  - Harmonia: pads com acordes (2-3 oscillators + filter)
  - Ritmo: drum pattern com noise (kick, hihat, snare)
  - Bass: sine wave seguindo root note
  
  // Transições suaves: crossfade 5s ao mudar bioma
}
```

---

## Passo 4 — 3D Spatial Audio

**Agente**: `@audio-engineer`

**Prompt**:
```
Integre spatial audio com entidades:

1. AudioEmitterComponent para ECS:
   interface AudioEmitterComponent {
     soundId: string;
     volume: number;
     maxDistance: number;
     loop: boolean;
     playing: boolean;
   }

2. AudioSystem (ECS):
   - Para cada entidade com AudioEmitter + Transform
   - Atualiza posição do PannerNode
   - Distance model: 'inverse' com rolloff
   - maxDistance define alcance

3. Usos:
   - Água: som de rio/cachoeira em blocos de água
   - NPCs: murmúrios quando próximo
   - Animais futuros: sons de animais
   - Portais/itens especiais: hum/glow
```

---

## Passo 5 — Audio Settings UI

**Agente**: `@ui-designer`

**Prompt**:
```
Adicione configurações de áudio:

1. No menu de configurações:
   - Master Volume: slider 0-100%
   - Music Volume: slider 0-100%
   - SFX Volume: slider 0-100%
   - Ambient Volume: slider 0-100%
   - Mute All: toggle
   
2. Persistir volumes em settings (save/load)
3. Ícone de speaker no HUD (click para mute rápido)
4. Visual feedback ao mudar volume (barra animada)
```

---

## Checklist de Conclusão

- [ ] AudioEngine com 4 mix buses
- [ ] Spatial audio 3D funciona
- [ ] 18+ efeitos sonoros procedurais
- [ ] Footsteps variam com superfície
- [ ] Música procedural por bioma
- [ ] Crossfade suave entre músicas
- [ ] Volumes configuráveis separadamente
- [ ] Audio settings persistidos
- [ ] AudioEmitter ECS component funciona
- [ ] Mute/unmute funciona
- [ ] Resume após autoplay policy
- [ ] Sem clipping ou artefatos
