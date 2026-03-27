// ============================================
// AUDIO SYSTEM
// ============================================
export class AudioSystem {
    ctx: AudioContext | null = null;
    masterGain: GainNode | null = null;
    volume = 0.7;
    sounds: Record<string, AudioBuffer | null> = {};
    music: null = null;
    initialized = false;

    init(): void {
        try {
            this.ctx = new (globalThis.AudioContext || (globalThis as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = this.volume;
            this.masterGain.connect(this.ctx.destination);
            this.initialized = true;
            this.generateSounds();
        } catch (e) {
            console.warn('Audio not available:', e);
        }
    }

    setVolume(v: number): void {
        this.volume = v;
        if (this.masterGain) {
            this.masterGain.gain.value = v;
        }
    }

    generateSounds(): void {
        // Pre-generate common sounds
        this.sounds.jump = this.createToneBuffer(440, 0.15, 'sine', 0.3);
        this.sounds.land = this.createToneBuffer(180, 0.1, 'sine', 0.2);
        this.sounds.place = this.createToneBuffer(600, 0.08, 'square', 0.15);
        this.sounds.remove = this.createToneBuffer(300, 0.12, 'sawtooth', 0.15);
        this.sounds.coin = this.createToneBuffer(880, 0.2, 'sine', 0.25);
        this.sounds.step1 = this.createToneBuffer(120, 0.05, 'sine', 0.08);
        this.sounds.step2 = this.createToneBuffer(140, 0.05, 'sine', 0.08);
        this.sounds.hurt = this.createToneBuffer(200, 0.3, 'sawtooth', 0.2);
        this.sounds.achievement = this.createChimeBuffer();
    }

    createToneBuffer(freq: number, duration: number, type: OscillatorType, vol: number): AudioBuffer | null {
        if (!this.ctx) return null;
        const sr = this.ctx.sampleRate;
        const length = Math.floor(sr * duration);
        const buffer = this.ctx.createBuffer(1, length, sr);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < length; i++) {
            const t = i / sr;
            let sample;
            switch (type) {
                case 'sine': sample = Math.sin(2 * Math.PI * freq * t); break;
                case 'square': sample = Math.sin(2 * Math.PI * freq * t) > 0 ? 1 : -1; break;
                case 'sawtooth': sample = 2 * (t * freq - Math.floor(t * freq + 0.5)); break;
                default: sample = Math.sin(2 * Math.PI * freq * t);
            }
            const envelope = 1 - (i / length);
            data[i] = sample * envelope * vol;
        }
        return buffer;
    }

    createChimeBuffer(): AudioBuffer | null {
        if (!this.ctx) return null;
        const sr = this.ctx.sampleRate;
        const duration = 0.5;
        const length = Math.floor(sr * duration);
        const buffer = this.ctx.createBuffer(1, length, sr);
        const data = buffer.getChannelData(0);

        const freqs = [523, 659, 784, 1047];
        for (let i = 0; i < length; i++) {
            const t = i / sr;
            let sample = 0;
            freqs.forEach((f, idx) => {
                const delay = idx * 0.08;
                if (t >= delay) {
                    const lt = t - delay;
                    sample += Math.sin(2 * Math.PI * f * lt) * Math.exp(-lt * 6) * 0.2;
                }
            });
            data[i] = sample;
        }
        return buffer;
    }

    play(name: string): void {
        if (!this.initialized || !this.sounds[name]) return;
        try {
            if (!this.ctx || !this.masterGain) return;
            if (this.ctx.state === 'suspended') this.ctx.resume();
            const source = this.ctx.createBufferSource();
            source.buffer = this.sounds[name];
            source.connect(this.masterGain);
            source.start();
        } catch (e) {
            console.warn('Audio play error:', e);
        }
    }

    playMusic(): void {
        // Ambient background with oscillators
        if (!this.initialized) return;
        try {
            if (!this.ctx || !this.masterGain) return;
            const ctx = this.ctx;
            if (ctx.state === 'suspended') ctx.resume();

            const musicGain = ctx.createGain();
            musicGain.gain.value = 0.06;
            musicGain.connect(this.masterGain);

            const playNote = (freq: number, startTime: number, dur: number): void => {
                const osc = ctx.createOscillator();
                const noteGain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.value = freq;
                noteGain.gain.setValueAtTime(0, startTime);
                noteGain.gain.linearRampToValueAtTime(0.5, startTime + 0.1);
                noteGain.gain.linearRampToValueAtTime(0, startTime + dur);
                osc.connect(noteGain);
                noteGain.connect(musicGain);
                osc.start(startTime);
                osc.stop(startTime + dur);
            };

            const melody = [262, 294, 330, 349, 392, 349, 330, 294];
            const now = ctx.currentTime;
            const loopDuration = melody.length * 0.8;

            const playLoop = (offset: number): void => {
                melody.forEach((freq, i) => {
                    playNote(freq, now + offset + i * 0.8, 0.7);
                });
            };

            for (let loop = 0; loop < 50; loop++) {
                playLoop(loop * loopDuration);
            }
        } catch (e) {
            console.warn('Music play error:', e);
        }
    }
}
