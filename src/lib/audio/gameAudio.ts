/**
 * Khmer Typing Adventure - Procedural Web Audio Engine
 *
 * Synthesizes authentic Cambodian-themed audio effects in real time using the
 * browser's Web Audio API with zero external file downloads or latency:
 * - Melodic Khmer Pentatonic Keystroke Chimes (Roneat Ek xylophone timbre)
 * - Combo Streak Fanfares (harmonized arpeggios)
 * - Gentle Wooden Temple Block Error Taps
 * - Resonant Angkor Bronze Temple Gongs
 * - Stone & Gravel Footstep Shuffles
 * - Stage Completion Celestial Chimes
 */

const KHMER_PENTATONIC_SCALE = [
  261.63, // C4
  293.66, // D4
  329.63, // E4
  392.0, // G4
  440.0, // A4
  523.25, // C5
  587.33, // D5
  659.25, // E5
  783.99, // G5
  880.0, // A5
  1046.5, // C6
];

class GameAudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private enabled = true;
  private noteIndex = 0;
  private lastFootstepTime = 0;

  constructor() {
    // Read initial settings from localStorage if available
    try {
      const saved = localStorage.getItem('khmer-typing-settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.soundEnabled === 'boolean') {
          this.enabled = parsed.soundEnabled;
        }
      }
    } catch {
      // Ignore storage access errors in restricted contexts
    }
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      try {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
        this.sfxGain.connect(this.masterGain);
      } catch {
        return null;
      }
    }

    if (this.ctx.state === 'suspended') {
      void this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  public setSoundEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(enabled ? 0.7 : 0.0, this.ctx.currentTime, 0.05);
    }
  }

  public isSoundEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Plays a melodious chime in the traditional Cambodian pentatonic scale.
   * Timbre resembles the Roneat Ek (Khmer high-register bamboo/hardwood xylophone)
   * with bright initial transient and warm exponential decay.
   */
  public playKeystrokeChime(streak = 0): void {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain) return;

    // Pick note from pentatonic scale with melodic variation
    this.noteIndex = (this.noteIndex + 1) % KHMER_PENTATONIC_SCALE.length;
    // Higher streak shifts base octave upward for exhilaration
    const octaveOffset = streak > 15 ? 3 : streak > 8 ? 2 : 0;
    const noteIdx = Math.min(this.noteIndex + octaveOffset, KHMER_PENTATONIC_SCALE.length - 1);
    const freq = KHMER_PENTATONIC_SCALE[noteIdx];

    const now = ctx.currentTime;

    // Primary bell/bar oscillator (triangle for bright wooden warmth)
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    // Overtone oscillator (sine at 2.76x harmonic for metallic shimmer)
    const overtone = ctx.createOscillator();
    overtone.type = 'sine';
    overtone.frequency.setValueAtTime(freq * 2.76, now);

    const gainNode = ctx.createGain();
    const overtoneGain = ctx.createGain();

    // Fast transient attack, natural decay
    const duration = 0.22;
    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.24, now + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    overtoneGain.gain.setValueAtTime(0.001, now);
    overtoneGain.gain.exponentialRampToValueAtTime(0.06, now + 0.003);
    overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

    osc.connect(gainNode);
    overtone.connect(overtoneGain);
    gainNode.connect(this.sfxGain);
    overtoneGain.connect(this.sfxGain);

    osc.start(now);
    overtone.start(now);
    osc.stop(now + duration);
    overtone.stop(now + 0.09);
  }

  /**
   * Gentle wooden temple block tap for mistakes (encouraging, non-jarring).
   */
  public playMistakeSound(): void {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    // Gentle downward pitch bend
    osc.frequency.setValueAtTime(190, now);
    osc.frequency.exponentialRampToValueAtTime(95, now + 0.08);

    gainNode.gain.setValueAtTime(0.18, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gainNode);
    gainNode.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  /**
   * Combo streak fanfare (ascending arpeggio with shimmering overtones).
   */
  public playComboFanfare(comboTier = 1): void {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain) return;

    const baseFreqs = comboTier >= 3
      ? [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
      : comboTier === 2
      ? [392.0, 523.25, 659.25, 880.0] // G4, C5, E5, A5
      : [329.63, 392.0, 523.25]; // E4, G4, C5

    const now = ctx.currentTime;
    baseFreqs.forEach((freq, idx) => {
      const noteTime = now + idx * 0.055;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gainNode.gain.setValueAtTime(0.001, noteTime);
      gainNode.gain.exponentialRampToValueAtTime(0.18, noteTime + 0.008);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.35);

      osc.connect(gainNode);
      gainNode.connect(this.sfxGain!);

      osc.start(noteTime);
      osc.stop(noteTime + 0.36);
    });
  }

  /**
   * Resonant Angkor bronze temple gong for altar activation or stage start.
   * Fundamental ~110 Hz with rich metallic partials and long decay.
   */
  public playTempleGong(): void {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain) return;

    const now = ctx.currentTime;
    // Metallic partials: fundamental + non-harmonic overtones
    const partials = [
      { freq: 110, gain: 0.35, decay: 2.6 },
      { freq: 248, gain: 0.22, decay: 1.8 },
      { freq: 392, gain: 0.14, decay: 1.2 },
      { freq: 620, gain: 0.08, decay: 0.7 },
    ];

    partials.forEach(({ freq, gain, decay }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.exponentialRampToValueAtTime(gain, now + 0.015);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + decay);

      osc.connect(gainNode);
      gainNode.connect(this.sfxGain!);

      osc.start(now);
      osc.stop(now + decay);
    });
  }

  /**
   * Triumphant stage completion fanfare.
   */
  public playStageVictory(): void {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain) return;

    const now = ctx.currentTime;
    const notes = [
      { freq: 440, delay: 0 },
      { freq: 523.25, delay: 0.08 },
      { freq: 659.25, delay: 0.16 },
      { freq: 880, delay: 0.24 },
      { freq: 1046.5, delay: 0.32 },
    ];

    notes.forEach(({ freq, delay }) => {
      const noteTime = now + delay;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gainNode.gain.setValueAtTime(0.001, noteTime);
      gainNode.gain.exponentialRampToValueAtTime(0.22, noteTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.6);

      osc.connect(gainNode);
      gainNode.connect(this.sfxGain!);

      osc.start(noteTime);
      osc.stop(noteTime + 0.62);
    });
  }

  /**
   * Subtle stone/gravel footstep tap when moving in 3D courtyard.
   */
  public playFootstep(isSprinting = false): void {
    if (!this.enabled) return;
    const now = performance.now();
    const interval = isSprinting ? 270 : 420;
    if (now - this.lastFootstepTime < interval) return;
    this.lastFootstepTime = now;

    const ctx = this.initContext();
    if (!ctx || !this.sfxGain) return;

    const audioNow = ctx.currentTime;
    // Low-pass filtered noise burst
    const bufferSize = ctx.sampleRate * 0.04;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isSprinting ? 950 : 700, audioNow);

    const gainNode = ctx.createGain();
    const vol = isSprinting ? 0.06 : 0.04;
    gainNode.gain.setValueAtTime(vol, audioNow);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioNow + 0.04);

    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.sfxGain);

    whiteNoise.start(audioNow);
    whiteNoise.stop(audioNow + 0.045);
  }

  /**
   * Ancient mechanism activation: stone friction, deep resonant rumble and subtle harmonic release.
   */
  public playMechanismActivation(): void {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain) return;

    const now = ctx.currentTime;
    // Deep stone rumble oscillator
    const rumble = ctx.createOscillator();
    const rumbleGain = ctx.createGain();
    rumble.type = 'sawtooth';
    rumble.frequency.setValueAtTime(65, now);
    rumble.frequency.exponentialRampToValueAtTime(45, now + 0.7);

    // Low-pass filter to make it sound like ancient heavy granite
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, now);

    rumbleGain.gain.setValueAtTime(0.001, now);
    rumbleGain.gain.exponentialRampToValueAtTime(0.28, now + 0.08);
    rumbleGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

    rumble.connect(filter);
    filter.connect(rumbleGain);
    rumbleGain.connect(this.sfxGain);

    rumble.start(now);
    rumble.stop(now + 0.72);

    // Harmonic chime accent
    const chime = ctx.createOscillator();
    const chimeGain = ctx.createGain();
    chime.type = 'triangle';
    chime.frequency.setValueAtTime(587.33, now + 0.15); // D5
    chimeGain.gain.setValueAtTime(0.001, now + 0.15);
    chimeGain.gain.exponentialRampToValueAtTime(0.18, now + 0.18);
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

    chime.connect(chimeGain);
    chimeGain.connect(this.sfxGain);

    chime.start(now + 0.15);
    chime.stop(now + 0.66);
  }

  /**
   * Crystalline shield shatter sound: explosive crackle followed by descending glass sparkle.
   */
  public playShieldShatter(): void {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain) return;

    const now = ctx.currentTime;
    // Impact crack
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);

    oscGain.gain.setValueAtTime(0.22, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(oscGain);
    oscGain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.15);

    // High crystalline shards
    const shardFreqs = [1200, 1550, 1820, 2200];
    shardFreqs.forEach((freq, idx) => {
      const shardOsc = ctx.createOscillator();
      const shardGain = ctx.createGain();
      const st = now + idx * 0.03;

      shardOsc.type = 'sine';
      shardOsc.frequency.setValueAtTime(freq, st);
      shardOsc.frequency.exponentialRampToValueAtTime(freq * 0.5, st + 0.3);

      shardGain.gain.setValueAtTime(0.001, st);
      shardGain.gain.exponentialRampToValueAtTime(0.12, st + 0.01);
      shardGain.gain.exponentialRampToValueAtTime(0.0001, st + 0.35);

      shardOsc.connect(shardGain);
      shardGain.connect(this.sfxGain!);
      shardOsc.start(st);
      shardOsc.stop(st + 0.36);
    });
  }

  /**
   * Boss awakening sound: rising low brass drone with energy swell.
   */
  public playBossAwaken(): void {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(55, now); // A1
    osc.frequency.exponentialRampToValueAtTime(110, now + 1.2);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(180, now);
    filter.frequency.exponentialRampToValueAtTime(800, now + 1.2);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.3, now + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 1.55);
  }
}

export const gameAudio = new GameAudioManager();
