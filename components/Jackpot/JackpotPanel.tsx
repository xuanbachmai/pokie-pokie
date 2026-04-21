'use client';
import { useJackpotStore } from '@/store/jackpotStore';
import { JackpotTier } from '@/types/game';
import { JackpotTicker } from './JackpotTicker';
import { AnimatePresence, motion } from 'framer-motion';
import { JACKPOT_CONFIGS } from '@/lib/constants';

export function JackpotPanel() {
  const values = useJackpotStore(s => s.values);
  const lastWonTier = useJackpotStore(s => s.lastWonTier);
  const clearLastWon = useJackpotStore(s => s.clearLastWon);

  return (
    <div className="relative">
      <div className="flex gap-2 w-full">
        {Object.values(JackpotTier).map(tier => (
          <JackpotTicker key={tier} tier={tier} value={values[tier]} />
        ))}
      </div>

      <AnimatePresence>
        {lastWonTier && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center z-50 rounded-lg"
            style={{ background: 'rgba(0,0,0,0.85)' }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div className="text-center">
              <div className="text-2xl font-bold animate-pulse" style={{ color: JACKPOT_CONFIGS[lastWonTier].color }}>
                🎉 {lastWonTier} JACKPOT! 🎉
              </div>
              <div className="text-gold text-lg mt-1">
                {(values[lastWonTier] + JACKPOT_CONFIGS[lastWonTier].seedAmount).toFixed(2)}
              </div>
              <button
                onClick={clearLastWon}
                className="mt-2 px-4 py-1 rounded-full text-sm font-bold text-black"
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
