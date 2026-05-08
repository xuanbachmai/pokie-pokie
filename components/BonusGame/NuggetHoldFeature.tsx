'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { formatCredits } from '@/lib/utils';
import { useJackpotStore } from '@/store/jackpotStore';
import { JackpotTier, SymbolId } from '@/types/game';
import { SymbolSVG } from '@/components/Reels/SymbolSVG';
import { getAudio } from '@/lib/audioEngine';
import { trackJackpotWin, trackWin, trackFeature } from '@/lib/analytics';
import { winJackpotDB } from '@/lib/jackpotSync';
import { GRAND_JACKPOT_SEED } from '@/store/jackpotStore';
const MEGA_SEED = 5000;

// ── Slot value types ──────────────────────────────────────────────────────────
type SlotKind = 'credits' | 'MINI' | 'MINOR' | 'MAJOR' | 'GRAND' | 'DIAMOND';

interface SlotValue {
  kind: SlotKind;
  amount: number;
  label: string;
  color: string;
}

// ── Denom difficulty factor (harder jackpot hits at higher denoms) ─────────────
function denomDifficultyFactor(denom: number): number {
  return Math.max(0.25, 1 / (1 + Math.log10(Math.max(denom, 0.01) / 0.01) * 0.45));
}

// ── Prize tables ──────────────────────────────────────────────────────────────
function randomSlotValue(
  totalBet: number,
  denomination: number,
  miniCount: { current: number },
): SlotValue {
  const jackpots = useJackpotStore.getState().values;
  const f = denomDifficultyFactor(denomination);
  const r = Math.random();

  if (r < 0.002 * f) return { kind: 'GRAND', amount: jackpots[JackpotTier.GRAND], label: 'MEGA',  color: '#FF4D6D' };
  if (r < 0.010 * f) return { kind: 'MAJOR', amount: jackpots[JackpotTier.MAJOR], label: 'MINOR', color: '#FF8C00' };
  if (r < 0.040 * f) return { kind: 'MINOR', amount: jackpots[JackpotTier.MINOR], label: 'MAJOR', color: '#FFD700' };

  const miniThreshold = miniCount.current < 1
    ? Math.max(0.02, (0.10 - Math.log10(Math.max(denomination, 0.01)) * 0.04) * f)
    : 0;
  if (r < 0.040 * f + miniThreshold) {
    miniCount.current += 1;
    return { kind: 'MINI', amount: jackpots[JackpotTier.MINI], label: 'MINI', color: '#00D187' };
  }

  const minPrize  = Math.max(totalBet, denomination);
  const maxPrize  = parseFloat((totalBet * 20).toFixed(2));
  const mult      = [1, 1, 1, 2, 2, 3, 5][Math.floor(Math.random() * 7)];
  const rawAmount = parseFloat((totalBet * mult).toFixed(2));
  const amount    = Math.min(maxPrize, Math.max(minPrize, rawAmount));
  return { kind: 'credits', amount, label: formatCredits(amount), color: '#FFD700' };
}

function randomTienLenPrize(totalBet: number): SlotValue {
  const jackpots = useJackpotStore.getState().values;
  const r = Math.random();
  // Tiến Lên is a rare feature — each slot pays more generously
  if (r < 0.003) return { kind: 'GRAND', amount: jackpots[JackpotTier.GRAND], label: 'MEGA',  color: '#FF4D6D' };
  if (r < 0.012) return { kind: 'MAJOR', amount: jackpots[JackpotTier.MAJOR], label: 'MINOR', color: '#FF8C00' };
  if (r < 0.045) return { kind: 'MINOR', amount: jackpots[JackpotTier.MINOR], label: 'MAJOR', color: '#FFD700' };
  if (r < 0.150) return { kind: 'MINI',  amount: jackpots[JackpotTier.MINI],  label: 'MINI',  color: '#00D187' };
  // Credit prizes: boosted multipliers (avg ~18×) since full-line is hard to achieve
  const mult   = [5, 8, 12, 18, 28, 45][Math.floor(Math.random() * 6)];
  const amount = parseFloat((totalBet * mult).toFixed(2));
  return { kind: 'credits', amount, label: formatCredits(amount), color: '#00BFFF' };
}

function summaryLabel(slots: (SlotValue | null)[]): { text: string; color: string } {
  const filled = slots.filter(Boolean) as SlotValue[];
  if (filled.some(v => v.kind === 'GRAND'))  return { text: '🎉 MEGA JACKPOT! 🎉', color: '#FF4D6D' };
  if (filled.some(v => v.kind === 'MAJOR'))  return { text: 'MINOR JACKPOT HIT!',   color: '#FF8C00' };
  if (filled.some(v => v.kind === 'MINOR'))  return { text: 'MAJOR JACKPOT HIT!',   color: '#FFD700' };
  if (filled.some(v => v.kind === 'MINI'))   return { text: 'MINI JACKPOT HIT!',    color: '#00D187' };
  if (filled.some(v => v.kind === 'DIAMOND'))return { text: '💎 TIẾN LÊN WIN!',     color: '#00BFFF' };
  return { text: 'COLLECT YOUR WIN!', color: '#FFD700' };
}

// ── Tiến Lên state — manual spin mechanic ────────────────────────────────────
interface TienLenState {
  slotIdx:          number;
  prizes:           (SlotValue | null)[];
  reSpins:          number;
  phase:            'idle' | 'spinning' | 'done';
  spinningCols:     boolean[];
  newlyLanded:      Set<number>;
  grandJackpotBonus: number;   // set when all 5 columns are filled → Grand Jackpot
}

// Stagger delays per column (ms from spin start)
const COL_STOP_DELAYS = [600, 900, 1200, 1500, 1850];

