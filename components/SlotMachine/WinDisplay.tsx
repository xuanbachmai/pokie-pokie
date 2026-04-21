'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { formatCredits } from '@/lib/utils';

export function WinDisplay() {
  const phase = useGameStore(s => s.phase);
  const totalWin = useGameStore(s => s.totalWinThisSpin);
  const creditWin = useGameStore(s => s.creditWin);
  const openGamble = useGameStore(s => s.openGamble);
  const pendingWin = useGameStore(s => s.pendingWin);

  const show = phase === 'WIN_DISPLAY' && totalWin > 0;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center z-30 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="pointer-events-auto flex flex-col items-center gap-3 px-8 py-5 rounded-2xl"
            style={{ background: 'rgba(0,0,0,0.9)', border: '2px solid rgba(255,215,0,0.6)' }}
            initial={{ scale: 0.5, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <div className="text-xs uppercase tracking-widest text-yellow-400">You Win!</div>
            <motion.div
              className="text-4xl font-bold text-gold"
              initial={{ scale: 0.8 }}
              animate={{ scale: [0.8, 1.2, 1] }}
              transition={{ duration: 0.5 }}
            >
              {formatCredits(totalWin)}
            </motion.div>
            <div className="flex gap-3 mt-1">
              <button
                onClick={creditWin}
                className="px-5 py-2 rounded-full bg-gold text-black font-bold text-sm hover:bg-yellow-300 transition-colors"
              >
                COLLECT
              </button>
              <button
                onClick={openGamble}
                className="px-5 py-2 rounded-full border border-crimson text-crimson font-bold text-sm hover:bg-crimson hover:text-white transition-colors"
              >
                GAMBLE
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
