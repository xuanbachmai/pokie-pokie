'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { formatCredits } from '@/lib/utils';

export function WinDisplay() {
  const phase = useGameStore(s => s.phase);
  const totalWin = useGameStore(s => s.totalWinThisSpin);

  // Show briefly after a spin resolves; vanishes as soon as the next spin starts (totalWin resets to 0)
  const show = phase === 'IDLE' && totalWin > 0;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="absolute inset-0 flex items-end justify-center pb-4 pointer-events-none z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
        >
          <motion.div
            className="font-black text-4xl"
            style={{
              background: 'linear-gradient(90deg, #FFD700, #FF8C00, #FFD700)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 10px rgba(255,190,0,0.7))',
            }}
            animate={{
              scale: [1, 1.06, 1],
            }}
            transition={{ duration: 0.7, repeat: Infinity }}
          >
            {formatCredits(totalWin)}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
