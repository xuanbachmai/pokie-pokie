'use client';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';

export function FreeSpinsBanner({ onClose }: { onClose: () => void }) {
  const freeSpinsRemaining = useGameStore(s => s.freeSpinsRemaining);
  const freeSpinsMultiplier = useGameStore(s => s.freeSpinsMultiplier);
  const resolveBonus = useGameStore(s => s.resolveBonus);

  function handleStart() {
    resolveBonus({
      type: 'FREE_SPINS',
      config: { spinsAwarded: freeSpinsRemaining, multiplier: freeSpinsMultiplier },
    });
    onClose();
  }

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <motion.div
        className="text-3xl font-black text-amber-600"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 0.8, repeat: Infinity }}
      >
        🥁 FREE GAMES! 🥁
      </motion.div>
      <div className="flex gap-8 text-center">
        <div>
          <div className="text-5xl font-black text-yellow-400">{freeSpinsRemaining}</div>
          <div className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Free Spins</div>
        </div>
        <div className="flex items-center text-gray-600 text-2xl">×</div>
        <div>
          <div className="text-5xl font-black text-emerald-400">{freeSpinsMultiplier}x</div>
          <div className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Multiplier</div>
        </div>
      </div>
      <p className="text-gray-400 text-sm text-center">All wins multiplied by {freeSpinsMultiplier}x! 🐃 More Trâu!</p>
      <motion.button
        onClick={handleStart}
        className="px-10 py-3 rounded-full font-black text-black text-sm"
        style={{ background: 'linear-gradient(90deg, #CC0000, #FF8C00)' }}
        whileTap={{ scale: 0.95 }}
        animate={{ boxShadow: ['0 0 10px rgba(204,0,0,0.3)', '0 0 25px rgba(204,0,0,0.7)', '0 0 10px rgba(204,0,0,0.3)'] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        START FREE GAMES!
      </motion.button>
    </div>
  );
}
