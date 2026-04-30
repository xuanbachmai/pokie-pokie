'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { formatCredits } from '@/lib/utils';
import { useJackpotStore } from '@/store/jackpotStore';
import { JackpotTier, SymbolId } from '@/types/game';
import { SymbolSVG } from '@/components/Reels/SymbolSVG';

// ── Slot value types ──────────────────────────────────────────────────────────
type SlotKind = 'credits' | 'MINI' | 'MINOR' | 'MAJOR' | 'GRAND' | 'DIAMOND';

interface SlotValue {
  kind: SlotKind;
  amount: number;
  label: string;
  color: string;
}

// ── Prize tables ──────────────────────────────────────────────────────────────

/** Standard Buffalo Rush prize — same odds as before */
function randomSlotValue(totalBet: number): SlotValue {
  const jackpots = useJackpotStore.getState().values;
  const r = Math.random();
  if (r < 0.01)  return { kind: 'GRAND',  amount: jackpots[JackpotTier.GRAND],  label: 'MEGA',  color: '#FF4D6D' };
  if (r < 0.05)  return { kind: 'MAJOR',  amount: jackpots[JackpotTier.MAJOR],  label: 'MAXI',  color: '#FF8C00' };
  if (r < 0.15)  return { kind: 'MINOR',  amount: jackpots[JackpotTier.MINOR],  label: 'MAJOR', color: '#FFD700' };
  if (r < 0.35)  return { kind: 'MINI',   amount: jackpots[JackpotTier.MINI],   label: 'MINI',  color: '#00D187' };
  const mult   = [2, 3, 5, 8, 10, 15, 20][Math.floor(Math.random() * 7)];
  const amount = parseFloat((totalBet * mult).toFixed(2));
  return { kind: 'credits', amount, label: formatCredits(amount), color: '#FFD700' };
}

/**
 * Tiến Lên prize table — boosted MINI / MINOR / MAJOR.
 * MEGA is extremely rare; credits multipliers are bigger to compensate.
 */
function randomTienLenPrize(totalBet: number): SlotValue {
  const jackpots = useJackpotStore.getState().values;
  const r = Math.random();
  if (r < 0.005) return { kind: 'GRAND', amount: jackpots[JackpotTier.GRAND],  label: 'MEGA',  color: '#FF4D6D' };
  if (r < 0.025) return { kind: 'MAJOR', amount: jackpots[JackpotTier.MAJOR],  label: 'MAXI',  color: '#FF8C00' };
  if (r < 0.115) return { kind: 'MINOR', amount: jackpots[JackpotTier.MINOR],  label: 'MAJOR', color: '#FFD700' };
  if (r < 0.415) return { kind: 'MINI',  amount: jackpots[JackpotTier.MINI],   label: 'MINI',  color: '#00D187' };
  // Credits — higher multipliers than normal rush
  const mult   = [3, 5, 8, 12, 18, 25][Math.floor(Math.random() * 6)];
  const amount = parseFloat((totalBet * mult).toFixed(2));
  return { kind: 'credits', amount, label: formatCredits(amount), color: '#00BFFF' };
}

// ── Summary label ─────────────────────────────────────────────────────────────
function summaryLabel(slots: (SlotValue | null)[]): { text: string; color: string } {
  const filled = slots.filter(Boolean) as SlotValue[];
  if (filled.some(v => v.kind === 'GRAND'))  return { text: '🎉 MEGA BONUS! 🎉',    color: '#FF4D6D' };
  if (filled.some(v => v.kind === 'MAJOR'))  return { text: 'MAXI BONUS HIT!',       color: '#FF8C00' };
  if (filled.some(v => v.kind === 'MINOR'))  return { text: 'MAJOR BONUS HIT!',      color: '#FFD700' };
  if (filled.some(v => v.kind === 'MINI'))   return { text: 'MINI BONUS HIT!',       color: '#00D187' };
  if (filled.some(v => v.kind === 'DIAMOND'))return { text: '💎 TIẾN LÊN WIN!',      color: '#00BFFF' };
  return { text: 'COLLECT YOUR WIN!', color: '#FFD700' };
}

