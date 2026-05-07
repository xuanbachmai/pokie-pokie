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
  private bgrTimer:  ReturnType<typeof setInterval> | null = null;
  private bgrStep   = 0;
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

    // Chrome / Safari create contexts in 'suspended' — force-resume right away
    this.ctx.resume();
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
  // Sáo trúc (Vietnamese bamboo flute) leads an addictive folk groove.
  // 2 bars of 16 steps at 132 BPM — flute on EVERY step for non-stop melody,
  // pluck ornaments on off-beats, light drum/hi-hat pulse underneath.
  startSpinLoop() {
    if (this.spinTimer) return;
    if (!this.ctx || this._muted) return;
    if (this.ctx.state !== 'running') this.ctx.resume();

    const BPM    = 132;
    const EIGHTH = (60 / BPM) / 2 * 1000; // ms per 8th note (~227 ms)

    // Flute melody — full 16-step pattern, lively pentatonic phrase
    // Indices into P[]: 5=C4 6=D4 7=E4 8=G4 9=A4 10=C5 11=D5 12=E5 13=G5
    const FLT_IDX = [10, 12, 13, 12, 10,  9,  8,  9, 10, 12, 10,  9,  8,  7,  8, 10];
    // Flute note duration (as fraction of step): longer = smoother legato
    const FLT_DUR = [0.9, 0.5, 0.9, 0.5, 0.9, 0.5, 0.9, 0.5, 0.9, 0.5, 0.9, 0.9, 0.9, 0.5, 0.9, 1.8];
    // Pluck ornaments on even steps (đàn tranh texture)
    const PLK_IDX = [5, -1, 7, -1, 8, -1, 5, -1, 6, -1, 8, -1, 7, -1, 6, -1];
    // Drum: 1=kick, 2=snare, 3=both (on strong beats)
    const DRM     = [1,  0,  0,  2,  0,  0,  1,  0,  1,  0,  0,  2,  0,  0,  1,  0];

    this.spinStep = 0;
    this.spinTimer = setInterval(() => {
      if (!this.ctx || this._muted) return;
      const t = this.ctx.currentTime + 0.015;
      const s = this.spinStep % 16;
      const stepSec = EIGHTH / 1000;

      // Flute — every step, varying duration for expressiveness
      flute(this.ctx, this.revOut, P[FLT_IDX[s]], t, stepSec * FLT_DUR[s], 0.22);

      // Pluck ornament
      if (PLK_IDX[s] >= 0) pluck(this.ctx, this.out, P[PLK_IDX[s]], t, 0.10, 0.28);

      // Drum + hi-hat
      if (DRM[s] === 1 || DRM[s] === 3) drum(this.ctx, this.out, t, 68, 0.30);
      if (DRM[s] === 2 || DRM[s] === 3) drum(this.ctx, this.out, t, 120, 0.18);
      // Hi-hat on every step — light, driving
      hihat(this.ctx, this.out, t, s % 2 === 0 ? 0.07 : 0.04);

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
    if (this.ctx.state !== 'running') this.ctx.resume();
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

  // ── DIAMOND BUFFALO APPEARANCE — KA-BOOM surprise drop ───────────────────
  playDiamondBuffalo() {
    if (!this.ctx || this._muted) return;
    const t = this.ctx.currentTime + 0.01;

    // ── 1) "KA" — sharp high crack (filtered noise burst) ─────────────────
    const crackLen = Math.ceil(this.ctx.sampleRate * 0.08);
    const crackBuf = this.ctx.createBuffer(1, crackLen, this.ctx.sampleRate);
    const crackData = crackBuf.getChannelData(0);
    for (let i = 0; i < crackLen; i++) crackData[i] = (Math.random() * 2 - 1);
    const crackSrc  = this.ctx.createBufferSource();
    crackSrc.buffer = crackBuf;
    const crackHp   = this.ctx.createBiquadFilter();
    crackHp.type = 'highpass'; crackHp.frequency.value = 4000;
    const crackGain = this.ctx.createGain();
    crackGain.gain.setValueAtTime(1.2, t);
    crackGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    crackSrc.connect(crackHp); crackHp.connect(crackGain); crackGain.connect(this.out!);
    crackSrc.start(t);

    // ── 2) "BOOM" — massive sub-bass thud ─────────────────────────────────
    // Layer 1: punchy kick — pitch drops fast from 180 → 40 Hz
    const kick  = this.ctx.createOscillator();
    const kickG = this.ctx.createGain();
    kick.type = 'sine';
    kick.frequency.setValueAtTime(180, t);
    kick.frequency.exponentialRampToValueAtTime(40, t + 0.18);
    kickG.gain.setValueAtTime(1.0, t);
    kickG.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
    kick.connect(kickG); kickG.connect(this.out!);
    kick.start(t); kick.stop(t + 0.6);

    // Layer 2: sub-bass body — very low sine, adds the chest-felt "oomph"
    const sub  = this.ctx.createOscillator();
    const subG = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(60, t);
    sub.frequency.exponentialRampToValueAtTime(28, t + 0.4);
    subG.gain.setValueAtTime(0.85, t);
    subG.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    sub.connect(subG); subG.connect(this.out!);
    sub.start(t); sub.stop(t + 0.55);

    // Layer 3: distorted mid punch — sawtooth for gritty impact texture
    const mid  = this.ctx.createOscillator();
    const midDist = this.ctx.createWaveShaper();
    const midG = this.ctx.createGain();
    mid.type = 'sawtooth';
    mid.frequency.setValueAtTime(120, t);
    mid.frequency.exponentialRampToValueAtTime(55, t + 0.12);
    // Soft clip waveshaper
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) { const x = (i * 2) / 256 - 1; curve[i] = Math.tanh(x * 3); }
    midDist.curve = curve;
    midG.gain.setValueAtTime(0.45, t);
    midG.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    mid.connect(midDist); midDist.connect(midG); midG.connect(this.out!);
    mid.start(t); mid.stop(t + 0.2);

    // ── 3) Whoosh before impact (tiny pre-delay so it feels like a drop) ──
    const whooshLen = Math.ceil(this.ctx.sampleRate * 0.12);
    const whooshBuf = this.ctx.createBuffer(1, whooshLen, this.ctx.sampleRate);
    const whooshData = whooshBuf.getChannelData(0);
    for (let i = 0; i < whooshLen; i++) whooshData[i] = (Math.random() * 2 - 1);
    const whooshSrc  = this.ctx.createBufferSource();
    whooshSrc.buffer = whooshBuf;
    const whooshLp   = this.ctx.createBiquadFilter();
    whooshLp.type = 'bandpass'; whooshLp.frequency.value = 1200; whooshLp.Q.value = 1.5;
    const whooshGain = this.ctx.createGain();
    whooshGain.gain.setValueAtTime(0.0, t);
    whooshGain.gain.linearRampToValueAtTime(0.6, t + 0.05);
    whooshGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    whooshSrc.connect(whooshLp); whooshLp.connect(whooshGain); whooshGain.connect(this.revOut!);
    whooshSrc.start(t);

    // ── 4) Glittery sparkle tail — ascending shimmer after the boom ────────
    [C5, E5, G5, A5, P[15]].forEach((freq, i) => {
      const osc  = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, t + 0.08 + i * 0.07);
      gain.gain.linearRampToValueAtTime(0.28, t + 0.10 + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45 + i * 0.07);
      osc.connect(gain); gain.connect(this.revOut!);
      osc.start(t + 0.08 + i * 0.07);
      osc.stop(t + 0.5 + i * 0.07);
    });

    // ── 5) Rapid hi-hat scatter — sells the "explosive" feel ──────────────
    [0.01, 0.04, 0.07, 0.12, 0.18, 0.26].forEach(dt =>
      hihat(this.ctx!, this.out!, t + dt, 0.15 - dt * 0.3, 0.025)
    );
  }

  // ── SCATTER ANTICIPATION ──────────────────────────────────────────────────
  // Triggered when 2 scatters land — building tension before 3rd reel stops
  // Rising flute trill + accelerating drum roll + shimmering tremolo
  playScatterAnticipation() {
    if (!this.ctx || this._muted) return;
    const t = this.ctx.currentTime + 0.02;

    // Accelerating drum roll — 16 hits getting faster
    for (let i = 0; i < 16; i++) {
      const gap = 0.14 - i * 0.007; // 140ms → 42ms
      drum(this.ctx!, this.out!, t + i * (gap + 0.004), 90 + i * 3, 0.25 + i * 0.015);
    }

    // Rising flute trill — pentatonic run upward
    [C4, D4, E4, G4, A4, C5, D5, E5, G5].forEach((freq, i) => {
      flute(this.ctx!, this.revOut!, freq, t + i * 0.13, 0.4, 0.10 + i * 0.01);
    });

    // Tremolo shimmer — two detuned sines that pulse
    [C5, C5 * 1.003].forEach(freq => {
      const osc = this.ctx!.createOscillator();
      const lfo = this.ctx!.createOscillator();
      const lfoG = this.ctx!.createGain();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      lfo.type = 'sine';
      lfo.frequency.value = 8; // 8 Hz tremolo
      lfoG.gain.value = 0.18;
      lfo.connect(lfoG); lfoG.connect(gain.gain);
      gain.gain.setValueAtTime(0.12, t + 0.3);
      gain.gain.linearRampToValueAtTime(0.28, t + 1.6);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.1);
      osc.connect(gain); gain.connect(this.revOut!);
      lfo.start(t + 0.3); osc.start(t + 0.3);
      lfo.stop(t + 2.2); osc.stop(t + 2.2);
    });

    // Final hi-hat burst
    for (let i = 0; i < 8; i++) {
      hihat(this.ctx!, this.out!, t + 1.6 + i * 0.05, 0.10 + i * 0.012, 0.02);
    }
  }

  // ── BUFFALO ANTICIPATION ──────────────────────────────────────────────────
  // Triggered when 5+ buffalo on first 4 reels — stampede building
  // Heavy tom rolls + deep rumble + buffalo war-drum feel
  playBuffaloAnticipation() {
    if (!this.ctx || this._muted) return;
    const t = this.ctx.currentTime + 0.02;

    // Deep sub-bass rumble — low sine sweep
    const sub = this.ctx.createOscillator();
    const subG = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(40, t);
    sub.frequency.exponentialRampToValueAtTime(28, t + 2.0);
    subG.gain.setValueAtTime(0.0, t);
    subG.gain.linearRampToValueAtTime(0.55, t + 0.3);
    subG.gain.setValueAtTime(0.55, t + 1.6);
    subG.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
    sub.connect(subG); subG.connect(this.out!);
    sub.start(t); sub.stop(t + 2.3);

    // Stampede drum pattern — 3 layers, escalating
    const hits = [0, 0.10, 0.18, 0.26, 0.32, 0.38, 0.43, 0.47, 0.51, 0.54, 0.57, 0.59, 0.61, 0.63, 0.64, 0.65];
    hits.forEach((dt, i) => {
      const pitch = 55 + i * 4;
      drum(this.ctx!, this.out!, t + dt, pitch, 0.30 + i * 0.025);
      if (i > 6) drum(this.ctx!, this.out!, t + dt + 0.02, pitch * 0.7, 0.18); // double-hit
    });

    // Tom accent hits — heavy downbeats
    [0, 0.4, 0.7, 1.0, 1.25, 1.45, 1.6].forEach((dt, i) => {
      drum(this.ctx!, this.out!, t + dt, 65 + i * 6, 0.45 + i * 0.04);
      hihat(this.ctx!, this.out!, t + dt + 0.01, 0.08, 0.015);
    });

    // Low bau drone — ominous undertone
    bau(this.ctx, this.revOut!, C3, t, 2.0, 0.18);
    bau(this.ctx, this.revOut!, G3 * 0.5, t + 0.5, 1.5, 0.12);

    // Pentatonic war-drum melody — quick low plucks
    [C3 * 2, G3, C3 * 2, A3, G3].forEach((freq, i) => {
      pluck(this.ctx!, this.out!, freq, t + 0.6 + i * 0.22, 0.35, 0.5);
    });
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

  // ── OUT-OF-CREDIT ERROR ───────────────────────────────────────────────────
  // Short descending buzz — "nope, can't spin"
  playInsufficientFunds() {
    if (!this.ctx || this._muted) return;
    const t = this.ctx.currentTime + 0.01;

    // Descending saw buzz — three dropping tones
    [220, 185, 155].forEach((freq, i) => {
      const osc  = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.28, t + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.07 + 0.12);
      osc.connect(gain); gain.connect(this.out!);
      osc.start(t + i * 0.07); osc.stop(t + i * 0.07 + 0.15);
    });

    // Dull low thud
    drum(this.ctx, this.out, t, 38, 0.40);
  }

  // ── TIẾN LÊN FANFARE ─────────────────────────────────────────────────────
  // Festive ascending Vietnamese melody — announces the Diamond Rush feature
  playTienLenFanfare() {
    if (!this.ctx || this._muted) return;
    const t = this.ctx.currentTime + 0.05;

    // Rising pentatonic phrase: C4→E4→G4→C5→E5→G5 with tranh plucks
    const melody = [C4, E4, G4, C5, E5, G5];
    melody.forEach((freq, i) => {
      pluck(this.ctx!, this.out!, freq, t + i * 0.15, 0.30, 0.6);
    });

    // Harmonising flute a 5th above: G4→B4→D5→G5 (using closest pentatonic)
    const harmony = [G4, A4, D5, G5];
    harmony.forEach((freq, i) => {
      flute(this.ctx!, this.out!, freq, t + i * 0.22 + 0.08, 0.28, 0.11);
    });

    // Festive drum pattern: accent beats 1 & 3
    drum(this.ctx, this.out, t,                 72, 0.55);
    drum(this.ctx, this.out, t + 0.30,           60, 0.35);
    drum(this.ctx, this.out, t + 0.60,           72, 0.55);
    drum(this.ctx, this.out, t + 0.90,           60, 0.35);

    // Final flourish: rapid ascending run C5→D5→E5→G5→C6
    [C5, D5, E5, G5, P[15]].forEach((freq, i) => {
      pluck(this.ctx!, this.out!, freq, t + 1.0 + i * 0.08, 0.22, 0.5);
    });

    // Sparkle shimmer on top
    for (let i = 0; i < 8; i++) {
      const shFreq = G5 * (1 + i * 0.18);
      const osc  = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = shFreq;
      gain.gain.setValueAtTime(0.0, t + 0.95 + i * 0.05);
      gain.gain.linearRampToValueAtTime(0.06, t + 0.97 + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.02 + i * 0.05);
      osc.connect(gain); gain.connect(this.out!);
      osc.start(t + 0.95 + i * 0.05); osc.stop(t + 1.1 + i * 0.05);
    }
  }

  // ── DIAMOND RUSH SPIN SOUND ───────────────────────────────────────────────
  // Single short crystalline spin sound for the 1-line Diamond Rush reels
  playDiamondSpin() {
    if (!this.ctx || this._muted) return;
    const t = this.ctx.currentTime + 0.01;

    // Crystal chime — high-pitched triangle wave
    [C5 * 2, E5 * 2, G5 * 2].forEach((freq, i) => {
      const osc  = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq * 1.5, t + i * 0.06);
      osc.frequency.exponentialRampToValueAtTime(freq, t + i * 0.06 + 0.25);
      gain.gain.setValueAtTime(0.14, t + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.06 + 0.35);
      osc.connect(gain); gain.connect(this.out!);
      osc.start(t + i * 0.06); osc.stop(t + i * 0.06 + 0.38);
    });
  }

  // ── DIAMOND WIN SOUND ─────────────────────────────────────────────────────
  playDiamondWin(tier: 'small' | 'big' | 'jackpot') {
    if (!this.ctx || this._muted) return;
    const t = this.ctx.currentTime + 0.01;

    if (tier === 'jackpot') {
      this.playTienLenFanfare();
      return;
    }
    if (tier === 'big') {
      [G4, C5, E5, G5, P[15]].forEach((f, i) => pluck(this.ctx!, this.out!, f, t + i * 0.12, 0.28, 0.7));
      drum(this.ctx, this.out, t, 70, 0.50);
    } else {
      pluck(this.ctx!, this.out!, E5, t, 0.22, 0.55);
      pluck(this.ctx!, this.out!, G5, t + 0.10, 0.18, 0.45);
    }
  }

  // ── FEATURE BACKGROUND MUSIC ─────────────────────────────────────────────
  // Two modes: 'rush' (Buffalo Rush) and 'tienlen' (Tiến Lên feature)
  startFeatureBG(mode: 'rush' | 'tienlen') {
    this.stopFeatureBG();
    if (!this.ctx || this._muted) return;
    if (this.ctx.state !== 'running') this.ctx.resume();

    if (mode === 'rush') {
      // ── BUFFALO RUSH: heavy war-drum stampede ─────────────────────────────
      // 96 BPM = ~156ms per 16th note. Deep, driving, tribal.
      const BPM    = 96;
      const SIXTEENTH = ((60 / BPM) / 4) * 1000;

      // 16-step patterns  (1 = hit)
      // Kick: heavy 4-on-floor with double-kick fills on beats 2 & 4
      const KICK  = [1,0,1,0, 1,0,1,1, 1,0,1,0, 1,0,1,1];
      // Snare: on 2 and 4 (steps 4 and 12)
      const SNARE = [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0];
      // Hi-hat: every 16th
      const HIHAT = [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1];
      // Bass melody: low stompy pentatonic riff (C3 G3 A3 range)
      const BASS  = [C3,0,0,0, G3,0,0,0, A3,0,G3,0, C3,0,0,0];
      // Pluck accent: every 4 steps, higher register
      const PLK   = [-1,-1,G3*2,-1, -1,-1,C4,-1, -1,-1,A3,-1, -1,-1,G3*2,-1];

      this.bgrStep = 0;
      this.bgrTimer = setInterval(() => {
        if (!this.ctx || this._muted) return;
        const t = this.ctx.currentTime + 0.012;
        const s = this.bgrStep % 16;

        if (KICK[s])  drum(this.ctx, this.out, t, s >= 7 && s <= 8 ? 52 : 44, 0.55);
        if (SNARE[s]) drum(this.ctx, this.out, t, 135, 0.40);
        hihat(this.ctx, this.out, t, s % 4 === 0 ? 0.09 : 0.04, 0.025);
        if (BASS[s])  pluck(this.ctx, this.out, BASS[s], t, 0.38, 1.1);
        if (PLK[s] > 0) pluck(this.ctx, this.revOut, PLK[s], t, 0.18, 0.55);

        // Extra sub-bass pulse every 4 steps (hoofbeat feel)
        if (s % 4 === 0) {
          const sub = this.ctx.createOscillator();
          const sg  = this.ctx.createGain();
          sub.type = 'sine';
          sub.frequency.setValueAtTime(36, t);
          sub.frequency.exponentialRampToValueAtTime(28, t + 0.12);
          sg.gain.setValueAtTime(0.35, t);
          sg.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
          sub.connect(sg); sg.connect(this.out);
          sub.start(t); sub.stop(t + 0.2);
        }

        this.bgrStep++;
      }, SIXTEENTH);

    } else {
      // ── TIẾN LÊN: revolutionary march — bold, triumphant ─────────────────
      // 110 BPM military march. Every 8th note step.
      const BPM   = 110;
      const EIGHTH = ((60 / BPM) / 2) * 1000;

      // 8-step patterns (one bar)
      const KICK  = [1,0,0,0, 1,0,0,0];
      const SNARE = [0,0,1,0, 0,0,1,0];   // snare on 3 and 7 (2 and 4 of march)
      // Trumpet-like melody: bold pentatonic phrases
      const TRUMP = [C4,E4,G4,C5, A4,G4,E4,G4];
      const TRVOL = [0.22,0.18,0.20,0.28, 0.18,0.14,0.16,0.20];

      this.bgrStep = 0;
      this.bgrTimer = setInterval(() => {
        if (!this.ctx || this._muted) return;
        const t = this.ctx.currentTime + 0.012;
        const s = this.bgrStep % 8;

        if (KICK[s])  drum(this.ctx, this.out, t, 55, 0.50);
        if (SNARE[s]) drum(this.ctx, this.out, t, 145, 0.42);
        // Hi-hat: strong beats only for march feel
        if (s % 2 === 0) hihat(this.ctx, this.out, t, 0.07, 0.03);

        // Trumpet-like tone: triangle osc + slight detune for brassy colour
        const trumpet = this.ctx.createOscillator();
        const tg      = this.ctx.createGain();
        trumpet.type = 'triangle';
        trumpet.frequency.value = TRUMP[s];
        tg.gain.setValueAtTime(0, t);
        tg.gain.linearRampToValueAtTime(TRVOL[s], t + 0.04);
        tg.gain.setValueAtTime(TRVOL[s] * 0.8, t + EIGHTH * 0.0007);
        tg.gain.linearRampToValueAtTime(0, t + EIGHTH * 0.0009);
        trumpet.connect(tg); tg.connect(this.revOut);
        trumpet.start(t); trumpet.stop(t + EIGHTH / 1000 + 0.05);

        // Bass pluck on beats 1 and 3
        if (s === 0 || s === 4) pluck(this.ctx, this.out, C3, t, 0.35, 1.0);
        if (s === 2 || s === 6) pluck(this.ctx, this.out, G3, t, 0.28, 0.8);

        // Occasional đàn bầu drone on bar start
        if (s === 0 && this.bgrStep % 16 === 0) {
          bau(this.ctx, this.revOut, C3, t, (EIGHTH * 8) / 1000, 0.10);
        }

        this.bgrStep++;
      }, EIGHTH);
    }
  }

  stopFeatureBG() {
    if (this.bgrTimer) {
      clearInterval(this.bgrTimer);
      this.bgrTimer = null;
    }
  }

  // ── "TIẾN LÊN" VOICE SHOUT ───────────────────────────────────────────────
  // Uses Web Speech API — speaks in Vietnamese with a deep, commanding pitch.
  // Falls back silently if SpeechSynthesis is unavailable.
  speakTienLen(repeat = 1) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const say = (text: string, delay: number) => {
      setTimeout(() => {
        const utt = new SpeechSynthesisUtterance(text);
        utt.lang   = 'vi-VN';
        utt.pitch  = 0.3;   // very deep, commanding male voice
        utt.rate   = 0.62;  // slow & dramatic
        utt.volume = 1.0;

        // Pick a male voice if available
        const voices = window.speechSynthesis.getVoices();
        const male   = voices.find(v =>
          v.lang.startsWith('vi') && /male|man/i.test(v.name)
        ) ?? voices.find(v => v.lang.startsWith('vi'));
        if (male) utt.voice = male;

        window.speechSynthesis.speak(utt);
      }, delay);
    };

    // First shout immediately, then repeat for drama
    say('Tiến Lên!', 0);
    for (let i = 1; i < repeat; i++) say('Tiến Lên!', i * 1400);
  }

  // ── WIN CELEBRATION FANFARES ─────────────────────────────────────────────
  // tier 'mega'  → JACKPOT slot prize hit (rising arpeggio + crash)
  // tier 'grand' → All 15 filled (massive chord + repeated trumpets)
  playCelebration(tier: 'mega' | 'grand') {
    if (!this.ctx || this._muted) return;
    const ac = this.ctx;
    const t  = ac.currentTime + 0.02;

    // Helper: play a tone through reverb
    const tone = (freq: number, vol: number, start: number, dur: number, type: OscillatorType = 'sine') => {
      const osc = ac.createOscillator();
      const g   = ac.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);
      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(vol, start + 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, start + dur);
      osc.connect(g);
      g.connect(this.revOut);
      osc.start(start);
      osc.stop(start + dur + 0.1);
    };

    // Helper: noise crash cymbal
    const crash = (start: number, vol: number, dur: number) => {
      const buf = ac.createBuffer(1, ac.sampleRate * dur, ac.sampleRate);
      const d   = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1);
      const src  = ac.createBufferSource();
      const filt = ac.createBiquadFilter();
      const g    = ac.createGain();
      src.buffer = buf;
      filt.type  = 'highpass';
      filt.frequency.value = 6000;
      g.gain.setValueAtTime(vol, start);
      g.gain.exponentialRampToValueAtTime(0.001, start + dur);
      src.connect(filt).connect(g).connect(ac.destination);
      src.start(start);
      src.stop(start + dur);
    };

    if (tier === 'mega') {
      // Rising C–E–G–C arpeggio, then crash
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
      notes.forEach((f, i) => tone(f, 0.28, t + i * 0.14, 1.0, 'triangle'));
      crash(t + 0.56, 0.25, 0.9);
      // Sub thump
      tone(80, 0.4, t, 0.4, 'sine');
    } else {
      // GRAND: full chord + 3 trumpet flourishes
      // Massive root chord
      [65.4, 130.8, 196, 261.6, 392, 523.25].forEach(f =>
        tone(f, 0.22, t, 2.5, 'sawtooth')
      );
      crash(t, 0.4, 2.0);
      // Three ascending trumpet-like sweeps
      const trumpetRun = (start: number) => {
        const run = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
        run.forEach((f, i) => tone(f, 0.32, start + i * 0.09, 0.6, 'sawtooth'));
      };
      trumpetRun(t + 0.1);
      trumpetRun(t + 0.8);
      trumpetRun(t + 1.5);
      // Deep bass bombs
      [t, t + 0.8, t + 1.6].forEach(s => {
        tone(40, 0.55, s, 0.5, 'sine');
        tone(55, 0.35, s + 0.05, 0.45, 'sine');
      });
      // Extra cymbal hits
      crash(t + 0.8, 0.3, 0.8);
      crash(t + 1.6, 0.35, 1.0);
    }
  }

  // ── UI ticks ──────────────────────────────────────────────────────────────
  playClick() {
    if (!this.ctx || this._muted) return;
    pluck(this.ctx, this.out, C5, this.ctx.currentTime + 0.01, 0.12, 0.15);
  }

  destroy() {
    this.stopSpinLoop();
    this.stopFeatureBG();
    if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
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
