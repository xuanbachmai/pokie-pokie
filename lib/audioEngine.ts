/**
 * audioEngine.ts
 * Vietnamese traditional music synthesizer — Masew / lo-fi style
 * Instruments: đàn tranh (plucked zither), sáo trúc (flute), trống (drum)
 * Scale: C major pentatonic (C D E G A) — used throughout Vietnamese folk music
 */

// ── Pentatonic frequencies (C D E G A, three octaves) ──────────────────────
export const P: number[] = [
  130.81, 146.83, 164.81, 196.00, 220.00,   // C3 D3 E3 G3 A3
  261.63, 293.66, 329.63, 392.00, 440.00,   // C4 D4 E4 G4 A4  ← main range
  523.25, 587.33, 659.25, 783.99, 880.00,   // C5 D5 E5 G5 A5
  1046.5, 1174.7, 1318.5,                   // C6 D6 E6
];
// Handy index aliases (C4 octave = base)
export const C4 = P[5], D4 = P[6], E4 = P[7], G4 = P[8], A4 = P[9];
export const C5 = P[10], D5 = P[11], E5 = P[12], G5 = P[13], A5 = P[14];
export const C3 = P[0], G3 = P[3], A3 = P[4];

// ── Primitive synthesis helpers ─────────────────────────────────────────────

/** đàn tranh pluck — sawtooth → bandpass → exponential decay */
function pluck(
  ctx: AudioContext, out: AudioNode,
  freq: number, t: number,
  vol = 0.28, decay = 0.7,
) {
  const osc  = ctx.createOscillator();
  const filt = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.value = freq;

  filt.type = 'bandpass';
  filt.frequency.value = freq * 1.9;
  filt.Q.value = 5;

  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + decay);

  osc.connect(filt); filt.connect(gain); gain.connect(out);
  osc.start(t); osc.stop(t + decay + 0.08);
}

/** sáo trúc flute — sine with 5.5 Hz vibrato, soft ADSR */
function flute(
  ctx: AudioContext, out: AudioNode,
  freq: number, t: number, dur: number,
  vol = 0.16,
) {
  const osc  = ctx.createOscillator();
  const vib  = ctx.createOscillator();
  const vibG = ctx.createGain();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.value = freq;
  vib.type = 'sine';
  vib.frequency.value = 5.5;
  vibG.gain.value = freq * 0.013;
  vib.connect(vibG); vibG.connect(osc.frequency);

  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(vol, t + 0.09);
  gain.gain.setValueAtTime(vol * 0.82, t + dur * 0.55);
  gain.gain.linearRampToValueAtTime(0, t + dur);

  osc.connect(gain); gain.connect(out);
  vib.start(t); osc.start(t);
  vib.stop(t + dur + 0.1); osc.stop(t + dur + 0.1);
}

/** đàn bầu drone — gentle monochord with slow vibrato */
function bau(
  ctx: AudioContext, out: AudioNode,
  freq: number, t: number, dur: number,
  vol = 0.1,
) {
  const osc  = ctx.createOscillator();
  const vib  = ctx.createOscillator();
  const vibG = ctx.createGain();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.value = freq;
  vib.type = 'sine';
  vib.frequency.value = 3.5;
  vibG.gain.value = freq * 0.008;
  vib.connect(vibG); vibG.connect(osc.frequency);

  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(vol, t + 0.2);
  gain.gain.setValueAtTime(vol * 0.7, t + dur - 0.3);
  gain.gain.linearRampToValueAtTime(0, t + dur);

  osc.connect(gain); gain.connect(out);
  vib.start(t); osc.start(t);
  vib.stop(t + dur + 0.1); osc.stop(t + dur + 0.1);
}

/** trống drum — pitched sine with pitch drop */
function drum(
  ctx: AudioContext, out: AudioNode,
  t: number, pitch = 78, vol = 0.42,
) {
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(pitch * 2.8, t);
  osc.frequency.exponentialRampToValueAtTime(pitch, t + 0.07);
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);

  osc.connect(gain); gain.connect(out);
  osc.start(t); osc.stop(t + 0.26);
}

/** hi-hat — filtered white noise burst */
function hihat(
  ctx: AudioContext, out: AudioNode,
  t: number, vol = 0.07, dur = 0.04,
) {
  const len = Math.ceil(ctx.sampleRate * (dur + 0.02));
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d   = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;

  const src  = ctx.createBufferSource();
  src.buffer = buf;
  const f    = ctx.createBiquadFilter();
  f.type = 'highpass'; f.frequency.value = 7000;
  const g    = ctx.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f); f.connect(g); g.connect(out);
  src.start(t);
}