// ── Tiến Lên state ────────────────────────────────────────────────────────────
interface TienLenState {
  slotIdx: number;
  prizes: (SlotValue | null)[];
  revealIdx: number;  // 0–5; how many of the 5 prizes have been revealed
}

// ── Main component ────────────────────────────────────────────────────────────
export function NuggetHoldFeature({ onClose }: { onClose: () => void }) {
  const resolveBonus    = useGameStore(s => s.resolveBonus);
  const nuggetHoldSeeds = useGameStore(s => s.nuggetHoldSeeds);
  const betPerLine      = useGameStore(s => s.betPerLine);
  const activeLines     = useGameStore(s => s.activeLines);
  const totalBet        = betPerLine * activeLines;

  const [slots, setSlots]         = useState<(SlotValue | null)[]>(() =>
    nuggetHoldSeeds.map(seeded => seeded ? randomSlotValue(totalBet) : null)
  );
  const [reSpins, setReSpins]     = useState(3);
  const [phase, setPhase]         = useState<'playing' | 'done'>('playing');
  const [totalPrize, setTotalPrize] = useState(0);
  const [newSlots, setNewSlots]   = useState<boolean[]>(Array(15).fill(false));
  const [flashMultiplier, setFlashMultiplier] = useState<number | null>(null);

  // ── Tiến Lên sub-feature ──
  const [tienLen, setTienLen]     = useState<TienLenState | null>(null);

  const slotsRef   = useRef(slots);
  const reSpinsRef = useRef(reSpins);
  slotsRef.current   = slots;
  reSpinsRef.current = reSpins;

  // ── Tiến Lên auto-reveal (one prize every 700 ms) ──────────────────────────
  useEffect(() => {
    if (!tienLen) return;
    if (tienLen.revealIdx >= 5) return;               // all 5 revealed
    const t = setTimeout(() => {
      setTienLen(prev => {
        if (!prev) return prev;
        const prizes = [...prev.prizes];
        prizes[prev.revealIdx] = randomTienLenPrize(totalBet);
        return { ...prev, prizes, revealIdx: prev.revealIdx + 1 };
      });
    }, 700);
    return () => clearTimeout(t);
  }, [tienLen, totalBet]);

  // ── Main respin loop (paused while Tiến Lên is active) ────────────────────
  useEffect(() => {
    if (phase !== 'playing') return;
    if (tienLen !== null) return;                      // wait for Tiến Lên to finish

    const timer = setTimeout(() => {
      const current   = [...slotsRef.current];
      const highlights = Array(15).fill(false);
      let newCount   = 0;
      let diamondIdx = -1;

      for (let i = 0; i < 15; i++) {
        if (!current[i] && Math.random() < 0.25) {
          // 10% chance this new buffalo is a Diamond Buffalo (Tiến Lên trigger)
          if (diamondIdx < 0 && Math.random() < 0.10) {
            current[i]  = { kind: 'DIAMOND', amount: 0, label: '💎', color: '#00BFFF' };
            highlights[i] = true;
            newCount++;
            diamondIdx = i;
            // Only one Diamond per respin — stop filling further slots this round
            break;
          } else {
            current[i]  = randomSlotValue(totalBet);
            highlights[i] = true;
            newCount++;
          }
        }
      }

      // ── Buffalo Rush multiplier mechanic ───────────────────────────────────
      if (newCount > 0) {
        for (let i = 0; i < 15; i++) {
          if (current[i] && !highlights[i] && current[i]!.kind !== 'DIAMOND') {
            current[i] = {
              ...current[i]!,
              amount: parseFloat((current[i]!.amount * newCount).toFixed(2)),
            };
          }
        }
        setFlashMultiplier(newCount);
        setTimeout(() => setFlashMultiplier(null), 900);
      }

      setSlots(current);
      setNewSlots(highlights);

      // If a Diamond Buffalo landed → trigger Tiến Lên instead of normal flow
      if (diamondIdx >= 0) {
        // Respins reset to 3 (diamond counts as new buffalo)
        setReSpins(3);
        setTienLen({ slotIdx: diamondIdx, prizes: [null,null,null,null,null], revealIdx: 0 });
        return;
      }

      const allFilled  = current.every(Boolean);
      const newReSpins = newCount > 0 ? 3 : reSpinsRef.current - 1;

      if (newReSpins === 0 || allFilled) {
        let prize = current.reduce((sum, v) => sum + (v?.amount ?? 0), 0);
        if (allFilled) {
          const grandAmount = useJackpotStore.getState().triggerGrandJackpot();
          prize += grandAmount;
        }
        setTotalPrize(parseFloat(prize.toFixed(2)));
        setPhase('done');
      } else {
        setReSpins(newReSpins);
      }
    }, 1800);

    return () => clearTimeout(timer);
  }, [phase, reSpins, slots, tienLen, totalBet]);

  // ── Collect Tiến Lên prizes ───────────────────────────────────────────────
  function collectTienLen() {
    if (!tienLen) return;
    const total = tienLen.prizes.reduce((s, p) => s + (p?.amount ?? 0), 0);
    setSlots(prev => {
      const next = [...prev];
      next[tienLen.slotIdx] = {
        kind:   'DIAMOND',
        amount: parseFloat(total.toFixed(2)),
        label:  '💎',
        color:  '#00BFFF',
      };
      return next;
    });
    setTienLen(null);   // closes overlay → triggers main respin useEffect again
  }

  // ── Collect final prize ───────────────────────────────────────────────────
  const filledCount  = slots.filter(Boolean).length;
  const runningTotal = slots.reduce((s, v) => s + (v?.amount ?? 0), 0);
  const summary      = phase === 'done' ? summaryLabel(slots) : null;

  function handleCollect() {
    resolveBonus({ type: 'NUGGET_HOLD', count: filledCount, totalAmount: totalPrize });
    onClose();
  }

  return (
    <div className="relative flex flex-col items-center gap-4 p-6 overflow-hidden" style={{ minWidth: 320 }}>

      {/* ── Header ── */}
      <div className="text-center">
        <div className="text-2xl font-black text-amber-700">🐃 BUFFALO RUSH</div>
        <div className="text-xs text-gray-400 mt-0.5 tracking-widest">HOLD &amp; COLLECT</div>
      </div>

      {/* Respin counter */}
      {phase === 'playing' && !tienLen && (
        <div className="text-sm text-gray-300">
          BONUS SPINS: <span className="font-black text-yellow-400 text-lg">{reSpins}</span>
        </div>
      )}

      {/* Multiplier flash */}
      <AnimatePresence>
        {flashMultiplier && (
          <motion.div
            className="text-3xl font-black text-center"
            style={{ color: '#FF4D6D', textShadow: '0 0 20px rgba(255,77,109,0.9)' }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1.3 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.35 }}
          >
            ×{flashMultiplier} MULTIPLIER!
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 5×3 buffalo grid ── */}
      <div className="grid grid-cols-5 gap-1.5 my-1 w-full">
        {slots.map((slot, idx) => {
          const isDiamond = slot?.kind === 'DIAMOND';
          const color     = slot ? slot.color : 'rgba(255,255,255,0.08)';
          const isJackpot = slot && slot.kind !== 'credits' && slot.kind !== 'DIAMOND';
          const svgId     = isDiamond ? SymbolId.SPECIAL : SymbolId.NUGGET;

          return (
            <motion.div
              key={idx}
              className="flex flex-col items-center justify-start rounded-xl overflow-visible relative"
              style={{
                background: slot
                  ? `radial-gradient(ellipse at 50% 30%, ${color}50, ${color}1A)`
                  : 'rgba(50,30,10,0.55)',
                border: `1.5px solid ${slot ? color : 'rgba(255,200,80,0.12)'}`,
                boxShadow: slot
                  ? `0 0 ${isDiamond ? 20 : 12}px ${color}${isDiamond ? 'BB' : '77'}, inset 0 1px 0 rgba(255,255,255,0.08)`
                  : 'none',
                padding: '4px 2px 3px',
                minHeight: 80,
              }}
              animate={newSlots[idx] ? {
                scale: [1, 1.35, 1],
                boxShadow: [
                  `0 0 0px ${color}00`,
                  `0 0 32px ${color}FF`,
                  `0 0 14px ${color}88`,
                ],
              } : isDiamond ? {
                boxShadow: [
                  '0 0 10px #00BFFF66, inset 0 1px 0 rgba(255,255,255,0.08)',
                  '0 0 28px #00BFFFDD, inset 0 1px 0 rgba(255,255,255,0.08)',
                  '0 0 10px #00BFFF66, inset 0 1px 0 rgba(255,255,255,0.08)',
                ],
              } : {}}
              transition={{ duration: isDiamond ? 1.6 : 0.4, repeat: isDiamond ? Infinity : 0 }}
            >
              {slot ? (
                <>
                  {/* Full buffalo / diamond buffalo SVG — fills the slot */}
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'center', lineHeight: 0 }}>
                    <SymbolSVG id={svgId} size={52} />
                  </div>

                  {/* Prize label */}
                  {(isJackpot || isDiamond) && (
                    <span style={{
                      fontSize: 7, fontWeight: 900, color: slot.color, lineHeight: 1,
                      textShadow: `0 0 8px ${slot.color}`,
                      letterSpacing: '0.04em', marginTop: 1,
                    }}>
                      {slot.label}
                    </span>
                  )}

                  {/* Amount */}
                  {slot.amount > 0 && (
                    <span style={{
                      fontSize: 7.5, fontWeight: 900, lineHeight: 1, marginTop: 1,
                      color: isJackpot || isDiamond ? slot.color : '#FFD700',
                      textShadow: `0 0 5px ${isJackpot || isDiamond ? slot.color : '#FFD70099'}`,
                    }}>
                      {formatCredits(slot.amount)}
                    </span>
                  )}
                </>
              ) : (
                /* Empty slot — faint ghost buffalo outline */
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center', opacity: 0.12 }}>
                  <SymbolSVG id={SymbolId.NUGGET} size={52} />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Running total */}
      <div className="flex items-center gap-3 text-sm">
        <span className="text-gray-400">Buffaloes:</span>
        <span className="font-black text-amber-700 text-lg">{filledCount} / 15</span>
        {phase === 'playing' && filledCount > 0 && (
          <>
            <span className="text-gray-600">·</span>
            <span className="text-gray-400">Total:</span>
            <span className="font-black text-yellow-300">{formatCredits(runningTotal)}</span>
          </>
        )}
      </div>
      <div className="text-[10px] text-gray-600 text-center">
        Fill all 15 = GRAND JACKPOT · 💎 Diamond = Tiến Lên Feature
      </div>

      {/* Done result */}
      <AnimatePresence>
        {phase === 'done' && summary && (
          <motion.div
            className="flex flex-col items-center gap-3 w-full"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          >
            <motion.div
              className="text-xl font-black text-center"
              style={{ color: summary.color, textShadow: `0 0 16px ${summary.color}88` }}
              animate={summary.text.includes('MEGA') ? { scale: [1, 1.12, 1], opacity: [1, 0.85, 1] } : {}}
              transition={{ duration: 0.7, repeat: Infinity }}
            >
              {summary.text}
            </motion.div>
            <div className="text-gray-300 text-sm">
              Total Prize:{' '}
              <span className="font-black text-yellow-400 text-xl">{formatCredits(totalPrize)}</span>
            </div>
            <motion.button
              onClick={handleCollect}
              className="px-10 py-3 rounded-full font-black text-black text-sm mt-1"
              style={{ background: 'linear-gradient(90deg, #CC0000, #FF8C00)' }}
              whileTap={{ scale: 0.95 }}
              animate={{ boxShadow: ['0 0 10px rgba(204,0,0,0.4)', '0 0 30px rgba(204,0,0,0.8)', '0 0 10px rgba(204,0,0,0.4)'] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              COLLECT {formatCredits(totalPrize)}!
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════════
          TIẾN LÊN OVERLAY
          Slides in when a Diamond Buffalo lands in Buffalo Rush.
          Shows 5 prize lines auto-revealed one by one.
      ═══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {tienLen && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-5 py-6"
            style={{
              background: 'linear-gradient(160deg, rgba(0,10,30,0.97), rgba(0,20,50,0.97))',
              backdropFilter: 'blur(6px)',
              zIndex: 20,
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ type: 'spring', stiffness: 240, damping: 22 }}
          >
            {/* Header */}
            <div className="text-center">
              <motion.div
                className="text-2xl font-black"
                style={{ color: '#00BFFF', textShadow: '0 0 18px rgba(0,191,255,0.7)' }}
                animate={{ textShadow: ['0 0 10px rgba(0,191,255,0.5)', '0 0 28px rgba(0,191,255,0.9)', '0 0 10px rgba(0,191,255,0.5)'] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              >
                💎 TIẾN LÊN
              </motion.div>
              <div className="text-[11px] text-gray-400 tracking-widest mt-0.5">
                DIAMOND BUFFALO FEATURE · 5 PRIZE LINES
              </div>
            </div>

            {/* 5 prize line cards */}
            <div className="grid grid-cols-5 gap-2 w-full">
              {tienLen.prizes.map((prize, i) => (
                <motion.div
                  key={i}
                  className="flex flex-col items-center justify-center rounded-xl py-3 px-1"
                  style={{
                    background: prize
                      ? `radial-gradient(circle at 50% 35%, ${prize.color}28, ${prize.color}0A)`
                      : 'rgba(0,80,160,0.12)',
                    border: `1.5px solid ${prize ? prize.color : 'rgba(0,140,220,0.25)'}`,
                    minHeight: 72,
                    boxShadow: prize ? `0 0 12px ${prize.color}55` : 'none',
                  }}
                  initial={false}
                  animate={prize ? { scale: [1, 1.12, 1] } : {}}
                  transition={{ duration: 0.35 }}
                >
                  {prize ? (
                    <>
                      <span className="text-[10px] font-black tracking-wide leading-tight text-center"
                        style={{ color: prize.color, textShadow: `0 0 6px ${prize.color}88` }}>
                        {prize.label}
                      </span>
                      <span className="text-[11px] font-black mt-1 leading-tight text-center"
                        style={{ color: prize.kind === 'credits' ? '#FFD700' : prize.color }}>
                        {formatCredits(prize.amount)}
                      </span>
                    </>
                  ) : (
                    <motion.span
                      style={{ color: 'rgba(0,180,255,0.35)', fontSize: 22, lineHeight: 1 }}
                      animate={{ opacity: [0.3, 0.8, 0.3] }}
                      transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.12 }}
                    >
                      ?
                    </motion.span>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Prize total — updates as each line reveals */}
            {tienLen.revealIdx > 0 && (
              <motion.div
                className="text-sm text-gray-300"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              >
                Feature Prize:{' '}
                <span className="font-black text-lg" style={{ color: '#00BFFF' }}>
                  {formatCredits(tienLen.prizes.reduce((s, p) => s + (p?.amount ?? 0), 0))}
                </span>
              </motion.div>
            )}

            {/* Odds reminder */}
            <div className="flex gap-3 text-[9px] text-gray-500 tracking-wide">
              <span style={{ color: '#00D187' }}>▲ MINI 30%</span>
              <span style={{ color: '#FFD700' }}>▲ MAJOR 9%</span>
              <span style={{ color: '#FF8C00' }}>▲ MAXI 2%</span>
            </div>

            {/* Collect button — only appears after all 5 revealed */}
            <AnimatePresence>
              {tienLen.revealIdx >= 5 && (
                <motion.button
                  onClick={collectTienLen}
                  className="px-10 py-3 rounded-full font-black text-black text-sm"
                  style={{ background: 'linear-gradient(90deg, #0088CC, #00BFFF)' }}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{
                    scale: 1, opacity: 1,
                    boxShadow: ['0 0 10px rgba(0,191,255,0.4)', '0 0 28px rgba(0,191,255,0.9)', '0 0 10px rgba(0,191,255,0.4)'],
                  }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ADD TO RUSH! →
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
