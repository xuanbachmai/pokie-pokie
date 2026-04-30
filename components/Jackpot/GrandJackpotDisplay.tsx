'use client';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useJackpotStore } from '@/store/jackpotStore';
import { formatCredits } from '@/lib/utils';

export function GrandJackpotDisplay() {
  const grandJackpotValue = useJackpotStore(s => s.grandJackpotValue);
  const grandJackpotWon   = useJackpotStore(s => s.grandJackpotWon);
  const clearGrandJackpot = useJackpotStore(s => s.clearGrandJackpot);

  const spring    = useSpring(grandJackpotValue, { stiffness: 60, damping: 20 });
  const displayed = useTransform(spring, (v) => formatCredits(v));
  const prevValue = useRef(grandJackpotValue);

  useEffect(() => {
    if (grandJackpotValue !== prevValue.current) {
      spring.set(grandJackpotValue);
      prevValue.current = grandJackpotValue;
    }
  }, [grandJackpotValue, spring]);

  return (
    <>
      {/* ── Grand Jackpot Meter ── */}
      <motion.div
        className="relative w-full rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1a0000 0%, #2d0000 50%, #1a0000 100%)',
          border: '2px solid rgba(255,215,0,0.5)',
          boxShadow: '0 0 24px rgba(204,0,0,0.3), 0 0 8px rgba(255,215,0,0.2)',
        }}
        animate={{
          boxShadow: [
            '0 0 20px rgba(204,0,0,0.25), 0 0 8px rgba(255,215,0,0.15)',
            '0 0 35px rgba(204,0,0,0.45), 0 0 16px rgba(255,215,0,0.35)',
            '0 0 20px rgba(204,0,0,0.25), 0 0 8px rgba(255,215,0,0.15)',
          ],
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Decorative top bar */}
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, transparent, #FFD700, #CC0000, #FFD700, transparent)' }} />

        <div className="flex flex-col items-center py-3 px-4 gap-1">
          {/* Label row with dragons */}
          <div className="flex items-center gap-2">
            <span className="text-lg">🐉</span>
            <span
              className="text-xs font-black tracking-[0.25em] uppercase"
              style={{ color: '#FFD700', textShadow: '0 0 10px rgba(255,215,0,0.6)' }}
            >
              Grand Jackpot
            </span>
            <span className="text-lg">🐉</span>
          </div>

          {/* Amount */}
          <motion.span
            className="text-4xl font-black tabular-nums"
            style={{
              background: 'linear-gradient(90deg, #FFD700, #FFF8DC, #FFD700)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundSize: '200%',
              filter: 'drop-shadow(0 0 6px rgba(255,215,0,0.5))',
            }}
            animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          >
            {displayed}
          </motion.span>

          {/* Sub-label */}
          <div
            className="text-[9px] tracking-widest uppercase"
            style={{ color: 'rgba(255,215,0,0.4)' }}
          >
            Fill all 15 Buffalo positions to win
          </div>
        </div>

        {/* Decorative bottom bar */}
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, transparent, #CC0000, #FFD700, #CC0000, transparent)' }} />
      </motion.div>

      {/* ── WIN CELEBRATION overlay ── */}
      <AnimatePresence>
        {grandJackpotWon && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(6px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex flex-col items-center gap-6 px-6 text-center">
              {/* Fireworks emoji strip */}
              <motion.div
                className="text-5xl"
                animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                🎆🎇🎆
              </motion.div>

              <motion.div
                className="text-5xl font-black"
                style={{
                  background: 'linear-gradient(90deg, #FFD700, #FF4D6D, #FFD700)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundSize: '200%',
                  textShadow: 'none',
                  filter: 'drop-shadow(0 0 12px rgba(255,215,0,0.8))',
                }}
                animate={{ backgroundPosition: ['0%', '100%', '0%'], scale: [1, 1.08, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                GRAND JACKPOT!
              </motion.div>

              <div className="text-3xl font-black text-yellow-400">
                {formatCredits(grandJackpotValue)}
              </div>

              <div className="text-gray-300 text-sm max-w-xs">
                All 15 Buffalo positions filled!<br />
                Mekong bows before the stampede! 🐃🏆
              </div>

              <motion.button
                onClick={clearGrandJackpot}
                className="px-12 py-4 rounded-full font-black text-black text-lg"
                style={{ background: 'linear-gradient(90deg, #FFD700, #FF8C00)' }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  boxShadow: ['0 0 20px rgba(255,215,0,0.5)', '0 0 50px rgba(255,215,0,1)', '0 0 20px rgba(255,215,0,0.5)'],
                }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                COLLECT JACKPOT 🏆
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