// ── Tiến Lên spinning cell — diamond / gem themed reel ───────────────────────
const TIEN_STRIP = [
  SymbolId.SPECIAL, SymbolId.LOTUS,   SymbolId.SPECIAL,
  SymbolId.JADE,    SymbolId.SPECIAL,  SymbolId.COIN,
  SymbolId.SPECIAL, SymbolId.TIGER,   SymbolId.SPECIAL,
  SymbolId.DRAGON,  SymbolId.SPECIAL,  SymbolId.PANDA,
];

function TienLenSpinningCell({ spinning }: { spinning: boolean }) {
  const SYM_H = 72;
  return (
    <div style={{
      width: '100%', height: SYM_H, overflow: 'hidden',
      borderRadius: 14, position: 'relative',
      background: 'rgba(0,40,80,0.35)',
    }}>
      <motion.div
        style={{
          display: 'flex', flexDirection: 'column',
          filter: spinning ? 'blur(2px) brightness(1.3)' : 'none',
        }}
        animate={spinning ? { y: [0, -SYM_H * TIEN_STRIP.length] } : { y: 0 }}
        transition={spinning
          ? { duration: 0.32, repeat: Infinity, ease: 'linear' }
          : { duration: 0 }}
      >
        {[...TIEN_STRIP, ...TIEN_STRIP].map((sym, i) => (
          <div key={i} style={{
            height: SYM_H, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <SymbolSVG id={sym} size={54} />
          </div>
        ))}
      </motion.div>
      {/* Top / bottom fade */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 14,
        background: 'linear-gradient(to bottom, rgba(0,10,30,0.88) 0%, transparent 28%, transparent 72%, rgba(0,10,30,0.88) 100%)',
      }}/>
      {/* Cyan spin glow */}
      {spinning && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 14, pointerEvents: 'none',
          boxShadow: 'inset 0 0 14px rgba(0,191,255,0.4)',
        }}/>
      )}
    </div>
  );
}

// Symbols that cycle on the spinning strip — buffalo-heavy so it feels thematic
const SPIN_STRIP = [
  SymbolId.NUGGET,  SymbolId.JADE,    SymbolId.NUGGET,
  SymbolId.SPECIAL, SymbolId.LOTUS,   SymbolId.NUGGET,
  SymbolId.COIN,    SymbolId.NUGGET,  SymbolId.TIGER,
  SymbolId.NUGGET,  SymbolId.DRAGON,  SymbolId.NUGGET,
];

// ── Spinning reel cell — real vertical scroll strip ───────────────────────────
function SpinningCell({ spinning }: { spinning: boolean }) {
  const SYM_H = 64;

  return (
    <div style={{
      position: 'absolute', inset: 0, borderRadius: '50%',
      overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <motion.div
        style={{
          display: 'flex', flexDirection: 'column',
          filter: spinning ? 'blur(1.8px)' : 'none',
        }}
        animate={spinning ? { y: [0, -SYM_H * SPIN_STRIP.length] } : { y: 0 }}
        transition={spinning
          ? { duration: 0.38, repeat: Infinity, ease: 'linear' }
          : { duration: 0 }
        }
      >
        {[...SPIN_STRIP, ...SPIN_STRIP].map((sym, i) => (
          <div key={i} style={{
            height: SYM_H, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <SymbolSVG id={sym} size={52} />
          </div>
        ))}
      </motion.div>

      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%', pointerEvents: 'none',
        background: 'linear-gradient(to bottom, rgba(10,20,5,0.85) 0%, transparent 30%, transparent 70%, rgba(10,20,5,0.85) 100%)',
      }}/>
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%', pointerEvents: 'none',
        boxShadow: 'inset 0 0 16px rgba(200,140,40,0.45)',
      }}/>
    </div>
  );
}

// ── Firework burst (Grand Jackpot celebration) ─────────────────────────────────
const FW_COLORS = ['#FF4D6D','#FFD700','#00BFFF','#FF8C00','#A855F7','#22D3EE','#F97316','#FACC15'];
function FireworkBurst({ x, y, delay, size = 90 }: { x: string; y: string; delay: number; size?: number }) {
  const n = 14;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 0, height: 0, pointerEvents: 'none' }}>
      {Array.from({ length: n }, (_, i) => {
        const angle  = (i / n) * 2 * Math.PI;
        const spread = size + Math.random() * 40;
        const dx = Math.cos(angle) * spread;
        const dy = Math.sin(angle) * spread;
        const color = FW_COLORS[i % FW_COLORS.length];
        const sz  = 6 + Math.random() * 6;
        return (
          <motion.div
            key={i}
            style={{
              position: 'absolute', width: sz, height: sz,
              borderRadius: '50%', background: color,
              left: -sz / 2, top: -sz / 2,
              boxShadow: `0 0 6px ${color}`,
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1.5 }}
            animate={{ x: dx, y: dy, opacity: 0, scale: 0 }}
            transition={{ duration: 0.9 + Math.random() * 0.4, delay, ease: 'easeOut' }}
          />
        );
      })}
    </div>
  );
}

function GrandFireworks() {
  const bursts = [
    { x: '20%',  y: '18%', delay: 0,    size: 80  },
    { x: '75%',  y: '14%', delay: 0.15, size: 100 },
    { x: '50%',  y: '30%', delay: 0.3,  size: 120 },
    { x: '10%',  y: '50%', delay: 0.45, size: 90  },
    { x: '85%',  y: '45%', delay: 0.6,  size: 95  },
    { x: '35%',  y: '65%', delay: 0.75, size: 85  },
    { x: '65%',  y: '70%', delay: 0.9,  size: 110 },
    { x: '50%',  y: '80%', delay: 1.05, size: 100 },
  ];
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 40, overflow: 'hidden' }}>
      <motion.div
        style={{ position: 'absolute', inset: 0, background: 'rgba(255,220,50,0.55)' }}
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
      />
      {[0, 1.5, 3.0].map(wave =>
        bursts.map((b, i) => (
          <FireworkBurst key={`${wave}-${i}`} x={b.x} y={b.y} delay={wave + b.delay} size={b.size} />
        ))
      )}
      {Array.from({ length: 40 }, (_, i) => (
        <motion.div
          key={`conf-${i}`}
          style={{
            position: 'absolute',
            left: `${(i * 2.5) % 100}%`,
            top: '-10px',
            width: 8, height: 12,
            background: FW_COLORS[i % FW_COLORS.length],
            borderRadius: 2,
            rotate: Math.random() * 60 - 30,
          }}
          animate={{ y: ['0vh', '110vh'], rotate: [0, 720], opacity: [1, 0] }}
          transition={{
            duration: 2 + Math.random() * 1.5,
            delay: Math.random() * 2,
            ease: 'easeIn',
            repeat: 2,
          }}
        />
      ))}
    </div>
  );
}