/** Simple reverb — exponential-decay impulse response */
function makeReverb(ctx: AudioContext, secs = 1.8): ConvolverNode {
  const len = Math.ceil(ctx.sampleRate * secs);
  const ir  = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const ch = ir.getChannelData(c);
    for (let i = 0; i < len; i++)
      ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5);
  }
  const conv = ctx.createConvolver();
  conv.buffer = ir;
  return conv;
}

// ── GameAudio class ─────────────────────────────────────────────────────────

export class GameAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null  = null;
  private reverb: ConvolverNode | null = null;
  private dry:  GainNode | null    = null;
  private wet:  GainNode | null    = null;

  private spinTimer: ReturnType<typeof setInterval> | null = null;
  private spinStep  = 0;
  private _muted    = false;

  // ── Initialise audio context (must be called from a user gesture) ─────────
  init() {
    if (this.ctx) { this.ctx.resume(); return; }
    this.ctx   = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.55;
    this.master.connect(this.ctx.destination);

    // Reverb send chain: dry direct + wet through convolver
    this.reverb = makeReverb(this.ctx, 1.6);
    this.dry    = this.ctx.createGain();
    this.wet    = this.ctx.createGain();
    this.dry.gain.value = 1;
    this.wet.gain.value = 0.22;
    this.dry.connect(this.master);
    this.reverb.connect(this.wet);
    this.wet.connect(this.master);
  }

  private get out(): AudioNode { return this.dry!; }
  private get revOut(): AudioNode { return this.reverb!; }

  get ready() { return !!this.ctx; }

  resume() { this.ctx?.resume(); }

  setMuted(m: boolean) {
    this._muted = m;
    if (this.master) this.master.gain.value = m ? 0 : 0.55;
  }

  // ── SPIN LOOP ─────────────────────────────────────────────────────────────
  // 128 BPM rhythmic groove: đàn tranh melody + trống beat + hi-hats
  // Pattern repeats every 16 eighth-note steps (2 bars)
  startSpinLoop() {
    if (this.spinTimer) return;
    if (!this.ctx) return;

    const BPM   = 128;
    const EIGHTH = (60 / BPM) / 2 * 1000; // ms per 8th note

    // Melody pattern (P indices into global PENTA, -1 = rest)
    const MEL = [5, -1, 7, -1, 8, -1, 6, -1, 9, -1, 7, -1, 10, -1, 8, -1];
    // Drum pattern: 1=kick, 2=snare, 0=none
    const DRM = [1,  0,  0,  0,  2,  0,  0,  1,  1,  0,  0,  0,  2,  0,  0,  1];
    // Flute: plays long tones every 4 steps
    const FLT = [C4, 0,  0,  0,  G4, 0,  0,  0,  A4, 0,  0,  0,  C5, 0,  0,  0];

    this.spinStep = 0;
    this.spinTimer = setInterval(() => {
      if (!this.ctx || this._muted) return;
      const t = this.ctx.currentTime + 0.02;
      const s = this.spinStep % 16;

      if (MEL[s] >= 0) pluck(this.ctx, this.out, P[MEL[s]], t, 0.18, 0.35);
      if (DRM[s] === 1) drum(this.ctx, this.out, t, 72, 0.38);
      if (DRM[s] === 2) drum(this.ctx, this.out, t, 130, 0.22);
      hihat(this.ctx, this.out, t, 0.06);
      if (FLT[s]) flute(this.ctx, this.revOut, FLT[s] as number, t, EIGHTH * 3.8 / 1000, 0.14);

      this.spinStep++;
    }, EIGHTH);
  }

  stopSpinLoop() {
    if (this.spinTimer) {
      clearInterval(this.spinTimer);
      this.spinTimer = null;
    }
  }

  // ── WIN MELODY ────────────────────────────────────────────────────────────
  // Ascending pentatonic arpeggio; bigger win = more notes + flute harmony
  playWin(amount: number) {
    if (!this.ctx || this._muted) return;
    const now = this.ctx.currentTime + 0.05;

    const isSmall  = amount <= 2;
    const isMedium = amount > 2  && amount <= 20;
    const isBig    = amount > 20;

    const notes = isSmall
      ? [C4, E4, G4, C5]
      : isMedium
      ? [C4, E4, G4, A4, C5, E5]
      : [C4, E4, G4, A4, C5, D5, E5, G5];

    notes.forEach((freq, i) => {
      const t = now + i * 0.11;
      pluck(this.ctx!, this.out, freq, t, 0.32, 0.65);
      if (isMedium || isBig) {
        pluck(this.ctx!, this.out, freq * 2, t, 0.10, 0.4); // overtone shimmer
      }
    });

    if (isBig) {
      // Flute countermelody on 2nd pass
      [C4, G4, A4, C5, E5].forEach((freq, i) => {
        flute(this.ctx!, this.revOut, freq, now + i * 0.18, 0.55, 0.15);
      });
      // Triumphant drum hits
      [0, 0.33, 0.66, 1.0].forEach(dt => drum(this.ctx!, this.out, now + dt, 88, 0.35));
    }
  }

  // ── FREE SPINS TRIGGER ────────────────────────────────────────────────────
  // Celebratory fanfare: full melodic phrase + drums + flute harmony
  playFreeSpin() {
    if (!this.ctx || this._muted) return;
    const now = this.ctx.currentTime + 0.05;

    // Main đàn tranh melody — ascending then descending resolution
    const melody = [C4, D4, E4, G4, A4, C5, A4, G4, E4, G4, C5, E5];
    melody.forEach((freq, i) => {
      const t = now + i * 0.145;
      pluck(this.ctx!, this.out, freq, t, 0.36, 0.7);
    });

    // Flute counter-melody offset by half a step
    const fluteNotes = [C4, E4, G4, C5, G4, E5];
    fluteNotes.forEach((freq, i) => {
      flute(this.ctx!, this.revOut, freq, now + i * 0.29, 0.55, 0.18);
    });

    // Drum pattern: kick on 1 and 3, snare on 2 and 4
    [0, 0.29, 0.58, 0.87, 1.16, 1.45, 1.74].forEach((dt, i) => {
      if (i % 4 === 0 || i % 4 === 2) drum(this.ctx!, this.out, now + dt, 74, 0.40);
      else drum(this.ctx!, this.out, now + dt, 128, 0.25);
      hihat(this.ctx!, this.out, now + dt + 0.145, 0.07);
    });

    // Rising đàn bầu drone underneath
    bau(this.ctx, this.revOut, C3, now, 2.5, 0.12);
    bau(this.ctx, this.revOut, G3, now + 0.87, 2.0, 0.10);
  }

  // ── BUFFALO RUSH FANFARE ──────────────────────────────────────────────────
  // Deep, dramatic — lower register, heavy drums
  playBuffaloRush() {
    if (!this.ctx || this._muted) return;
    const now = this.ctx.currentTime + 0.05;

    const melody = [C3, G3, A3, C4, G3, C4, E4, G4, C5];
    melody.forEach((freq, i) => {
      const t = now + i * 0.17;
      pluck(this.ctx!, this.out, freq, t, 0.40, 0.9);
    });

    // Flute on the high end
    [C4, E4, G4, C5, E5].forEach((freq, i) => {
      flute(this.ctx!, this.revOut, freq, now + i * 0.34, 0.65, 0.17);
    });

    // Heavy trống drumroll
    [0, 0.17, 0.34, 0.51, 0.85, 1.02, 1.19, 1.53].forEach((dt, i) => {
      drum(this.ctx!, this.out, now + dt, i < 4 ? 65 : 80, 0.48);
    });

    bau(this.ctx, this.revOut, C3, now, 3.0, 0.14);
  }

  // ── JACKPOT FANFARE ───────────────────────────────────────────────────────
  // Grand — maximum density, two-octave run + sustained flute chord
  playJackpot() {
    if (!this.ctx || this._muted) return;
    const now = this.ctx.currentTime + 0.05;

    // Two-octave ascending run
    const run = [C3, E4, G4, C4, E4, G4, A4, C5, D5, E5, G5, A5, C5, E5, G5, A5];
    run.forEach((freq, i) => {
      const t = now + i * 0.08;
      pluck(this.ctx!, this.out, freq, t, 0.38, 0.9);
    });

    // Sustained flute chord: C E G  (three flutes in unison with slight detune)
    [[C4, C5], [E4, E5], [G4, G5]].forEach(([lo, hi], i) => {
      const t = now + i * 0.12;
      flute(this.ctx!, this.revOut, lo, t, 2.5, 0.18);
      flute(this.ctx!, this.revOut, hi, t + 0.06, 2.2, 0.14);
    });

    // Celebratory drum rolls
    for (let i = 0; i < 12; i++) {
      drum(this.ctx!, this.out, now + i * 0.12, 70 + i * 4, 0.45);
      hihat(this.ctx!, this.out, now + i * 0.12 + 0.06, 0.08);
    }

    bau(this.ctx, this.revOut, C3, now, 4.0, 0.15);
    bau(this.ctx, this.revOut, G3, now + 0.5, 3.5, 0.12);
  }

  // ── SOLFÈGE BUFFALO NOTES ─────────────────────────────────────────────────
  // Do Re Mi Fa Sol La Si — played as each reel stops on a buffalo
  // Marimba / xylophone tone: triangle osc + fast decay + slight reverb
  playBuffaloNote(step: number) {
    if (!this.ctx || this._muted) return;

    // Solfège scale: C5 D5 E5 F5 G5 A5 B5
    const NOTES = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77];
    const freq  = NOTES[Math.min(step, NOTES.length - 1)];
    const t     = this.ctx.currentTime + 0.02;

    // Main marimba hit — triangle osc with punchy envelope
    const osc  = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.55, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
    osc.connect(gain); gain.connect(this.out!);
    osc.start(t); osc.stop(t + 0.75);

    // Soft overtone — sine one octave up, quieter
    const osc2  = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.value = freq * 2;
    gain2.gain.setValueAtTime(0.18, t);
    gain2.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
    osc2.connect(gain2); gain2.connect(this.revOut!);
    osc2.start(t); osc2.stop(t + 0.4);
  }

  // ── DIAMOND BUFFALO APPEARANCE ────────────────────────────────────────────
  // Mystical shimmer + deep resonant tone — signals something special
  playDiamondBuffalo() {
    if (!this.ctx || this._muted) return;
    const t = this.ctx.currentTime + 0.02;

    // 1) Rising crystalline shimmer — two detuned sine harmonics
    const freqs = [C5 * 1.5, C5 * 1.502]; // near-unison detune = shimmer
    freqs.forEach(freq => {
      const osc  = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * 0.5, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 2, t + 0.6);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.22, t + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
      osc.connect(gain); gain.connect(this.revOut!);
      osc.start(t); osc.stop(t + 1.5);
    });

    // 2) Deep resonant buffalo "rumble" — low sine pulse
    const rumble = this.ctx.createOscillator();
    const rGain  = this.ctx.createGain();
    rumble.type = 'sine';
    rumble.frequency.setValueAtTime(55, t);
    rumble.frequency.exponentialRampToValueAtTime(40, t + 0.5);
    rGain.gain.setValueAtTime(0.45, t);
    rGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
    rumble.connect(rGain); rGain.connect(this.out!);
    rumble.start(t); rumble.stop(t + 0.6);

    // 3) Pentatonic "ding" trio — D5 G5 A5 (ascending, quick)
    [D5, G5, A5].forEach((freq, i) => {
      flute(this.ctx!, this.revOut!, freq, t + 0.05 + i * 0.13, 0.7, 0.20);
    });

    // 4) Sparkling hi-hat bursts
    [0, 0.08, 0.16, 0.28, 0.42].forEach(dt => hihat(this.ctx!, this.out!, t + dt, 0.10, 0.03));
  }

  // ── GAMBLE SOUNDS ─────────────────────────────────────────────────────────
  /** Card flip / reveal — short crisp pluck + tiny drum */
  playGambleFlip() {
    if (!this.ctx || this._muted) return;
    const t = this.ctx.currentTime + 0.02;
    pluck(this.ctx, this.out, A4, t, 0.22, 0.25);
    pluck(this.ctx, this.out, C5, t + 0.06, 0.15, 0.2);
    drum(this.ctx, this.out, t + 0.08, 100, 0.18);
  }

  /** Gamble win — bright ascending skip */
  playGambleWin() {
    if (!this.ctx || this._muted) return;
    const t = this.ctx.currentTime + 0.03;
    [E4, G4, A4, C5, E5].forEach((f, i) => {
      pluck(this.ctx!, this.out, f, t + i * 0.09, 0.30, 0.55);
    });
    flute(this.ctx, this.revOut, C5, t + 0.18, 0.8, 0.15);
    drum(this.ctx, this.out, t, 88, 0.30);
    drum(this.ctx, this.out, t + 0.36, 110, 0.22);
  }

  /** Gamble lose — descending minor feel, dull thud */
  playGambleLose() {
    if (!this.ctx || this._muted) return;
    const t = this.ctx.currentTime + 0.03;
    // Descending: A4 → G4 → E4 → C4
    [A4, G4, E4, C4].forEach((f, i) => {
      pluck(this.ctx!, this.out, f, t + i * 0.1, 0.28 - i * 0.04, 0.5);
    });
    // Low drum thud
    drum(this.ctx, this.out, t, 45, 0.50);
    drum(this.ctx, this.out, t + 0.2, 38, 0.35);
  }

  // ── UI ticks ──────────────────────────────────────────────────────────────
  playClick() {
    if (!this.ctx || this._muted) return;
    pluck(this.ctx, this.out, C5, this.ctx.currentTime + 0.01, 0.12, 0.15);
  }

  destroy() {
    this.stopSpinLoop();
    this.ctx?.close();
    this.ctx = null;
  }
}

// Singleton — shared across the app
let _instance: GameAudio | null = null;
export function getAudio(): GameAudio {
  if (!_instance) _instance = new GameAudio();
  return _instance;
}
