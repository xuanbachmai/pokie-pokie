'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { SYMBOLS } from '@/lib/constants';
import { formatCredits } from '@/lib/utils';

const CYCLE_MS = 1600; // ms per winning line in the normal cycling display

// ── Big Win tier config ───────────────────────────────────────────────────────
const BIG_WIN_CFG = {
  WIN:   { label: 'WIN!',        color: '#00E090', glow: '#00C07A', countMs: 2000 },
  GREAT: { label: 'GREAT WIN!',  color: '#FFD700', glow: '#FFD700', countMs: 3500 },
  BIG:   { label: 'BIG WIN!',    color: '#FF9500', glow: '#FF6600', countMs: 5000 },
} as const;

// ── Sparkle coins that fly outward when counter lands ─────────────────────────
function Sparkles({ active, color }: { active: boolean; color: string }) {
  const coins = Array.from({ length: 16 }, (_, i) => i);
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {active && coins.map(i => {
        const angle = (i / coins.length) * 360;
        const dist  = 60 + Math.random() * 50;
        const dx    = Math.cos((angle * Math.PI) / 180) * dist;
        const dy    = Math.sin((angle * Math.PI) / 180) * dist;
        const size  = 6 + Math.random() * 8;
        const delay = Math.random() * 0.15;
        return (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: size,
              height: size,
              borderRadius: '50%',
              background: color,
              boxShadow: `0 0 6px ${color}`,
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: dx, y: dy, opacity: 0, scale: 0.3 }}
            transition={{ duration: 0.7 + Math.random() * 0.4, delay, ease: 'easeOut' }}
          />
        );
      })}
    </div>
  );
}