function MegaCelebration({ color }: { color: string }) {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 38, overflow: 'hidden' }}>
      <motion.div
        style={{
          position: 'absolute', inset: 0,
          boxShadow: `inset 0 0 120px ${color}88`,
        }}
        animate={{ opacity: [0, 1, 0.4, 1, 0] }}
        transition={{ type: 'tween', duration: 1.8, ease: 'easeInOut' }}
      />
      {Array.from({ length: 24 }, (_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            left: `${(i * 4.2) % 100}%`,
            bottom: `${Math.random() * 30}%`,
            fontSize: 14 + Math.random() * 14,
          }}
          animate={{ y: [0, -(200 + Math.random() * 200)], opacity: [1, 0], rotate: [0, 360] }}
          transition={{
            duration: 1.2 + Math.random() * 0.8,
            delay: Math.random() * 0.6,
            ease: 'easeOut',
          }}
        >
          {['⭐', '🌟', '✨', '💫'][i % 4]}
        </motion.div>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function NuggetHoldFeature({ onClose }: { onClose: () => void }) {
  const resolveBonus    = useGameStore(s => s.resolveBonus);
  const nuggetHoldSeeds = useGameStore(s => s.nuggetHoldSeeds);
  const betPerLine      = useGameStore(s => s.betPerLine);
  const activeLines     = useGameStore(s => s.activeLines);
  const denomination    = useGameStore(s => s.denomination);
  const totalBet        = betPerLine * activeLines;

  const miniCountRef = useRef({ current: 0 });
  // Prevent double-triggering Grand Jackpot when tienLen already claimed it
  const grandAlreadyTriggered = useRef(false);

  const [slots, setSlots] = useState<(SlotValue | null)[]>(() =>
    nuggetHoldSeeds.map(seeded =>
      seeded ? randomSlotValue(totalBet, denomination, miniCountRef.current) : null
    )
  );

  const [reSpins, setReSpins]             = useState(3);
  const [rushPhase, setRushPhase]         = useState<'idle' | 'spinning' | 'done'>('idle');
  const [spinningCols, setSpinningCols]   = useState([false, false, false, false, false]);
  const [newlyLanded, setNewlyLanded]     = useState<Set<number>>(new Set());
  const [flashMultiplier, setFlashMultiplier] = useState<number | null>(null);
  const [totalPrize, setTotalPrize]       = useState(0);
  const [tienLen, setTienLen]             = useState<TienLenState | null>(null);
  const [isGrandJackpot, setIsGrandJackpot] = useState(false);

  const slotsRef         = useRef(slots);
  const reSpinsRef       = useRef(reSpins);
  const tienLenRef       = useRef(tienLen);
  const diamondLandedRef = useRef(false);
  slotsRef.current   = slots;
  reSpinsRef.current = reSpins;
  tienLenRef.current = tienLen;

  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clearTimers = useCallback(() => {
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];
  }, []);
  useEffect(() => () => clearTimers(), [clearTimers]);

  // ── Start Buffalo Rush background music on mount, stop on unmount ─────────
  useEffect(() => {
    const audio = getAudio();
    if (audio.ready) {
      audio.stopSpinLoop();
      audio.startFeatureBG('rush');
    }
    return () => { audio.stopFeatureBG(); };
  }, []);

  // ── Switch to Tiến Lên music + voice when diamond triggers ────────────────
  useEffect(() => {
    if (!tienLen) return;
    const audio = getAudio();
    if (audio.ready) {
      audio.stopFeatureBG();
      audio.startFeatureBG('tienlen');
      audio.speakTienLen(3);
    }
    return () => { if (!tienLen) audio.stopFeatureBG(); };
  }, [tienLen !== null]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Buffalo Rush SPIN handler ─────────────────────────────────────────────
  const handleSpin = useCallback(() => {
    if (rushPhase !== 'idle' || tienLen) return;
    clearTimers();

    setRushPhase('spinning');
    setNewlyLanded(new Set());
    setSpinningCols([true, true, true, true, true]);

    const currentSlots = [...slotsRef.current];
    const outcomes: (SlotValue | null | 'DIAMOND')[] = [];
    let diamondColIdx = -1;

    for (let col = 0; col < 5; col++) {
      const colFull = [0, 1, 2].every(row => currentSlots[row * 5 + col] !== null);
      if (colFull) { outcomes.push(null); continue; }

      const colOutcomes: Array<SlotValue | null | 'DIAMOND'> = [];
      for (let row = 0; row < 3; row++) {
        const idx = row * 5 + col;
        if (currentSlots[idx] !== null) { colOutcomes.push(null); continue; }
        if (Math.random() < 0.25) {
          if (diamondColIdx < 0 && !diamondLandedRef.current && Math.random() < 0.04) {
            colOutcomes.push('DIAMOND');
            diamondColIdx = col;
            diamondLandedRef.current = true;
          } else {
            colOutcomes.push(randomSlotValue(totalBet, denomination, miniCountRef.current));
          }
        } else {
          colOutcomes.push(null);
        }
      }
      outcomes.push(colOutcomes as unknown as SlotValue | null);
    }

    let totalNewCount = 0;
    let resolvedSlots = [...currentSlots];
    const landedIdxs  = new Set<number>();
    let triggeredDiamond = false;

    for (let col = 0; col < 5; col++) {
      const delay = COL_STOP_DELAYS[col];
      const t = setTimeout(() => {
        setSpinningCols(prev => {
          const next = [...prev];
          next[col] = false;
          return next;
        });

        const colOutcomes = outcomes[col];
        if (Array.isArray(colOutcomes)) {
          for (let row = 0; row < 3; row++) {
            const idx = row * 5 + col;
            const outcome = (colOutcomes as (SlotValue | null | 'DIAMOND')[])[row];
            if (outcome === 'DIAMOND') {
              resolvedSlots[idx] = { kind: 'DIAMOND', amount: 0, label: '💎', color: '#00BFFF' };
              landedIdxs.add(idx);
              totalNewCount++;
              triggeredDiamond = true;
              const audio = getAudio();
              if (audio.ready) audio.playDiamondBuffalo();
            } else if (outcome !== null) {
              resolvedSlots[idx] = outcome as SlotValue;
              landedIdxs.add(idx);
              totalNewCount++;
              const audio = getAudio();
              if (audio.ready) audio.playBuffaloNote(totalNewCount - 1);
            }
          }
          setSlots([...resolvedSlots]);
          setNewlyLanded(new Set(landedIdxs));
        }

        if (col === 4) {
          const t2 = setTimeout(() => {
            setNewlyLanded(new Set());

            if (triggeredDiamond) {
              if (totalNewCount > 1) {
                resolvedSlots = resolvedSlots.map((v, i) =>
                  v && !landedIdxs.has(i) && v.kind === 'credits'
                    ? { ...v, amount: parseFloat((v.amount * totalNewCount).toFixed(2)) }
                    : v
                );
                setSlots([...resolvedSlots]);
                setFlashMultiplier(totalNewCount);
                setTimeout(() => setFlashMultiplier(null), 900);
              }
              const dIdx = Array.from(landedIdxs).find(i => resolvedSlots[i]?.kind === 'DIAMOND') ?? 0;
              trackFeature('tien_len');
              setReSpins(3);
              setTienLen({
                slotIdx:           dIdx,
                prizes:            [null, null, null, null, null],
                reSpins:           3,
                phase:             'idle',
                spinningCols:      [false, false, false, false, false],
                newlyLanded:       new Set(),
                grandJackpotBonus: 0,
              });
              setRushPhase('idle');
              return;
            }

            if (totalNewCount > 0) {
              resolvedSlots = resolvedSlots.map((v, i) =>
                v && !landedIdxs.has(i) && v.kind === 'credits'
                  ? { ...v, amount: parseFloat((v.amount * totalNewCount).toFixed(2)) }
                  : v
              );
              setSlots([...resolvedSlots]);
              setFlashMultiplier(totalNewCount);
              setTimeout(() => setFlashMultiplier(null), 900);
            }

            const allFilled  = resolvedSlots.every(Boolean);
            const newReSpins = totalNewCount > 0 ? 3 : reSpinsRef.current - 1;

            if (newReSpins === 0 || allFilled) {
              let prize = resolvedSlots.reduce((sum, v) => sum + (v?.amount ?? 0), 0);
              if (allFilled) {
                // Only trigger Grand Jackpot once — tienLen may have already claimed it
                if (!grandAlreadyTriggered.current) {
                  const grandAmount = useJackpotStore.getState().triggerGrandJackpot();
                  winJackpotDB('grand', GRAND_JACKPOT_SEED).catch(() => {});
                  prize += grandAmount;
                  useJackpotStore.getState().setGrandJackpotTotal(parseFloat(prize.toFixed(2)));
                  trackJackpotWin('grand', parseFloat(prize.toFixed(2)));
                }
                setIsGrandJackpot(true);
                getAudio().playCelebration('grand');
              } else if (resolvedSlots.some(s => s && s.kind !== 'credits' && s.kind !== 'DIAMOND')) {
                getAudio().playCelebration('mega');
                // Track any tier jackpot wins; reset Mega in DB if won
                resolvedSlots.forEach(s => {
                  if (s && s.kind === 'GRAND') {
                    trackJackpotWin('mega', s.amount);
                    winJackpotDB('mega', MEGA_SEED).catch(() => {});
                  }
                  if (s && s.kind === 'MINOR') trackJackpotWin('minor', s.amount);
                  if (s && s.kind === 'MAJOR') trackJackpotWin('major', s.amount);
                  if (s && s.kind === 'MINI')  trackJackpotWin('mini', s.amount);
                });
              }
              trackWin(parseFloat(prize.toFixed(2)), 'bonus');
              setTotalPrize(parseFloat(prize.toFixed(2)));
              setRushPhase('done');
            } else {
              setReSpins(newReSpins);
              setRushPhase('idle');
            }
          }, 400);
          timerRefs.current.push(t2);
        }
      }, delay);
      timerRefs.current.push(t);
    }
  }, [rushPhase, tienLen, clearTimers, totalBet, denomination]);

  // ── Tiến Lên SPIN handler — manual spin mechanic ──────────────────────────
  const handleTienLenSpin = useCallback(() => {
    const tl = tienLenRef.current;
    if (!tl || tl.phase !== 'idle') return;
    clearTimers();

    // Mark all unfilled columns as spinning
    setTienLen(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        phase:        'spinning',
        spinningCols: prev.prizes.map(p => p === null),
        newlyLanded:  new Set(),
      };
    });

    // Pre-roll outcomes (20% hit chance per empty column — full-line is very rare)
    const currentPrizes = [...tl.prizes];
    const outcomes: (SlotValue | null)[] = currentPrizes.map(p =>
      p === null && Math.random() < 0.20 ? randomTienLenPrize(totalBet) : null
    );

    let totalNewCount = 0;
    const resolvedPrizes = [...currentPrizes];
    const landedIdxs = new Set<number>();

    for (let col = 0; col < 5; col++) {
      const delay = COL_STOP_DELAYS[col];
      const t = setTimeout(() => {
        // Stop this column's spin
        setTienLen(prev => {
          if (!prev) return prev;
          const spinningCols = [...prev.spinningCols];
          spinningCols[col] = false;
          return { ...prev, spinningCols };
        });

        // Apply outcome if this column won
        if (outcomes[col] !== null) {
          resolvedPrizes[col] = outcomes[col];
          landedIdxs.add(col);
          totalNewCount++;
          const audio = getAudio();
          if (audio.ready) audio.playBuffaloNote(totalNewCount - 1);
          setTienLen(prev => {
            if (!prev) return prev;
            const prizes = [...prev.prizes];
            prizes[col] = resolvedPrizes[col];
            return { ...prev, prizes, newlyLanded: new Set(landedIdxs) };
          });
        }

        // After last column — evaluate respins
        if (col === 4) {
          const t2 = setTimeout(() => {
            const newReSpins = totalNewCount > 0 ? 3 : (tienLenRef.current?.reSpins ?? 3) - 1;
            const allFilled  = resolvedPrizes.every(p => p !== null);

            if (newReSpins <= 0 || allFilled) {
              let grandBonus = 0;
              if (allFilled) {
                // All 5 columns filled → trigger Grand Jackpot!
                grandBonus = useJackpotStore.getState().triggerGrandJackpot();
                grandAlreadyTriggered.current = true;
                winJackpotDB('grand', GRAND_JACKPOT_SEED).catch(() => {});
                const tienLenTotal = resolvedPrizes.reduce((s, p) => s + (p?.amount ?? 0), 0);
                useJackpotStore.getState().setGrandJackpotTotal(
                  parseFloat((tienLenTotal + grandBonus).toFixed(2))
                );
                getAudio().playCelebration('grand');
                const fullTotal = resolvedPrizes.reduce((s, p) => s + (p?.amount ?? 0), 0) + grandBonus;
                trackJackpotWin('grand', parseFloat(fullTotal.toFixed(2)));
                trackWin(parseFloat(fullTotal.toFixed(2)), 'bonus');
              } else {
                const tienTotal = resolvedPrizes.reduce((s, p) => s + (p?.amount ?? 0), 0);
                if (tienTotal > 0) trackWin(parseFloat(tienTotal.toFixed(2)), 'bonus');
              }
              setTienLen(prev => {
                if (!prev) return prev;
                return {
                  ...prev,
                  phase:             'done',
                  reSpins:           Math.max(0, newReSpins),
                  newlyLanded:       new Set(),
                  grandJackpotBonus: grandBonus,
                };
              });
            } else {
              setTienLen(prev => {
                if (!prev) return prev;
                return { ...prev, phase: 'idle', reSpins: newReSpins, newlyLanded: new Set() };
              });
            }
          }, 400);
          timerRefs.current.push(t2);
        }
      }, delay);
      timerRefs.current.push(t);
    }
  }, [clearTimers, totalBet]);

  // Space bar triggers spin (Buffalo Rush or Tiến Lên depending on active state)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code === 'Space') {
        e.preventDefault();
        if (tienLenRef.current) handleTienLenSpin();
        else handleSpin();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleSpin, handleTienLenSpin]);

  function collectTienLen() {
    if (!tienLen || tienLen.phase !== 'done') return;
    const prizeTotal = tienLen.prizes.reduce((s, p) => s + (p?.amount ?? 0), 0);
    // Include Grand Jackpot bonus if all 5 were filled
    const total = parseFloat((prizeTotal + tienLen.grandJackpotBonus).toFixed(2));
    setSlots(prev => {
      const next = [...prev];
      const dIdx = Array.from({ length: 15 }, (_, k) => k).find(i => next[i]?.kind === 'DIAMOND') ?? tienLen.slotIdx;
      next[dIdx] = { kind: 'DIAMOND', amount: total, label: '💎', color: '#00BFFF' };
      return next;
    });
    setTienLen(null);
  }

  function handleCollect() {
    const audio = getAudio();
    audio.stopFeatureBG();
    if (typeof window !== 'undefined') window.speechSynthesis?.cancel();

    const filledCount = slots.filter(Boolean).length;
    // Grand jackpot and any tier jackpot wins skip gamble — credited directly
    const hasAnyJackpot = isGrandJackpot || slots.some(
      s => s && s.kind !== 'credits' && s.kind !== 'DIAMOND'
    );
    resolveBonus({ type: 'NUGGET_HOLD', count: filledCount, totalAmount: totalPrize, skipGamble: hasAnyJackpot });
    onClose();
  }

  const filledCount  = slots.filter(Boolean).length;
  const runningTotal = slots.reduce((s, v) => s + (v?.amount ?? 0), 0);
  const summary      = rushPhase === 'done' ? summaryLabel(slots) : null;
  const canSpin      = rushPhase === 'idle' && !tienLen;
  const canTienLenSpin = tienLen?.phase === 'idle';

  const hasJackpotPrize = rushPhase === 'done' && !isGrandJackpot &&
    slots.some(s => s && s.kind !== 'credits' && s.kind !== 'DIAMOND');

  return (
    <div className="relative flex flex-col items-center w-full h-full overflow-hidden"
      style={{ padding: '12px 10px 8px', gap: 6 }}>

      {/* ── Grand Jackpot fireworks ── */}
      {isGrandJackpot && rushPhase === 'done' && <GrandFireworks />}
      {/* ── Mega celebration ── */}
      {hasJackpotPrize && <MegaCelebration color={summaryLabel(slots).color} />}

      {/* ── Header ── */}
      <div className="text-center" style={{ flexShrink: 0 }}>
        <motion.div
          className="font-black"
          style={{
            fontSize: 26, color: '#D97706',
            textShadow: '0 0 20px rgba(217,119,6,0.6)',
            letterSpacing: '0.04em',
          }}
          animate={{ textShadow: ['0 0 14px rgba(255,140,0,0.4)', '0 0 32px rgba(255,140,0,0.9)', '0 0 14px rgba(255,140,0,0.4)'] }}
          transition={{ type: 'tween', duration: 2, repeat: Infinity }}
        >
          🐃 BUFFALO RUSH
        </motion.div>
        <div className="text-[11px] text-gray-400 tracking-widest">SPIN TO COLLECT</div>
      </div>

      {/* Re-spin counter + multiplier flash */}
      <div className="flex items-center justify-center gap-4" style={{ minHeight: 28, flexShrink: 0 }}>
        {rushPhase !== 'done' && !tienLen && (
          <div className="text-sm text-gray-300">
            SPINS LEFT: <span className="font-black text-yellow-400 text-xl">{reSpins}</span>
          </div>
        )}
        <AnimatePresence>
          {flashMultiplier && (
            <motion.div
              className="text-2xl font-black"
              style={{ color: '#FF4D6D', textShadow: '0 0 20px rgba(255,77,109,0.9)' }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1.25 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.3 }}
            >
              ×{flashMultiplier} MULTIPLIER!
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── 5×3 Buffalo grid ── */}
      <div className="grid grid-cols-5 w-full" style={{ gap: 8, flex: '1 1 auto', maxHeight: 320 }}>
        {slots.map((slot, idx) => {
          const col        = idx % 5;
          const isSpinning = spinningCols[col] && !slot;
          const isDiamond  = slot?.kind === 'DIAMOND';
          const color      = slot ? slot.color : 'rgba(255,255,255,0.08)';
          const isJackpot  = slot && slot.kind !== 'credits' && slot.kind !== 'DIAMOND';
          const svgId      = isDiamond ? SymbolId.SPECIAL : SymbolId.NUGGET;
          const isNew      = newlyLanded.has(idx);

          return (
            <motion.div
              key={idx}
              className="relative flex items-center justify-center"
              style={{
                aspectRatio: '1',
                borderRadius: '50%',
                background: slot
                  ? `radial-gradient(circle at 35% 35%, ${color}55, ${color}22 60%, ${color}0A)`
                  : isSpinning
                  ? 'radial-gradient(circle, rgba(139,94,60,0.35), rgba(80,40,10,0.25))'
                  : 'radial-gradient(circle, rgba(50,30,10,0.7), rgba(30,15,5,0.5))',
                border: `2px solid ${slot ? color : isSpinning ? 'rgba(200,140,40,0.4)' : 'rgba(255,200,80,0.10)'}`,
                boxShadow: slot
                  ? `0 0 ${isDiamond ? 22 : 14}px ${color}${isDiamond ? 'CC' : '88'}, inset 0 0 8px ${color}22`
                  : isSpinning ? '0 0 10px rgba(200,140,40,0.35)' : 'none',
              }}
              animate={isNew ? {
                scale: [1, 1.35, 1.0],
                boxShadow: [`0 0 0px ${color}00`, `0 0 40px ${color}FF`, `0 0 16px ${color}88`],
              } : isDiamond ? {
                boxShadow: ['0 0 12px #00BFFF66', '0 0 30px #00BFFFDD', '0 0 12px #00BFFF66'],
              } : {}}
              transition={{ type: 'tween', duration: isDiamond ? 1.6 : 0.4, repeat: isDiamond ? Infinity : 0, ease: 'easeInOut' }}
            >
              {slot ? (
                <>
                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: 0.18, overflow: 'hidden',
                  }}>
                    <SymbolSVG id={svgId} size={80} />
                  </div>
                  <div style={{
                    position: 'relative', zIndex: 1,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    textAlign: 'center', padding: '2px',
                  }}>
                    {(isJackpot || isDiamond) && (
                      <span style={{
                        fontSize: 10, fontWeight: 900, lineHeight: 1.1,
                        color: slot.color, textShadow: `0 0 8px ${slot.color}`,
                        letterSpacing: '0.05em', fontFamily: 'var(--font-jackpot)',
                      }}>
                        {slot.label}
                      </span>
                    )}
                    <span style={{
                      fontSize: isJackpot ? 11 : 13, fontWeight: 900, lineHeight: 1.15,
                      fontFamily: 'var(--font-amount)',
                      color: isJackpot || isDiamond ? slot.color : '#FFD700',
                      textShadow: `0 0 6px ${isJackpot || isDiamond ? slot.color : '#FFD700'}99`,
                    }}>
                      {formatCredits(slot.amount)}
                    </span>
                  </div>
                </>
              ) : isSpinning ? (
                <SpinningCell spinning />
              ) : (
                <div style={{ opacity: 0.10 }}>
                  <SymbolSVG id={SymbolId.NUGGET} size={52} />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Buffalo count + running total */}
      <div className="flex items-center gap-3 text-sm" style={{ flexShrink: 0 }}>
        <span className="text-gray-400">Buffaloes:</span>
        <span className="font-black text-amber-600 text-xl">{filledCount} / 15</span>
        {filledCount > 0 && (
          <>
            <span className="text-gray-600">·</span>
            <span className="text-gray-400">Total:</span>
            <span className="font-black text-yellow-300 text-lg">{formatCredits(runningTotal)}</span>
          </>
        )}
      </div>
      <div className="text-[10px] text-gray-600 text-center" style={{ flexShrink: 0 }}>
        Fill all 15 = 🏆 GRAND JACKPOT · 💎 Diamond = Tiến Lên Feature
      </div>

      {/* ── SPIN button (Buffalo Rush) ── */}
      {rushPhase !== 'done' && !tienLen && (
        <motion.button
          onClick={handleSpin}
          disabled={!canSpin}
          className="rounded-full font-black text-black disabled:opacity-40 flex flex-col items-center justify-center gap-1"
          style={{
            width: 96, height: 96, flexShrink: 0,
            background: canSpin ? 'linear-gradient(135deg, #FFD700, #FF8C00)' : '#555',
            fontSize: 32,
            boxShadow: canSpin ? '0 0 28px rgba(255,165,0,0.7), 0 4px 16px rgba(0,0,0,0.5)' : 'none',
          }}
          animate={canSpin ? {
            boxShadow: [
              '0 0 20px rgba(255,165,0,0.4)',
              '0 0 48px rgba(255,165,0,0.95)',
              '0 0 20px rgba(255,165,0,0.4)',
            ],
          } : {}}
          transition={{ type: 'tween', duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          whileTap={canSpin ? { scale: 0.88 } : {}}
        >
          <span>{rushPhase === 'spinning' ? '⏳' : '🎰'}</span>
          <span style={{ fontSize: 12, fontWeight: 900, letterSpacing: '0.1em' }}>SPIN</span>
        </motion.button>
      )}

      {/* ── Done result ── */}
      <AnimatePresence>
        {rushPhase === 'done' && summary && (
          <motion.div
            className="flex flex-col items-center w-full"
            style={{ gap: 10, flexShrink: 0, zIndex: 10, position: 'relative' }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          >
            {isGrandJackpot && (
              <motion.div
                className="text-center font-black"
                style={{
                  fontSize: 26, letterSpacing: '0.06em',
                  background: 'linear-gradient(90deg,#FF4D6D,#FFD700,#FF8C00,#FFD700,#FF4D6D)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 18px rgba(255,77,109,0.9))',
                }}
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ type: 'tween', duration: 2, repeat: Infinity }}
              >
                🏆 GRAND JACKPOT! 🏆
              </motion.div>
            )}
            <motion.div
              className="font-black text-center"
              style={{ fontSize: isGrandJackpot ? 18 : 22, color: summary.color, textShadow: `0 0 20px ${summary.color}BB` }}
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ type: 'tween', duration: 0.8, repeat: Infinity }}
            >
              {summary.text}
            </motion.div>
            <div className="text-gray-300 text-sm text-center">
              Total Prize:{' '}
              <span className="font-black text-yellow-400 text-2xl">{formatCredits(totalPrize)}</span>
            </div>
            <motion.button
              onClick={handleCollect}
              className="rounded-full font-black text-black text-base"
              style={{
                padding: '14px 40px',
                background: isGrandJackpot
                  ? 'linear-gradient(90deg,#FF4D6D,#FF8C00,#FFD700)'
                  : 'linear-gradient(90deg, #CC0000, #FF8C00)',
              }}
              whileTap={{ scale: 0.95 }}
              animate={{ boxShadow: ['0 0 12px rgba(204,0,0,0.4)', '0 0 36px rgba(255,80,0,0.9)', '0 0 12px rgba(204,0,0,0.4)'] }}
              transition={{ type: 'tween', duration: 1, repeat: Infinity, ease: 'easeInOut' }}
            >
              COLLECT {formatCredits(totalPrize)}!
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tiến Lên overlay ── */}
      <AnimatePresence>
        {tienLen && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-4 py-5"
            style={{
              background: 'linear-gradient(160deg, rgba(0,8,28,0.98), rgba(0,18,48,0.98))',
              backdropFilter: 'blur(8px)',
              zIndex: 20,
            }}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          >
            {/* ── Echo title ── */}
            <div className="relative flex items-center justify-center" style={{ height: 80 }}>
              <motion.div
                className="absolute font-black tracking-widest select-none"
                style={{ fontSize: 38, color: '#00BFFF', opacity: 0.12, letterSpacing: '0.18em' }}
                initial={{ scale: 2.4, opacity: 0 }}
                animate={{ scale: 1.15, opacity: 0.12 }}
                transition={{ delay: 0.05, duration: 0.45, ease: 'easeOut' }}
              >
                TIẾN LÊN
              </motion.div>
              <motion.div
                className="absolute font-black tracking-widest select-none"
                style={{ fontSize: 38, color: '#00BFFF', opacity: 0.28, letterSpacing: '0.12em' }}
                initial={{ scale: 1.8, opacity: 0 }}
                animate={{ scale: 1.07, opacity: 0.28 }}
                transition={{ delay: 0.12, duration: 0.42, ease: 'easeOut' }}
              >
                TIẾN LÊN
              </motion.div>
              <motion.div
                className="relative font-black tracking-widest"
                style={{ fontSize: 38, color: '#00EEFF', letterSpacing: '0.08em', zIndex: 1 }}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  textShadow: [
                    '0 0 12px rgba(0,220,255,0.6), 0 0 30px rgba(0,180,255,0.3)',
                    '0 0 22px rgba(0,240,255,1.0), 0 0 55px rgba(0,200,255,0.7)',
                    '0 0 12px rgba(0,220,255,0.6), 0 0 30px rgba(0,180,255,0.3)',
                  ],
                }}
                transition={{
                  scale:      { delay: 0.18, duration: 0.4, ease: [0.2, 1.4, 0.4, 1] },
                  opacity:    { delay: 0.18, duration: 0.3 },
                  textShadow: { type: 'tween', duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.6 },
                }}
              >
                💎 TIẾN LÊN
              </motion.div>
            </div>

            <motion.div
              className="text-[11px] text-gray-400 tracking-widest text-center -mt-2"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              DIAMOND BUFFALO FEATURE · 5 PRIZE LINES
            </motion.div>

            {/* Respin counter */}
            {tienLen.phase !== 'done' && (
              <div className="text-sm text-gray-300 -mt-2">
                SPINS LEFT: <span className="font-black text-cyan-400 text-xl">{tienLen.reSpins}</span>
              </div>
            )}

            {/* ── 5 prize columns ── */}
            <div className="grid grid-cols-5 gap-2 w-full">
              {tienLen.prizes.map((prize, i) => {
                const spinning  = tienLen.spinningCols[i];
                const isJackpot = prize && prize.kind !== 'credits' && prize.kind !== 'DIAMOND';
                const isNew     = tienLen.newlyLanded.has(i);
                return (
                  <motion.div
                    key={i}
                    className="flex flex-col items-center justify-center rounded-2xl overflow-hidden"
                    style={{
                      position: 'relative',
                      minHeight: 90,
                      background: prize
                        ? `radial-gradient(circle at 40% 30%, ${prize.color}30, ${prize.color}0A 70%)`
                        : 'rgba(0,50,100,0.25)',
                      border: `2px solid ${prize ? prize.color : spinning ? 'rgba(0,180,255,0.35)' : 'rgba(0,100,180,0.2)'}`,
                      boxShadow: prize
                        ? `0 0 18px ${prize.color}66, inset 0 0 10px ${prize.color}18`
                        : spinning ? '0 0 10px rgba(0,180,255,0.2)' : 'none',
                    }}
                    animate={isNew ? {
                      scale: [1, 1.18, 1.0],
                      boxShadow: [`0 0 0px ${prize?.color ?? '#00BFFF'}00`, `0 0 36px ${prize?.color ?? '#00BFFF'}FF`, `0 0 16px ${prize?.color ?? '#00BFFF'}88`],
                    } : prize ? {
                      scale: [1, 1.05, 1],
                      boxShadow: [
                        `0 0 12px ${prize.color}44`,
                        `0 0 28px ${prize.color}AA`,
                        `0 0 12px ${prize.color}44`,
                      ],
                    } : {}}
                    transition={{ type: 'tween', duration: isNew ? 0.4 : prize ? 1.6 : 0.35, repeat: (prize && !isNew) ? Infinity : 0, ease: 'easeInOut' }}
                  >
                    {prize ? (
                      <motion.div
                        className="flex flex-col items-center justify-center gap-0.5 px-1 py-2"
                        initial={{ scale: 0.4, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                      >
                        {(isJackpot || prize.kind === 'DIAMOND') && (
                          <span style={{
                            fontSize: 9, fontWeight: 900, color: prize.color,
                            textShadow: `0 0 8px ${prize.color}`,
                            letterSpacing: '0.06em', lineHeight: 1.1, textAlign: 'center',
                          }}>
                            {prize.label}
                          </span>
                        )}
                        <span style={{
                          fontSize: isJackpot ? 10 : 12, fontWeight: 900, lineHeight: 1.2,
                          color: prize.kind === 'credits' ? '#FFD700' : prize.color,
                          textShadow: `0 0 8px ${prize.kind === 'credits' ? '#FFD70099' : prize.color + '99'}`,
                          textAlign: 'center',
                        }}>
                          {formatCredits(prize.amount)}
                        </span>
                      </motion.div>
                    ) : (
                      <TienLenSpinningCell spinning={spinning} />
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Running total */}
            <AnimatePresence>
              {tienLen.prizes.some(p => p !== null) && (
                <motion.div
                  className="text-sm text-gray-300 text-center"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  Feature Prize:{' '}
                  <motion.span
                    key={tienLen.prizes.filter(Boolean).length}
                    className="font-black text-xl"
                    style={{ color: '#00BFFF' }}
                    initial={{ scale: 1.4, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    {formatCredits(tienLen.prizes.reduce((s, p) => s + (p?.amount ?? 0), 0))}
                  </motion.span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Tiến Lên SPIN button ── */}
            {tienLen.phase !== 'done' && (
              <motion.button
                onClick={handleTienLenSpin}
                disabled={!canTienLenSpin}
                className="rounded-full font-black text-black disabled:opacity-40 flex flex-col items-center justify-center gap-1"
                style={{
                  width: 90, height: 90,
                  background: canTienLenSpin ? 'linear-gradient(135deg, #00EEFF, #0088CC)' : '#333',
                  fontSize: 28,
                  boxShadow: canTienLenSpin ? '0 0 28px rgba(0,200,255,0.7), 0 4px 16px rgba(0,0,0,0.5)' : 'none',
                }}
                animate={canTienLenSpin ? {
                  boxShadow: [
                    '0 0 18px rgba(0,180,255,0.4)',
                    '0 0 44px rgba(0,220,255,0.95)',
                    '0 0 18px rgba(0,180,255,0.4)',
                  ],
                } : {}}
                transition={{ type: 'tween', duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                whileTap={canTienLenSpin ? { scale: 0.88 } : {}}
              >
                <span>{tienLen.phase === 'spinning' ? '⏳' : '💎'}</span>
                <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.1em' }}>SPIN</span>
              </motion.button>
            )}

            {/* Grand Jackpot banner — full line achieved */}
            <AnimatePresence>
              {tienLen.phase === 'done' && tienLen.grandJackpotBonus > 0 && (
                <motion.div
                  className="flex flex-col items-center gap-1 text-center"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 16 }}
                >
                  <motion.div
                    className="font-black"
                    style={{
                      fontSize: 22,
                      background: 'linear-gradient(90deg,#FF4D6D,#FFD700,#FF8C00,#FFD700,#FF4D6D)',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                      filter: 'drop-shadow(0 0 14px rgba(255,77,109,0.9))',
                    }}
                    animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                    transition={{ type: 'tween', duration: 1.8, repeat: Infinity }}
                  >
                    🏆 GRAND JACKPOT! 🏆
                  </motion.div>
                  <div className="text-[11px] text-gray-400 tracking-widest">ALL 5 COLUMNS FILLED!</div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Collect button — only when done */}
            <AnimatePresence>
              {tienLen.phase === 'done' && (
                <motion.button
                  onClick={collectTienLen}
                  className="px-12 py-3 rounded-full font-black text-black text-sm mt-1"
                  style={{
                    background: tienLen.grandJackpotBonus > 0
                      ? 'linear-gradient(90deg,#FF4D6D,#FF8C00,#FFD700)'
                      : 'linear-gradient(90deg, #0088CC, #00EEFF)',
                  }}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  whileTap={{ scale: 0.93 }}
                >
                  COLLECT 💎 {formatCredits(
                    tienLen.prizes.reduce((s, p) => s + (p?.amount ?? 0), 0) + tienLen.grandJackpotBonus
                  )}
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
