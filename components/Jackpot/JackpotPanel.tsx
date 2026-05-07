'use client';
import { useJackpotStore } from '@/store/jackpotStore';
import { JackpotTier } from '@/types/game';
import { JackpotTicker } from './JackpotTicker';
import { GrandJackpotDisplay } from './GrandJackpotDisplay';
import { AnimatePresence, motion, useSpring, useTransform, useAnimate } from 'framer-motion';
import { JACKPOT_CONFIGS } from '@/lib/constants';
import { formatCredits } from '@/lib/utils';
import { useEffect, useRef } from 'react';

/** Large MEGA BONUS display — styled similarly to GrandJackpotDisplay */
function MegaJackpotDisplay() {
  const values = useJackpotStore(s => s.values);
  const value  = values[JackpotTier.GRAND];
  const cfg    = JACKPOT_CONFIGS[JackpotTier.GRAND];

  const spring    = useSpring(value, { stiffness: 60, damping: 20 });
  const displayed = useTransform(spring, (v) => formatCredits(v));
  const prevValue = useRef(value);
  const [amountScope, animateAmount] = useAnimate();
  const [containerScope, animateContainer] = useAnimate();

  useEffect(() => {
    if (value !== prevValue.current && value > prevValue.current) {
      spring.set(value);
      prevValue.current = value;
      // Flash the amount up on each tick
      animateAmount(amountScope.current, {
        scale: [1, 1.18, 1],
        filter: [
          `drop-shadow(0 0 5px ${cfg.color}88)`,
          `drop-shadow(0 0 18px ${cfg.color}FF) drop-shadow(0 0 6px #FFFFFFCC)`,
          `drop-shadow(0 0 5px ${cfg.color}88)`,
        ],
      }, { duration: 0.35, ease: 'easeOut' });
      // Flash the container border
      animateContainer(containerScope.current, {
        boxShadow: [
          `0 0 16px ${cfg.color}22`,
          `0 0 48px ${cfg.color}BB, 0 0 20px ${cfg.color}66`,
          `0 0 16px ${cfg.color}22`,
        ],
      }, { duration: 0.4, ease: 'easeOut' });
    } else {
      prevValue.current = value;
    }
  }, [value, spring, cfg.color]);

  return (
    <motion.div
      ref={containerScope}
      className="relative w-full rounded-2xl overflow-hidden"
      style={{
        background: `linear-gradient(135deg, #00100a 0%, #001c12 50%, #00100a 100%)`,
        border: `2px solid ${cfg.color}66`,
        boxShadow: `0 0 20px ${cfg.color}33`,
      }}
      animate={{
        boxShadow: [
          `0 0 16px ${cfg.color}22, 0 0 6px ${cfg.color}18`,
          `0 0 32px ${cfg.color}55, 0 0 14px ${cfg.color}33`,
          `0 0 16px ${cfg.color}22, 0 0 6px ${cfg.color}18`,
        ],
      }}
      transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Top accent bar */}
      <div
        className="h-1 w-full"
        style={{ background: `linear-gradient(90deg, transparent, ${cfg.color}, #CC0000, ${cfg.color}, transparent)` }}
      />

      <div className="flex flex-col items-center py-2.5 px-4 gap-0.5">
        {/* Label */}
        <div className="flex items-center gap-2">
          <span className="text-base">🔥</span>
          <span
            className="text-base tracking-[0.22em] uppercase"
            style={{ color: cfg.color, textShadow: `0 0 10px ${cfg.color}88`, fontFamily: 'var(--font-jackpot)' }}
          >
            {cfg.label}
          </span>
          <span className="text-base">🔥</span>
        </div>

        {/* Amount — flashes on each tick-up */}
        <motion.span
          ref={amountScope}
          className="text-3xl tabular-nums font-bold"
          style={{
            fontFamily: 'var(--font-amount)',
            background: `linear-gradient(90deg, ${cfg.color}, #fff8, ${cfg.color})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundSize: '200%',
            filter: `drop-shadow(0 0 5px ${cfg.color}88)`,
          }}
          animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          {displayed}
        </motion.span>

      </div>

      {/* Bottom accent bar */}
      <div
        className="h-1 w-full"
        style={{ background: `linear-gradient(90deg, transparent, #CC0000, ${cfg.color}, #CC0000, transparent)` }}
      />
    </motion.div>
  );
}

/** The three smaller fixed jackpots: MINI, MINOR (MAJOR BONUS), MAJOR (MAXI BONUS) */
const SMALL_TIERS = [JackpotTier.MINI, JackpotTier.MINOR, JackpotTier.MAJOR] as const;

export function JackpotPanel() {
  const values       = useJackpotStore(s => s.values);
  const lastWonTier  = useJackpotStore(s => s.lastWonTier);
  const clearLastWon = useJackpotStore(s => s.clearLastWon);

  return (
    <div className="flex flex-col gap-2 relative">

      {/* ── Grand Jackpot (fill all 15 slots) — top, biggest ── */}
      <GrandJackpotDisplay />

      {/* ── MEGA BONUS (live progressive) — second row, also large ── */}
      <MegaJackpotDisplay />

      {/* ── MINI · MAJOR · MAXI — compact row ── */}
      <div className="flex gap-1.5 w-full">
        {SMALL_TIERS.map(tier => (
          <JackpotTicker key={tier} tier={tier} value={values[tier]} />
        ))}
      </div>

      {/* ── Tier win overlay (for MINI/MINOR/MAJOR wins) ── */}
      <AnimatePresence>
        {lastWonTier && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center z-50 rounded-2xl"
            style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div className="text-center px-4">
              <motion.div
                className="text-2xl font-black"
                style={{ color: JACKPOT_CONFIGS[lastWonTier].color }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.6, repeat: Infinity }}
              >
                🎉 {JACKPOT_CONFIGS[lastWonTier].label}! 🎉
              </motion.div>
              <div className="text-yellow-300 text-xl font-black mt-1">
                {formatCredits(values[lastWonTier])}
              </div>
              <button
                onClick={clearLastWon}
                className="mt-3 px-6 py-2 rounded-full text-sm font-black text-black"
                style={{ background: JACKPOT_CONFIGS[lastWonTier].color }}
              >
                COLLECT!
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