// ── Slow rolling counter (ease-out cubic) ─────────────────────────────────────
function RollingCounter({
  target,
  countMs,
  color,
  glow,
  onDone,
}: {
  target: number;
  countMs: number;
  color: string;
  glow: string;
  onDone: () => void;
}) {
  const [val, setVal]       = useState(0);
  const [burst, setBurst]   = useState(false);
  const rafRef    = useRef<number | null>(null);
  const startRef  = useRef<number | null>(null);
  const doneRef   = useRef(false);

  useEffect(() => {
    doneRef.current = false;
    startRef.current = null;
    setVal(0);
    setBurst(false);

    function tick(ts: number) {
      if (!startRef.current) startRef.current = ts;
      const elapsed  = ts - startRef.current;
      const progress = Math.min(elapsed / countMs, 1);
      // Ease-out cubic — fast start, beautiful slow finish
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(parseFloat((eased * target).toFixed(2)));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else if (!doneRef.current) {
        doneRef.current = true;
        setBurst(true);
        onDone();
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, countMs]);

  // Progress 0→1 used to scale / intensify glow as counter nears finish
  const progress = target > 0 ? val / target : 0;
  const glowSize = 8 + progress * 28;   // 8px → 36px
  const textSize = 44 + progress * 16;  // 44px → 60px

  return (
    <div className="relative flex items-center justify-center">
      <Sparkles active={burst} color={color} />
      <motion.div
        className="font-black tabular-nums select-none"
        style={{
          fontFamily: 'var(--font-amount)',
          fontSize: textSize,
          background: `linear-gradient(90deg, ${color}, #ffffff, ${color})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundSize: '200%',
          filter: `drop-shadow(0 0 ${glowSize}px ${glow}CC)`,
          transition: 'font-size 0.06s linear',
        }}
        animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      >
        {formatCredits(val)}
      </motion.div>
    </div>
  );
}

// ── Main WinDisplay ──────────────────────────────────────────────────────────
export function WinDisplay() {
  const phase                 = useGameStore(s => s.phase);
  const totalWin              = useGameStore(s => s.totalWinThisSpin);
  const winLines              = useGameStore(s => s.lastWinLines);
  const highlightedIdx        = useGameStore(s => s.highlightedWinLineIdx);
  const setHighlightedWinLine = useGameStore(s => s.setHighlightedWinLine);
  const bigWinTier            = useGameStore(s => s.bigWinTier);
  const clearBigWin           = useGameStore(s => s.clearBigWin);

  // Whether the rolling counter has finished (shows static glowing number)
  const [countDone, setCountDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const idxRef   = useRef(0);

  // Reset countDone whenever a new big win starts
  useEffect(() => {
    if (bigWinTier && bigWinTier !== 'MEGA') setCountDone(false);
  }, [bigWinTier, totalWin]);

  // Normal line-cycling (only when NOT showing big-win celebration)
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;

    const showBig = bigWinTier && bigWinTier !== 'MEGA';
    if (showBig || phase !== 'IDLE' || !winLines.length || totalWin <= 0) {
      setHighlightedWinLine(null);
      return;
    }

    idxRef.current = 0;
    setHighlightedWinLine(0);

    if (winLines.length > 1) {
      timerRef.current = setInterval(() => {
        idxRef.current = (idxRef.current + 1) % winLines.length;
        setHighlightedWinLine(idxRef.current);
      }, CYCLE_MS);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      setHighlightedWinLine(null);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, winLines.length, totalWin, bigWinTier]);

  // Auto-dismiss big win celebration after counter finishes + 2s hold
  const handleCountDone = useCallback(() => {
    setCountDone(true);
    setTimeout(() => {
      clearBigWin();
    }, 2200);
  }, [clearBigWin]);

  const showBigWin = phase === 'IDLE' && !!bigWinTier && bigWinTier !== 'MEGA' && totalWin > 0;
  const showNormal = phase === 'IDLE' && totalWin > 0 && winLines.length > 0 && !showBigWin;
  const activeLine = showNormal && highlightedIdx !== null ? winLines[highlightedIdx] : null;

  // ── Big Win Celebration ───────────────────────────────────────────────────
  if (showBigWin) {
    const cfg = BIG_WIN_CFG[bigWinTier as keyof typeof BIG_WIN_CFG];
    if (!cfg) return null;

    return (
      <div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        style={{ zIndex: 28 }}
      >
        {/* Pulsing background vignette */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            boxShadow: [
              `inset 0 0 40px ${cfg.glow}22`,
              `inset 0 0 90px ${cfg.glow}55`,
              `inset 0 0 40px ${cfg.glow}22`,
            ],
          }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0, scale: 0.7, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 18 }}
        >
          {/* Tier label */}
          <motion.div
            className="font-black tracking-[0.22em] uppercase"
            style={{
              fontFamily: 'var(--font-jackpot)',
              fontSize: 22,
              color: cfg.color,
              textShadow: `0 0 18px ${cfg.glow}CC, 0 0 36px ${cfg.glow}55`,
              letterSpacing: '0.22em',
            }}
            animate={{
              textShadow: [
                `0 0 12px ${cfg.glow}88`,
                `0 0 32px ${cfg.glow}FF, 0 0 8px #ffffff88`,
                `0 0 12px ${cfg.glow}88`,
              ],
              scale: [1, 1.04, 1],
            }}
            transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
          >
            {cfg.label}
          </motion.div>

          {/* Rolling counter or final static value */}
          {!countDone ? (
            <RollingCounter
              target={totalWin}
              countMs={cfg.countMs}
              color={cfg.color}
              glow={cfg.glow}
              onDone={handleCountDone}
            />
          ) : (
            <motion.div
              className="font-black tabular-nums"
              style={{
                fontFamily: 'var(--font-amount)',
                fontSize: 60,
                background: `linear-gradient(90deg, ${cfg.color}, #ffffff, ${cfg.color})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundSize: '200%',
                filter: `drop-shadow(0 0 24px ${cfg.glow}EE)`,
              }}
              animate={{
                backgroundPosition: ['0%', '100%', '0%'],
                scale: [1, 1.04, 1],
              }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              {formatCredits(totalWin)}
            </motion.div>
          )}

          {/* Tap-to-skip hint */}
          {!countDone && (
            <div className="text-[10px] tracking-widest" style={{ color: `${cfg.color}55` }}>
              tap to skip
            </div>
          )}
        </motion.div>

        {/* Make it tappable to skip */}
        <div
          className="absolute inset-0"
          style={{ pointerEvents: 'auto', cursor: 'pointer' }}
          onClick={() => { setCountDone(true); clearBigWin(); }}
        />
      </div>
    );
  }

  // ── Normal Win Display (line cycling) ─────────────────────────────────────
  if (!showNormal) return null;

  const sym       = activeLine ? SYMBOLS[activeLine.matchedSymbol] : null;
  const lineColor = sym?.color ?? '#FFD700';

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-end pb-3 pointer-events-none"
      style={{ zIndex: 28 }}
    >
      <AnimatePresence mode="wait">
        {activeLine && (
          <motion.div
            key={`${highlightedIdx}-${activeLine.paylineIndex}`}
            className="flex flex-col items-center gap-1"
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.9 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            {/* Line badge */}
            <div
              className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black"
              style={{
                background: `${lineColor}22`,
                border: `1px solid ${lineColor}77`,
                color: lineColor,
              }}
            >
              <span style={{ opacity: 0.7 }}>LINE {activeLine.paylineIndex + 1}</span>
              <span style={{ opacity: 0.4 }}>•</span>
              <span>{sym?.emoji ?? '?'} ×{activeLine.matchCount}</span>
              <span style={{ opacity: 0.4 }}>•</span>
              <span style={{ color: '#FFD700' }}>{formatCredits(activeLine.payout)}</span>
            </div>

            {/* Total win */}
            <motion.div
              className="font-black text-4xl tabular-nums"
              style={{
                background: 'linear-gradient(90deg, #FFD700, #FF8C00, #FFD700)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 10px rgba(255,190,0,0.7))',
                backgroundSize: '200%',
              }}
              animate={{
                scale: [1, 1.05, 1],
                backgroundPosition: ['0%', '100%', '0%'],
              }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              {formatCredits(totalWin)}
            </motion.div>

            {/* Multi-line dots */}
            {winLines.length > 1 && (
              <div className="flex gap-1 mt-0.5">
                {winLines.map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: i === highlightedIdx ? 14 : 5,
                      height: 3,
                      borderRadius: 2,
                      background: i === highlightedIdx ? lineColor : `${lineColor}33`,
                      transition: 'width 0.25s, background 0.25s',
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
