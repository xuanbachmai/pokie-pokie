'use client';
import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { SYMBOLS } from '@/lib/constants';
import { formatCredits } from '@/lib/utils';

const CYCLE_MS = 1600; // ms per winning line before advancing

export function WinDisplay() {
  const phase                = useGameStore(s => s.phase);
  const totalWin             = useGameStore(s => s.totalWinThisSpin);
  const winLines             = useGameStore(s => s.lastWinLines);
  const highlightedIdx       = useGameStore(s => s.highlightedWinLineIdx);
  const setHighlightedWinLine = useGameStore(s => s.setHighlightedWinLine);

  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const idxRef     = useRef(0);

  // Start / stop cycling when win lines change or phase changes
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;

    if (phase !== 'IDLE' || !winLines.length || totalWin <= 0) {
      setHighlightedWinLine(null);
      return;
    }

    // Start at line 0
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
  }, [phase, winLines.length, totalWin]);

  const show = phase === 'IDLE' && totalWin > 0 && winLines.length > 0;
  const activeLine = show && highlightedIdx !== null ? winLines[highlightedIdx] : null;

  if (!show) return null;

  const sym      = activeLine ? SYMBOLS[activeLine.matchedSymbol] : null;
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
            {/* Line badge + symbol info */}
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

            {/* Total win amount */}
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

            {/* Multi-line indicator dots */}
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
