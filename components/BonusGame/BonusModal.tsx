'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { NuggetHoldFeature } from './NuggetHoldFeature';
import { FreeSpinsBanner } from './FreeSpinsBanner';

export function BonusModal() {
  const phase               = useGameStore(s => s.phase);
  const activeBonusType     = useGameStore(s => s.activeBonusType);
  const triggerBonus        = useGameStore(s => s.triggerBonus);
  const freeSpinsRemaining  = useGameStore(s => s.freeSpinsRemaining);
  const freeSpinsMultiplier = useGameStore(s => s.freeSpinsMultiplier);

  const showTrigger  = phase === 'BONUS_TRIGGER';
  const showActive   = phase === 'BONUS_ACTIVE' && activeBonusType !== null;
  const isNuggetHold = showActive && activeBonusType === 'NUGGET_HOLD';

  return (
    <AnimatePresence>
      {/* ── BUFFALO RUSH — large card, centred, capped so it doesn't fill desktop ── */}
      {isNuggetHold && (
        <motion.div
          key="nugget-hold"
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(6px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className="relative flex flex-col overflow-hidden"
            style={{
              width: 'min(520px, 96vw)',
              maxHeight: '94vh',
              background: 'linear-gradient(160deg, #020f06, #071a0a)',
              border: '2px solid rgba(0,192,122,0.4)',
              boxShadow: '0 0 60px rgba(0,192,122,0.18)',
              borderRadius: 24,
            }}
            initial={{ scale: 0.85, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.85, y: 30 }}
            transition={{ type: 'spring', stiffness: 240, damping: 22 }}
          >
            <NuggetHoldFeature onClose={() => {}} />
          </motion.div>
        </motion.div>
      )}

      {/* ── All other bonus modals (card style) ── */}
      {(showTrigger || (showActive && !isNuggetHold)) && (
        <motion.div
          key="bonus-card"
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative max-w-sm w-full mx-4 rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #020f06, #071a0a)',
              border: '2px solid rgba(0,192,122,0.4)',
              boxShadow: '0 0 40px rgba(0,192,122,0.18)',
            }}
            initial={{ scale: 0.8, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 40 }}
            transition={{ type: 'spring', stiffness: 250, damping: 20 }}
          >
            {/* ── Scatter trigger: 3 Trống Đồng → Free Games ── */}
            {showTrigger && (
              <div className="flex flex-col items-center gap-5 p-8">
                <motion.div
                  className="text-5xl"
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.25, 1] }}
                  transition={{ duration: 0.6, repeat: 3 }}
                >
                  🥁
                </motion.div>
                <div className="text-2xl font-black text-white text-center tracking-wide">
                  FREE GAMES!
                </div>
                <div className="text-yellow-400 text-center text-xs tracking-widest uppercase">
                  Trống Đồng on all 3 middle reels
                </div>

                <div className="flex gap-6 text-center">
                  <div>
                    <div className="text-5xl font-black text-yellow-400">{freeSpinsRemaining}</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Free Spins</div>
                  </div>
                  <div className="flex items-center text-gray-600 text-2xl">×</div>
                  <div>
                    <div className="text-5xl font-black text-emerald-400">{freeSpinsMultiplier}×</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Multiplier</div>
                  </div>
                </div>

                <p className="text-gray-400 text-xs text-center">
                  All wins multiplied by {freeSpinsMultiplier}× during free games!
                </p>

                <motion.button
                  onClick={triggerBonus}
                  className="px-10 py-3 rounded-full font-black text-black"
                  style={{ background: 'linear-gradient(90deg, #FFD700, #FF8C00)' }}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    boxShadow: [
                      '0 0 10px rgba(255,215,0,0.4)',
                      '0 0 30px rgba(255,215,0,0.8)',
                      '0 0 10px rgba(255,215,0,0.4)',
                    ],
                  }}
                  transition={{ type: 'tween', duration: 1, repeat: Infinity }}
                >
                  PLAY FREE GAMES!
                </motion.button>
              </div>
            )}

            {/* ── Free Spins banner ── */}
            {showActive && activeBonusType === 'FREE_SPINS' && (
              <FreeSpinsBanner onClose={() => {}} />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
