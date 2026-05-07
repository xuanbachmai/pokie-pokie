'use client';

/**
 * Diamond Rush Feature
 * ─────────────────────────────────────────────────────────────────────────────
 * A classic 3-reel × 1-row feature game that plays after Buffalo Rush ends
 * (only when at least one Diamond Buffalo was collected).
 *
 * Mechanics:
 *  • 3 reels, 1 pay-line (centre row shown large)
 *  • Symbols: Diamond, Wild Tiger, Dragon, Lotus, Pho, Coin, Rice (prize-themed)
 *  • Win on 3-of-a-kind (left → right) or 2-of-a-kind
 *  • Player manually presses SPIN (or space bar) each time
 *  • Spins awarded = 3 × diamond count from Buffalo Rush (max 9)
 *  • "Tiến Lên" fanfare plays on entry; win sounds on match
 *  • Total won credited to balance when all spins are used
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { formatCredits } from '@/lib/utils';
import { getAudio } from '@/lib/audioEngine';
import { SymbolId } from '@/types/game';
import { SymbolSVG } from '@/components/Reels/SymbolSVG';

// ── Prize reel strip (only 7 symbols, prize-weighted) ────────────────────────
const DR_SYMBOLS: SymbolId[] = [
  SymbolId.SPECIAL,  // Diamond Buffalo — top prize (rare)
  SymbolId.WILD,     // Wild Tiger       — jackpot
  SymbolId.DRAGON,   // Dragon           — big prize
  SymbolId.TIGER,    // Phoenix          — medium
  SymbolId.PANDA,    // Lotus flower     — medium-low
  SymbolId.KOI,      // Lantern          — low
  SymbolId.LOTUS,    // Bamboo           — low
];

// Weight table (higher = more common)
const DR_WEIGHTS = [1, 2, 3, 4, 5, 6, 7];

// Payout per 3-of-a-kind as multiplier of totalBet
const DR_3OAK: Record<string, number> = {
  [SymbolId.SPECIAL]: 100,
  [SymbolId.WILD]:     50,
  [SymbolId.DRAGON]:   25,
  [SymbolId.TIGER]:    15,
  [SymbolId.PANDA]:     8,
  [SymbolId.KOI]:       5,
  [SymbolId.LOTUS]:     3,
};

// Payout per 2-of-a-kind (left reels only — col 0 & 1 match)
const DR_2OAK: Record<string, number> = {
  [SymbolId.SPECIAL]: 10,
  [SymbolId.WILD]:     5,
  [SymbolId.DRAGON]:   3,
  [SymbolId.TIGER]:    2,
  [SymbolId.PANDA]:  1.5,
  [SymbolId.KOI]:      1,
  [SymbolId.LOTUS]:  0.5,
};

const SYMBOL_LABELS: Partial<Record<SymbolId, string>> = {
  [SymbolId.SPECIAL]: '💎 DIAMOND',
  [SymbolId.WILD]:    '🐯 WILD',
  [SymbolId.DRAGON]:  '🐉 DRAGON',
  [SymbolId.TIGER]:   '🦅 PHOENIX',
  [SymbolId.PANDA]:   '🪷 LOTUS',
  [SymbolId.KOI]:     '🏮 LANTERN',
  [SymbolId.LOTUS]:   '🎋 BAMBOO',
};

function weightedRandom(): SymbolId {
  const total = DR_WEIGHTS.reduce((s, w) => s + w, 0);
  let r = Math.random() * total;
  for (let i = 0; i < DR_SYMBOLS.length; i++) {
    r -= DR_WEIGHTS[i];
    if (r <= 0) return DR_SYMBOLS[i];
  }
  return DR_SYMBOLS[DR_SYMBOLS.length - 1];
}

function evaluateLine(line: SymbolId[], totalBet: number): number {
  const [a, b, c] = line;
  // Wild substitutes anything
  const r0 = a === SymbolId.WILD ? b : a;
  const r1 = b === SymbolId.WILD ? a : b;

  if (a === b && b === c) {
    return parseFloat(((DR_3OAK[a] ?? 0) * totalBet).toFixed(2));
  }
  if (a === SymbolId.WILD && b === c) {
    return parseFloat(((DR_3OAK[b] ?? 0) * totalBet).toFixed(2));
  }
  if (c === SymbolId.WILD && a === b) {
    return parseFloat(((DR_3OAK[a] ?? 0) * totalBet).toFixed(2));
  }
  if (a === SymbolId.WILD && b === SymbolId.WILD) {
    return parseFloat(((DR_3OAK[c] ?? 0) * totalBet).toFixed(2));
  }
  // 2-of-a-kind (left two only)
  if (r0 === r1) {
    return parseFloat(((DR_2OAK[r0] ?? 0) * totalBet).toFixed(2));
  }
  return 0;
}

// ── Spinning Reel Cell ─────────────────────────────────────────────────────
function SpinReelCell({ spinning, sym }: { spinning: boolean; sym: SymbolId }) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!spinning) return;
    const t = setInterval(() => setFrame(f => (f + 1) % DR_SYMBOLS.length), 70);
    return () => clearInterval(t);
  }, [spinning]);

  const display = spinning ? DR_SYMBOLS[frame] : sym;

  return (
    <motion.div
      className="flex items-center justify-center rounded-2xl"
      style={{
        width: 110, height: 110,
        background: spinning
          ? 'radial-gradient(ellipse at 50% 30%, rgba(0,191,255,0.25), rgba(0,100,200,0.12))'
          : 'radial-gradient(ellipse at 50% 30%, rgba(0,191,255,0.18), rgba(0,60,120,0.1))',
        border: `2px solid ${spinning ? 'rgba(0,191,255,0.5)' : 'rgba(0,191,255,0.3)'}`,
        boxShadow: spinning
          ? '0 0 20px rgba(0,191,255,0.4), inset 0 0 10px rgba(0,191,255,0.1)'
          : '0 0 12px rgba(0,191,255,0.2)',
      }}
      animate={spinning ? { opacity: [1, 0.75, 1] } : {}}
      transition={{ duration: 0.14, repeat: spinning ? Infinity : 0 }}
    >
      <SymbolSVG id={display} size={80} />
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export function DiamondRushFeature({ onClose }: { onClose: () => void }) {
  const totalBet        = useGameStore(s => parseFloat((s.betPerLine * s.activeLines).toFixed(2)));
  const diamondRushSpins = useGameStore(s => s.diamondRushSpins);
  const endDiamondRush  = useGameStore(s => s.endDiamondRush);

  const [spinsLeft,  setSpinsLeft]  = useState(diamondRushSpins);
  const [spinning,   setSpinning]   = useState([false, false, false]);
  const [line,       setLine]       = useState<SymbolId[]>([SymbolId.KOI, SymbolId.LOTUS, SymbolId.PANDA]);
  const [lastWin,    setLastWin]    = useState<number | null>(null);
  const [totalWon,   setTotalWon]   = useState(0);
  const [phase,      setPhase]      = useState<'idle' | 'spinning' | 'done'>('idle');
  const [winLine,    setWinLine]    = useState(false);
  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Play fanfare on mount
  useEffect(() => {
    const audio = getAudio();
    setTimeout(() => audio.playTienLenFanfare(), 200);
    return () => { timerRefs.current.forEach(clearTimeout); };
  }, []);

  const clearTimers = useCallback(() => {
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];
  }, []);

  const handleSpin = useCallback(() => {
    if (phase !== 'idle' || spinsLeft <= 0) return;

    const audio = getAudio();
    audio.playDiamondSpin();

    // Pre-calculate result
    const result: SymbolId[] = [weightedRandom(), weightedRandom(), weightedRandom()];

    setPhase('spinning');
    setWinLine(false);
    setLastWin(null);
    setSpinning([true, true, true]);

    const STOP_DELAYS = [600, 950, 1350];
    STOP_DELAYS.forEach((delay, col) => {
      const t = setTimeout(() => {
        setSpinning(prev => { const n = [...prev]; n[col] = false; return n; });
        setLine(prev => { const n = [...prev]; n[col] = result[col]; return n; });

        if (col === 2) {
          // All stopped — evaluate
          const winAmount = evaluateLine(result, totalBet);
          const tier = winAmount >= totalBet * 50 ? 'jackpot'
                     : winAmount >= totalBet * 10  ? 'big'
                     : winAmount > 0               ? 'small'
                     : null;

          if (tier) {
            audio.playDiamondWin(tier);
            setWinLine(true);
          }
          setLastWin(winAmount);
          setTotalWon(prev => parseFloat((prev + winAmount).toFixed(2)));

          const newSpins = spinsLeft - 1;
          setSpinsLeft(newSpins);

          if (newSpins === 0) {
            const t2 = setTimeout(() => setPhase('done'), 1200);
            timerRefs.current.push(t2);
          } else {
            const t2 = setTimeout(() => setPhase('idle'), 600);
            timerRefs.current.push(t2);
          }
        }
      }, delay);
      timerRefs.current.push(t);
    });
  }, [phase, spinsLeft, totalBet, clearTimers]);

  // Space bar support
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code === 'Space') { e.preventDefault(); handleSpin(); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleSpin]);

  function handleCollect() {
    clearTimers();
    endDiamondRush(totalWon);
    onClose();
  }

  const canSpin = phase === 'idle' && spinsLeft > 0;

  return (
    <div
      className="relative flex flex-col items-center gap-4 p-6 overflow-hidden"
      style={{ minWidth: 380, maxWidth: 480 }}
    >
      {/* ── Ambient diamond glow bg ── */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 'inherit',
        background: 'radial-gradient(ellipse at 50% 20%, rgba(0,191,255,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* ── Header ── */}
      <div className="text-center z-10">
        <motion.div
          className="text-3xl font-black tracking-widest"
          style={{ color: '#00BFFF', textShadow: '0 0 24px rgba(0,191,255,0.9), 0 0 48px rgba(0,100,255,0.5)' }}
          animate={{ textShadow: [
            '0 0 24px rgba(0,191,255,0.9), 0 0 48px rgba(0,100,255,0.5)',
            '0 0 36px rgba(0,255,255,1.0), 0 0 72px rgba(0,150,255,0.8)',
            '0 0 24px rgba(0,191,255,0.9), 0 0 48px rgba(0,100,255,0.5)',
          ]}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          💎 TIẾN LÊN
        </motion.div>
        <div className="text-xs text-cyan-400 mt-0.5 tracking-widest opacity-80">DIAMOND RUSH</div>
      </div>

      {/* ── Spin counter ── */}
      <div className="flex items-center gap-6 z-10">
        <div className="text-sm text-gray-400">
          SPINS LEFT:{' '}
          <span className="font-black text-cyan-300 text-xl">{spinsLeft}</span>
        </div>
        <div className="text-sm text-gray-400">
          WON:{' '}
          <span className="font-black text-yellow-300 text-xl">{formatCredits(totalWon)}</span>
        </div>
      </div>

      {/* ── 3-Reel Single Line ── */}
      <div className="relative z-10">
        {/* Win line indicator */}
        <AnimatePresence>
          {winLine && (
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                top: '50%',
                left: -8,
                right: -8,
                height: 4,
                background: 'linear-gradient(90deg, transparent, #FFD700, #FFD700, transparent)',
                borderRadius: 2,
                boxShadow: '0 0 16px #FFD700AA',
                zIndex: 10,
                transform: 'translateY(-50%)',
              }}
            />
          )}
        </AnimatePresence>

        <div className="flex gap-3">
          {[0, 1, 2].map(col => (
            <motion.div
              key={col}
              animate={winLine ? {
                scale: [1, 1.08, 1],
                filter: ['brightness(1)', 'brightness(1.6)', 'brightness(1)'],
              } : {}}
              transition={{ duration: 0.4, delay: col * 0.06 }}
            >
              <SpinReelCell spinning={spinning[col]} sym={line[col]} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Win display ── */}
      <div className="z-10 min-h-[36px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {lastWin !== null && (
            <motion.div
              key={`win-${totalWon}`}
              initial={{ opacity: 0, y: 12, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, type: 'spring', stiffness: 260 }}
              className="text-center"
            >
              {lastWin > 0 ? (
                <div>
                  <div
                    className="text-2xl font-black"
                    style={{ color: lastWin >= totalBet * 10 ? '#FFD700' : '#00FF88',
                      textShadow: lastWin >= totalBet * 10 ? '0 0 20px #FFD700AA' : '0 0 12px #00FF8866' }}
                  >
                    {lastWin >= totalBet * 50 ? '💎 JACKPOT! ' : lastWin >= totalBet * 10 ? '🔥 BIG WIN! ' : '✨ WIN! '}
                    {formatCredits(lastWin)}
                  </div>
                  {winLine && (
                    <div className="text-xs text-cyan-400 mt-0.5">
                      {SYMBOL_LABELS[line[0]] ?? line[0]}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-500">No win this spin</div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Controls ── */}
      <div className="z-10 flex flex-col items-center gap-2 w-full">
        <AnimatePresence>
          {phase !== 'done' ? (
            <motion.button
              key="spin-btn"
              onClick={handleSpin}
              disabled={!canSpin}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileTap={{ scale: 0.94 }}
              className="w-full py-3 rounded-2xl font-black text-lg tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: canSpin
                  ? 'linear-gradient(135deg, #007FFF 0%, #00BFFF 50%, #0040FF 100%)'
                  : 'rgba(0,100,200,0.3)',
                color: '#FFFFFF',
                border: '2px solid rgba(0,191,255,0.6)',
                boxShadow: canSpin ? '0 0 20px rgba(0,191,255,0.5), 0 4px 12px rgba(0,0,0,0.4)' : 'none',
                textShadow: '0 1px 4px rgba(0,0,0,0.5)',
              }}
            >
              {phase === 'spinning' ? '◈ SPINNING…' : `💎 SPIN  (${spinsLeft} left)`}
            </motion.button>
          ) : (
            <motion.div
              key="done-state"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full flex flex-col items-center gap-3"
            >
              <div
                className="text-center text-2xl font-black"
                style={{ color: '#FFD700', textShadow: '0 0 20px #FFD700AA' }}
              >
                🎉 TIẾN LÊN COMPLETE!
              </div>
              <div className="text-center text-gray-300">
                Total Diamond Rush Win:{' '}
                <span style={{ color: '#00BFFF', fontWeight: 900 }}>{formatCredits(totalWon)}</span>
              </div>
              <motion.button
                onClick={handleCollect}
                whileTap={{ scale: 0.94 }}
                className="w-full py-3 rounded-2xl font-black text-lg tracking-widest"
                style={{
                  background: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)',
                  color: '#1A0A00',
                  border: '2px solid rgba(255,215,0,0.6)',
                  boxShadow: '0 0 24px rgba(255,215,0,0.5), 0 4px 12px rgba(0,0,0,0.4)',
                }}
                animate={{ boxShadow: [
                  '0 0 20px rgba(255,215,0,0.5), 0 4px 12px rgba(0,0,0,0.4)',
                  '0 0 40px rgba(255,215,0,0.8), 0 4px 12px rgba(0,0,0,0.4)',
                  '0 0 20px rgba(255,215,0,0.5), 0 4px 12px rgba(0,0,0,0.4)',
                ]}}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                💰 COLLECT {formatCredits(totalWon)}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Small hint ── */}
      {phase === 'idle' && spinsLeft > 0 && (
        <div className="text-xs text-gray-600 z-10">Press SPACE or tap SPIN</div>
      )}
    </div>
  );
}
