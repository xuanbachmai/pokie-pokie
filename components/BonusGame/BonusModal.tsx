'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { DragonEggBonus } from './DragonEggBonus';
import { LuckyLanterns } from './LuckyLanterns';
import { FreeSpinsBanner } from './FreeSpinsBanner';

export function BonusModal() {
  const phase = useGameStore(s => s.phase);
  const activeBonusType = useGameStore(s => s.activeBonusType);
  const lastScatterResult = useGameStore(s => s.lastScatterResult);
  const triggerBonus = useGameStore(s => s.triggerBonus);

  const showTrigger = phase === 'BONUS_TRIGGER';
  const showActive = phase === 'BONUS_ACTIVE';
  const visible = showTrigger || showActive;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative max-w-sm w-full mx-4 rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #0D0D0D, #1A0A0A)',
              border: '2px solid rgba(255,215,0,0.4)',
              boxShadow: '0 0 40px rgba(255,215,0,0.2)',
            }}
            initial={{ scale: 0.8, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 40 }}
            transition={{ type: 'spring', stiffness: 250, damping: 20 }}
          >
            {showTrigger && (
              <div className="flex flex-col items-center gap-6 p-8">
                <motion.div
                  className="text-5xl"
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: 3 }}
                >
                  ☯️
                </motion.div>
                <div className="text-2xl font-black text-white text-center">
                  BONUS TRIGGERED!
                </div>
                <div className="text-yellow-400 text-center text-sm">
                  {lastScatterResult?.count} Yin-Yang symbols found!
                </div>
                <motion.button
                  onClick={triggerBonus}
                  className="px-10 py-3 rounded-full bg-yellow-400 text-black font-black"
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    boxShadow: [
                      '0 0 10px rgba(255,215,0,0.4)',
                      '0 0 30px rgba(255,215,0,0.8)',
                      '0 0 10px rgba(255,215,0,0.4)',
                    ],
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  PLAY BONUS!
                </motion.button>
              </div>
            )}

            {showActive && activeBonusType === 'DRAGON_EGG' && (
              <DragonEggBonus onClose={() => {}} />
            )}
            {showActive && activeBonusType === 'LUCKY_LANTERNS' && (
              <LuckyLanterns onClose={() => {}} />
            )}
            {showActive && activeBonusType === 'FREE_SPINS' && (
              <FreeSpinsBanner onClose={() => {}} />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
