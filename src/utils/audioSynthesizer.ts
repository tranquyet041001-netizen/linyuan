// Serene Japanese Koto, Zen Temple Bell & Ambient Lo-Fi Synthesizer via Web Audio API
import { AmbientPresetId } from '../types/birthday';

export type { AmbientPresetId };

export interface AmbientPresetConfig {
  id: AmbientPresetId;
  name: string;
  japaneseName: string;
  description: string;
  icon: string;
  mood: string;
}

export const AMBIENT_PRESETS: Record<AmbientPresetId, AmbientPresetConfig> = {
  'koto-classic': {
    id: 'koto-classic',
    name: 'Koto Classic',
    japaneseName: '古典箏の調べ',
    description: 'Traditional Japanese Insen scale melody with gentle ambient chords',
    icon: 'Sparkles',
    mood: 'Tranquil & Traditional',
  },
  'zen-bell': {
    id: 'zen-bell',
    name: 'Zen Temple Bell',
    japaneseName: '梵鐘・静寂',
    description: 'Deep 144Hz bronze bell with inharmonic metallic resonance',
    icon: 'Bell',
    mood: 'Meditative & Sacred',
  },
  'rain-koto': {
    id: 'rain-koto',
    name: 'Spring Rain & Koto',
    japaneseName: '春雨と琴',
    description: 'Continuous filtered pink noise rain with delicate koto plucks',
    icon: 'CloudRain',
    mood: 'Peaceful & Calming',
  },
  'lofi-beats': {
    id: 'lofi-beats',
    name: 'Neo-Tokyo Lo-Fi',
    japaneseName: '東京ローファイ',
    description: 'Warm jazzy 7th chords through 1.1kHz filter with analog vinyl crackle',
    icon: 'Disc',
    mood: 'Nostalgic & Cozy',
  },
};

export const AMBIENT_PRESET_CONFIGS = AMBIENT_PRESETS;

