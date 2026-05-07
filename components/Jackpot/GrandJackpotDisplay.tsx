'use client';
import { motion, AnimatePresence, useSpring, useTransform, useAnimate } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useJackpotStore } from '@/store/jackpotStore';
import { formatCredits } from '@/lib/utils';

// Firework burst for the celebration overlay
const FW_COLS = ['#FF4D6D','#FFD700','#00BFFF','#FF8C00','#A855F7','#22D3EE','#F97316'];
function FwBurst({ x, y, delay }: { x: string; y: string; delay: number }) {
  const n = 12;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 0, height: 0, pointerEvents: 'none' }}>
      {Array.from({ length: n }, (_, i) => {
        const angle = (i / n) * 2 * Math.PI;
        const r = 80 + Math.random() * 50;
        return (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: 8, height: 8, borderRadius: '50%',
              background: FW_COLS[i % FW_COLS.length],
              left: -4, top: -4,
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1.4 }}
            animate={{ x: Math.cos(angle) * r, y: Math.sin(angle) * r, opacity: 0, scale: 0 }}
            transition={{ duration: 0.9 + Math.random() * 0.3, delay, ease: 'easeOut' }}
          />
        );
      })}
    </div>
  );
}

export function GrandJackpotDisplay() {
  const grandJackpotValue      = useJackpotStore(s => s.grandJackpotValue);
  const grandJackpotWon        = useJackpotStore(s => s.grandJackpotWon);
  const grandJackpotWonAmount  = useJackpotStore(s => s.grandJackpotWonAmount);
  const grandJackpotTotalPrize = useJackpotStore(s => s.grandJackpotTotalPrize);
  const clearGrandJackpot      = useJackpotStore(s => s.clearGrandJackpot);

  const spring    = useSpring(grandJackpotValue, { stiffness: 60, damping: 20 });
  const displayed = useTransform(spring, (v) => formatCredits(v));
  const prevValue = useRef(grandJackpotValue);
  const [amountScope, animateAmount] = useAnimate();
  const [borderScope, animateBorder] = useAnimate();

  useEffect(() => {
    if (grandJackpotValue !== prevValue.current && grandJackpotValue > prevValue.current) {
      spring.set(grandJackpotValue);
      prevValue.current = grandJackpotValue;
      animateAmount(amountScope.current, {
        scale: [1, 1.14, 1],
        filter: [
          'drop-shadow(0 0 6px rgba(255,215,0,0.5))',
          'drop-shadow(0 0 24px rgba(255,215,0,1.0)) drop-shadow(0 0 8px rgba(255,255,255,0.8))',
          'drop-shadow(0 0 6px rgba(255,215,0,0.5))',
        ],
      }, { duration: 0.38, ease: 'easeOut' });
      animateBorder(borderScope.current, {
        boxShadow: [
          '0 0 20px rgba(0,160,70,0.25), 0 0 8px rgba(255,215,0,0.15)',
          '0 0 60px rgba(255,215,0,0.9), 0 0 28px rgba(0,200,100,0.6)',
          '0 0 20px rgba(0,160,70,0.25), 0 0 8px rgba(255,215,0,0.15)',
        ],
      }, { duration: 0.4, ease: 'easeOut' });
    } else {
      prevValue.current = grandJackpotValue;
    }
  }, [grandJackpotValue, spring]); // eslint-disable-line react-hooks/exhaustive-deps

  // Slot prizes = total - jackpot component
  const slotPrizes = grandJackpotTotalPrize > grandJackpotWonAmount
    ? parseFloat((grandJackpotTotalPrize - grandJackpotWonAmount).toFixed(2))
    : 0;

  return (
    <>
      {/* ── Grand Jackpot Meter ── */}
      <motion.div
        ref={borderScope}
        className="relative w-full rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #001a08 0%, #002d12 50%, #001a08 100%)',
          border: '2px solid rgba(255,215,0,0.5)',
          boxShadow: '0 0 24px rgba(0,160,70,0.3), 0 0 8px rgba(255,215,0,0.2)',
        }}
        animate={{
          boxShadow: [
            '0 0 20px rgba(0,160,70,0.25), 0 0 8px rgba(255,215,0,0.15)',
            '0 0 35px rgba(0,200,90,0.45), 0 0 16px rgba(255,215,0,0.35)',
            '0 0 20px rgba(0,160,70,0.25), 0 0 8px rgba(255,215,0,0.15)',
          ],
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, transparent, #00C07A, #FFD700, #00C07A, transparent)' }} />
        <div className="flex flex-col items-center py-3 px-4 gap-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">🐉</span>
            <span
              className="text-base tracking-[0.22em] uppercase"
              style={{ color: '#FFD700', textShadow: '0 0 10px rgba(255,215,0,0.6)', fontFamily: 'var(--font-jackpot)' }}
            >
              Grand Jackpot
            </span>
            <span className="text-lg">🐉</span>
          </div>
          <motion.span
            ref={amountScope}
            className="text-4xl tabular-nums font-bold"
            style={{
              fontFamily: 'var(--font-amount)',
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
          <div className="text-[9px] tracking-widest uppercase" style={{ color: 'rgba(255,215,0,0.4)' }}>
            Fill all 15 Buffalo positions to win
          </div>
        </div>
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, transparent, #FFD700, #00C07A, #FFD700, transparent)' }} />
      </motion.div>

      {/* ── WIN CELEBRATION overlay ── */}
      <AnimatePresence>
        {grandJackpotWon && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden"
            style={{ background: 'rgba(0,0,0,0.93)', backdropFilter: 'blur(8px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* CSS fireworks */}
            {[
              { x: '15%',  y: '12%', delay: 0    },
              { x: '78%',  y: '10%', delay: 0.2  },
              { x: '50%',  y: '25%', delay: 0.4  },
              { x: '8%',   y: '48%', delay: 0.6  },
              { x: '88%',  y: '42%', delay: 0.8  },
              { x: '30%',  y: '68%', delay: 1.0  },
              { x: '68%',  y: '72%', delay: 1.2  },
              { x: '50%',  y: '82%', delay: 1.4  },
              { x: '20%',  y: '30%', delay: 1.6  },
              { x: '80%',  y: '28%', delay: 1.8  },
            ].map((b, i) => (
              <FwBurst key={i} x={b.x} y={b.y} delay={b.delay} />
            ))}

            {/* Screen flash */}
            <motion.div
              className="absolute inset-0"
              style={{ background: 'rgba(255,220,50,0.45)' }}
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
            />

            {/* Content */}
            <div className="relative flex flex-col items-center gap-5 px-8 text-center" style={{ zIndex: 1 }}>
              {/* Fireworks emojis */}
              <motion.div
                className="text-5xl"
                animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                🎆🎇🎆
              </motion.div>

              {/* GRAND JACKPOT title */}
              <motion.div
                className="font-black"
                style={{
                  fontSize: 48,
                  background: 'linear-gradient(90deg, #FFD700, #FF4D6D, #FFD700)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundSize: '200%',
                  filter: 'drop-shadow(0 0 14px rgba(255,215,0,0.8))',
                  lineHeight: 1.1,
                }}
                animate={{ backgroundPosition: ['0%', '100%', '0%'], scale: [1, 1.06, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                GRAND JACKPOT!
              </motion.div>

              {/* Prize breakdown */}
              <div className="flex flex-col items-center gap-2 w-full">
                {/* Total prize — biggest number */}
                <motion.div
                  className="font-black tabular-nums"
                  style={{
                    fontSize: 52,
                    background: 'linear-gradient(90deg, #FFF8DC, #FFD700, #FFF8DC)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0 0 20px rgba(255,215,0,0.9))',
                    fontFamily: 'var(--font-amount)',
                  }}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 16, delay: 0.3 }}
                >
                  {formatCredits(grandJackpotTotalPrize)}
                </motion.div>

                {/* Breakdown line */}
                {slotPrizes > 0 && (
                  <motion.div
                    className="flex flex-col items-center gap-1 text-sm"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <div className="flex items-center gap-3 text-[13px]">
                      <span className="text-yellow-300">🏆 Jackpot</span>
                      <span className="text-gray-400">+</span>
                      <span className="text-amber-400">🐃 Rush prizes</span>
                    </div>
                    <div className="flex items-center gap-2 font-black">
                      <span style={{ color: '#FF4D6D' }}>{formatCredits(grandJackpotWonAmount)}</span>
                      <span className="text-gray-500">+</span>
                      <span style={{ color: '#FFD700' }}>{formatCredits(slotPrizes)}</span>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="text-gray-400 text-sm max-w-xs">
                All 15 Buffalo positions filled!<br />
                Mekong bows before the stampede! 🐃🏆
              </div>

              <motion.button
                onClick={clearGrandJackpot}
                className="px-12 py-4 rounded-full font-black text-black text-lg"
                style={{ background: 'linear-gradient(90deg, #FFD700, #FF8C00)' }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(255,215,0,0.5)',
                    '0 0 55px rgba(255,215,0,1)',
                    '0 0 20px rgba(255,215,0,0.5)',
                  ],
                }}
                transition={{ type: 'tween', duration: 0.8, repeat: Infinity }}
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
