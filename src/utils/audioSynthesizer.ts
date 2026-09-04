// Serene Japanese Koto & Ambient Piano Synthesizer via Web Audio API
class SakuraAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private timerId: number | null = null;
  private gainNode: GainNode | null = null;
  private customAudio: HTMLAudioElement | null = null;
  private isCustom: boolean = false;
  private volume: number = 0.5;

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

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.gainNode.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
    if (this.customAudio) {
      this.customAudio.volume = this.volume;
    }
  }

  public setCustomAudioUrl(url?: string) {
    if (this.customAudio) {
      this.customAudio.pause();
      this.customAudio = null;
    }

    if (url && url.trim()) {
      this.isCustom = true;
      this.customAudio = new Audio(url);
      this.customAudio.loop = true;
      this.customAudio.volume = this.volume;
    } else {
      this.isCustom = false;
    }
  }

  private playPluck(freq: number, time: number, duration = 2.5) {
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
  }

  private playAmbientPad(chord: number[], time: number, duration = 4.0) {
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
    });
  }

  private scheduleNextLoop() {
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
      this.scheduleNextLoop();
    }, 3800);
  }

  public play() {
    if (this.isPlaying) return;
    this.initContext();
    this.isPlaying = true;

    if (this.isCustom && this.customAudio) {
      this.customAudio.play().catch(() => {});
    } else {
      this.scheduleNextLoop();
    }
  }

  public pause() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    if (this.customAudio) {
      this.customAudio.pause();
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
    return this.isPlaying;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const sakuraAudio = new SakuraAudioEngine();