export class SakuraAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private timerId: number | null = null;
  private gainNode: GainNode | null = null;
  private customAudio: HTMLAudioElement | null = null;
  private isCustom: boolean = false;
  private volume: number = 0.65;
  private currentPreset: AmbientPresetId = 'koto-classic';

  // Active continuous loop sources (e.g. rain noise buffer, vinyl crackle buffer)
  private activeLoopSources: AudioBufferSourceNode[] = [];

  // Cached procedural audio buffers
  private pinkNoiseBuffer: AudioBuffer | null = null;
  private vinylBuffer: AudioBuffer | null = null;

  // Koto Classic scales and chords
  private notes = [
    220.0,  // A3
    246.94, // B3
    261.63, // C4
    329.63, // E4
    349.23, // F4
    440.0,  // A4
    493.88, // B4
    523.25, // C5
    659.25, // E5
    698.46, // F5
    880.0,  // A5
  ];

  private chords = [
    [220.0, 329.63, 523.25], // Am
    [174.61, 261.63, 349.23], // F
    [196.0, 293.66, 440.0],  // G
    [220.0, 329.63, 440.0],  // A oct
  ];

  private chordIndex = 0;

  // Insen scale for Rain-Koto (Root, Minor 2nd, Perfect 4th, Perfect 5th, Minor 7th)
  private insenNotes = [
    220.0,  // A3
    233.08, // Bb3
    293.66, // D4
    329.63, // E4
    392.00, // G4
    440.0,  // A4
    466.16, // Bb4
    587.33, // D5
    659.25, // E5
  ];

  // Jazzy 7th chords for Lo-Fi Beats
  private lofiChords = [
    [174.61, 220.00, 261.63, 329.63], // Fmaj7 (F3, A3, C4, E4)
    [164.81, 196.00, 246.94, 293.66], // Em7   (E3, G3, B3, D4)
    [146.83, 174.61, 220.00, 261.63], // Dm7   (D3, F3, A3, C4)
    [130.81, 164.81, 196.00, 246.94], // Cmaj7 (C3, E3, G3, B3)
  ];
  private lofiChordIndex = 0;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.gainNode.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setPreset(preset: AmbientPresetId): void {
    if (this.currentPreset === preset) return;
    this.currentPreset = preset;

    if (this.isPlaying && !this.isCustom) {
      if (this.timerId !== null) {
        clearTimeout(this.timerId);
        this.timerId = null;
      }
      this.stopActiveSources();
      this.schedulePresetLoop(preset);
    }
  }

  public async playPreset(preset: AmbientPresetId): Promise<boolean> {
    this.setPreset(preset);
    return this.play();
  }

  public getPreset(): AmbientPresetId {
    return this.currentPreset;
  }

  public setVolume(val: number): void {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.gainNode && this.ctx) {
      try {
        this.gainNode.gain.cancelScheduledValues(this.ctx.currentTime);
        this.gainNode.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
      } catch (e) {
        this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      }
    }
    if (this.customAudio) {
      this.customAudio.volume = this.volume;
    }
  }

  public setCustomAudioUrl(url?: string): void {
    if (this.customAudio) {
      this.customAudio.pause();
      this.customAudio.src = '';
      this.customAudio = null;
    }

    if (url && url.trim()) {
      this.isCustom = true;
      try {
        const audio = new Audio();
        audio.crossOrigin = 'anonymous';
        audio.preload = 'auto';
        audio.loop = true;
        audio.volume = this.volume;
        audio.src = url.trim();
        this.customAudio = audio;
      } catch (e) {
        console.warn('Failed to initialize custom audio element:', e);
        this.isCustom = false;
      }
    } else {
      this.isCustom = false;
    }
  }

  private stopActiveSources(): void {
    for (const source of this.activeLoopSources) {
      try {
        source.stop();
        source.disconnect();
      } catch (e) {}
    }
    this.activeLoopSources = [];
  }

  // --- Preset 1: Zen Temple Bell (144Hz fundamental, non-harmonic overtones, exponential decay) ---
  public playZenBell(): void {
    this.scheduleZenBellLoop();
  }

  private scheduleZenBellLoop(): void {
    if (!this.isPlaying || this.isCustom || !this.ctx) return;

    const now = this.ctx.currentTime;
    this.playZenBellStrike(144.0, now);

    this.timerId = window.setTimeout(() => {
      this.scheduleZenBellLoop();
    }, 9500);
  }

  private playZenBellStrike(fundamental: number, time: number): void {
    if (!this.ctx || !this.gainNode) return;

    // Bronze temple bell (Bonshō) inharmonic overtone ratios
    const partials = [
      { mult: 1.0,   detune: 0,   gain: 0.45, decay: 9.0 }, // Fundamental hum (144.0 Hz)
      { mult: 1.0,   detune: 4,   gain: 0.35, decay: 8.5 }, // Binaural beating (+4Hz / slow pulse)
      { mult: 1.523, detune: 0,   gain: 0.28, decay: 6.2 }, // Inharmonic strike overtone (219.3 Hz)
      { mult: 2.315, detune: 0,   gain: 0.22, decay: 4.8 }, // Tierce overtone (333.4 Hz)
      { mult: 3.011, detune: 0,   gain: 0.16, decay: 3.8 }, // Quint overtone (433.6 Hz)
      { mult: 4.168, detune: 0,   gain: 0.11, decay: 2.9 }, // High bronze mode (600.2 Hz)
      { mult: 5.431, detune: 0,   gain: 0.08, decay: 2.0 }, // Metallic shimmer (782.1 Hz)
      { mult: 6.790, detune: 0,   gain: 0.05, decay: 1.4 }, // Strike transient (977.8 Hz)
    ];

    partials.forEach(({ mult, detune, gain, decay }) => {
      const osc = this.ctx!.createOscillator();
      const noteGain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(fundamental * mult + detune, time);

      noteGain.gain.setValueAtTime(0.0001, time);
      noteGain.gain.linearRampToValueAtTime(gain * 0.7, time + 0.004);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, time + decay);

      osc.connect(noteGain);
      noteGain.connect(this.gainNode!);

      osc.start(time);
      osc.stop(time + decay + 0.05);

      osc.onended = () => {
        try {
          osc.disconnect();
          noteGain.disconnect();
        } catch (e) {}
      };
    });
  }

  // --- Preset 2: Spring Rain & Koto (Filtered pink noise + Insen scale plucks) ---
  public playRainKoto(): void {
    this.scheduleRainKotoLoop();
  }

  private scheduleRainKotoLoop(): void {
    if (!this.isPlaying || this.isCustom || !this.ctx) return;

    this.ensureRainNoise();

    const now = this.ctx.currentTime;
    const noteCount = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < noteCount; i++) {
      const note = this.insenNotes[Math.floor(Math.random() * this.insenNotes.length)];
      const delay = i * 1.3 + Math.random() * 0.7;
      this.playKotoPluck(note, now + delay, 2.5);
    }

    this.timerId = window.setTimeout(() => {
      this.scheduleRainKotoLoop();
    }, 3200);
  }

  private ensureRainNoise(): void {
    if (!this.ctx || !this.gainNode) return;
    if (this.activeLoopSources.some(s => (s as any).__tag === 'rain')) return;

    const buffer = this.getPinkNoiseBuffer(this.ctx);
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    (source as any).__tag = 'rain';

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(1200, this.ctx.currentTime);
    lowpass.Q.setValueAtTime(0.8, this.ctx.currentTime);

    const highpass = this.ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(250, this.ctx.currentTime);

    const rainGain = this.ctx.createGain();
    rainGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    rainGain.gain.linearRampToValueAtTime(0.20, this.ctx.currentTime + 1.2);

    source.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(rainGain);
    rainGain.connect(this.gainNode);

    source.start();
    this.activeLoopSources.push(source);
  }

  private getPinkNoiseBuffer(ctx: AudioContext): AudioBuffer {
    if (this.pinkNoiseBuffer && this.pinkNoiseBuffer.sampleRate === ctx.sampleRate) {
      return this.pinkNoiseBuffer;
    }
    const sampleRate = ctx.sampleRate;
    const bufferLength = sampleRate * 4;
    const buffer = ctx.createBuffer(1, bufferLength, sampleRate);
    const output = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferLength; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      b6 = white * 0.115926;
      output[i] = pink * 0.07;
    }

    this.pinkNoiseBuffer = buffer;
    return buffer;
  }

  private playKotoPluck(freq: number, time: number, duration = 2.5): void {
    if (!this.ctx || !this.gainNode) return;

    const osc = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    noteGain.gain.setValueAtTime(0.0001, time);
    noteGain.gain.linearRampToValueAtTime(0.28, time + 0.015);
    noteGain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    const osc2 = this.ctx.createOscillator();
    const noteGain2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, time);
    noteGain2.gain.setValueAtTime(0.0001, time);
    noteGain2.gain.linearRampToValueAtTime(0.10, time + 0.012);
    noteGain2.gain.exponentialRampToValueAtTime(0.001, time + duration * 0.7);

    osc.connect(noteGain);
    osc2.connect(noteGain2);
    noteGain.connect(this.gainNode);
    noteGain2.connect(this.gainNode);

    osc.start(time);
    osc2.start(time);
    osc.stop(time + duration);
    osc2.stop(time + duration);

    osc.onended = () => {
      try {
        osc.disconnect();
        osc2.disconnect();
        noteGain.disconnect();
        noteGain2.disconnect();
      } catch (e) {}
    };
  }

  // --- Preset 3: Neo-Tokyo Lo-Fi Beats (Jazzy 7th chords + 1.1kHz lowpass + vinyl clicks) ---
  public playLofiBeats(): void {
    this.scheduleLofiBeatsLoop();
  }

  private scheduleLofiBeatsLoop(): void {
    if (!this.isPlaying || this.isCustom || !this.ctx) return;

    this.ensureVinylNoise();

    const now = this.ctx.currentTime;
    const currentChord = this.lofiChords[this.lofiChordIndex % this.lofiChords.length];
    this.playLofiChord(currentChord, now, 3.8);
    this.playLofiKick(now);
    this.playLofiSnare(now + 1.9);

    this.lofiChordIndex++;

    this.timerId = window.setTimeout(() => {
      this.scheduleLofiBeatsLoop();
    }, 3800);
  }

  private ensureVinylNoise(): void {
    if (!this.ctx || !this.gainNode) return;
    if (this.activeLoopSources.some(s => (s as any).__tag === 'vinyl')) return;

    const buffer = this.getVinylCrackleBuffer(this.ctx);
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    (source as any).__tag = 'vinyl';

    const highpass = this.ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(1800, this.ctx.currentTime);

    const vinylGain = this.ctx.createGain();
    vinylGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    vinylGain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 1.0);

    source.connect(highpass);
    highpass.connect(vinylGain);
    vinylGain.connect(this.gainNode);

    source.start();
    this.activeLoopSources.push(source);
  }

  private getVinylCrackleBuffer(ctx: AudioContext): AudioBuffer {
    if (this.vinylBuffer && this.vinylBuffer.sampleRate === ctx.sampleRate) {
      return this.vinylBuffer;
    }
    const sampleRate = ctx.sampleRate;
    const bufferLength = sampleRate * 3;
    const buffer = ctx.createBuffer(1, bufferLength, sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferLength; i++) {
      let sample = (Math.random() * 2 - 1) * 0.0025;
      if (Math.random() < 0.00018) {
        sample += (Math.random() > 0.5 ? 1 : -1) * (0.03 + Math.random() * 0.05);
      }
      output[i] = sample;
    }

    this.vinylBuffer = buffer;
    return buffer;
  }

  private playLofiChord(chord: number[], time: number, duration = 3.8): void {
    if (!this.ctx || !this.gainNode) return;

    // Strict 1.1kHz Lowpass Filter constraint
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1100, time);
    filter.Q.setValueAtTime(1.1, time);
    filter.connect(this.gainNode);

    chord.forEach((freq) => {
      const osc = this.ctx!.createOscillator();
      const oscTape = this.ctx!.createOscillator();
      const noteGain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      oscTape.type = 'triangle';
      oscTape.frequency.setValueAtTime(freq, time);
      oscTape.detune.setValueAtTime(3.5, time); // Subtle +3.5 cents tape chorus

      noteGain.gain.setValueAtTime(0.0001, time);
      noteGain.gain.linearRampToValueAtTime(0.11, time + 0.08);
      noteGain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(noteGain);
      oscTape.connect(noteGain);
      noteGain.connect(filter);

      osc.start(time);
      oscTape.start(time);
      osc.stop(time + duration);
      oscTape.stop(time + duration);

      osc.onended = () => {
        try {
          osc.disconnect();
          oscTape.disconnect();
          noteGain.disconnect();
        } catch (e) {}
      };
    });
  }

  private playLofiKick(time: number): void {
    if (!this.ctx || !this.gainNode) return;
    const osc = this.ctx.createOscillator();
    const kickGain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(85, time);
    osc.frequency.exponentialRampToValueAtTime(45, time + 0.12);

    kickGain.gain.setValueAtTime(0.18, time);
    kickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

    osc.connect(kickGain);
    kickGain.connect(this.gainNode);

    osc.start(time);
    osc.stop(time + 0.25);
    osc.onended = () => {
      try {
        osc.disconnect();
        kickGain.disconnect();
      } catch (e) {}
    };
  }

  private playLofiSnare(time: number): void {
    if (!this.ctx || !this.gainNode) return;
    const osc = this.ctx.createOscillator();
    const snareGain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(60, time + 0.08);

    snareGain.gain.setValueAtTime(0.07, time);
    snareGain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

    osc.connect(snareGain);
    snareGain.connect(this.gainNode);

    osc.start(time);
    osc.stop(time + 0.15);
    osc.onended = () => {
      try {
        osc.disconnect();
        snareGain.disconnect();
      } catch (e) {}
    };
  }

  // --- Preset 4: Koto Classic (Existing Insen scale melody loop) ---
  public playKotoClassic(): void {
    this.scheduleKotoClassicLoop();
  }

  private playPluck(freq: number, time: number, duration = 2.5): void {
    if (!this.ctx || !this.gainNode) return;

    const osc = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    noteGain.gain.setValueAtTime(0, time);
    noteGain.gain.linearRampToValueAtTime(0.35, time + 0.02);
    noteGain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    const osc2 = this.ctx.createOscillator();
    const noteGain2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, time);
    noteGain2.gain.setValueAtTime(0, time);
    noteGain2.gain.linearRampToValueAtTime(0.12, time + 0.015);
    noteGain2.gain.exponentialRampToValueAtTime(0.001, time + duration * 0.7);

    osc.connect(noteGain);
    osc2.connect(noteGain2);
    noteGain.connect(this.gainNode);
    noteGain2.connect(this.gainNode);

    osc.start(time);
    osc2.start(time);
    osc.stop(time + duration);
    osc2.stop(time + duration);

    osc.onended = () => {
      try {
        osc.disconnect();
        osc2.disconnect();
        noteGain.disconnect();
        noteGain2.disconnect();
      } catch (e) {}
    };
  }

  private playAmbientPad(chord: number[], time: number, duration = 4.0): void {
    if (!this.ctx || !this.gainNode) return;

    chord.forEach((freq) => {
      const osc = this.ctx!.createOscillator();
      const padGain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * 0.5, time);

      padGain.gain.setValueAtTime(0, time);
      padGain.gain.linearRampToValueAtTime(0.06, time + 1.2);
      padGain.gain.linearRampToValueAtTime(0, time + duration);

      osc.connect(padGain);
      padGain.connect(this.gainNode!);

      osc.start(time);
      osc.stop(time + duration);

      osc.onended = () => {
        try {
          osc.disconnect();
          padGain.disconnect();
        } catch (e) {}
      };
    });
  }

  private scheduleKotoClassicLoop(): void {
    if (!this.isPlaying || this.isCustom || !this.ctx) return;

    const now = this.ctx.currentTime;
    const currentChord = this.chords[this.chordIndex % this.chords.length];
    this.playAmbientPad(currentChord, now, 4.2);
    this.chordIndex++;

    const noteCount = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < noteCount; i++) {
      const randomNote = this.notes[Math.floor(Math.random() * this.notes.length)];
      const delay = (i * 0.75) + (Math.random() * 0.3);
      this.playPluck(randomNote, now + delay, 2.0 + Math.random() * 1.0);
    }

    this.timerId = window.setTimeout(() => {
      this.scheduleKotoClassicLoop();
    }, 3800);
  }

  private schedulePresetLoop(preset: AmbientPresetId): void {
    if (!this.isPlaying || this.isCustom || !this.ctx) return;

    switch (preset) {
      case 'zen-bell':
        this.scheduleZenBellLoop();
        break;
      case 'rain-koto':
        this.scheduleRainKotoLoop();
        break;
      case 'lofi-beats':
        this.scheduleLofiBeatsLoop();
        break;
      case 'koto-classic':
      default:
        this.scheduleKotoClassicLoop();
        break;
    }
  }

  public async play(): Promise<boolean> {
    if (this.isPlaying) return true;
    try {
      this.initContext();
      if (!this.ctx) return false;

      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }

      this.isPlaying = true;

      if (this.isCustom && this.customAudio) {
        try {
          await this.customAudio.play();
          return true;
        } catch (audioErr) {
          console.warn('Custom audio playback blocked or failed:', audioErr);
          this.isPlaying = false;
          return false;
        }
      } else {
        this.schedulePresetLoop(this.currentPreset);
        return true;
      }
    } catch (e) {
      console.warn('Audio play initialization failed:', e);
      this.isPlaying = false;
      return false;
    }
  }

  public pause(): void {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.stopActiveSources();
    if (this.customAudio) {
      try {
        this.customAudio.pause();
      } catch (e) {}
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.pause();
      return false;
    } else {
      this.play();
      return true;
    }
  }

  public playCelebrationChime(): void {
    try {
      this.initContext();
      if (!this.ctx || !this.gainNode) return;
      const now = this.ctx.currentTime;
      // Japanese pentatonic chime: D5, F#5, A5, B5, D6, F#6
      const chimeFrequencies = [587.33, 739.99, 880.0, 987.77, 1174.66, 1479.98];
      chimeFrequencies.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const noteGain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        noteGain.gain.setValueAtTime(0, now + idx * 0.08);
        noteGain.gain.linearRampToValueAtTime(0.2, now + idx * 0.08 + 0.02);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.8);

        osc.connect(noteGain);
        noteGain.connect(this.gainNode!);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 1.9);

        osc.onended = () => {
          try {
            osc.disconnect();
            noteGain.disconnect();
          } catch (e) {}
        };
      });
    } catch (e) {
      console.warn('Celebration chime failed:', e);
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const sakuraAudio = new SakuraAudioEngine();
