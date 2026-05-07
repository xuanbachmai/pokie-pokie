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
    <div className="flex flex-col items-center gap-5 p-6">
      {/* Scatter icon + title */}
      <motion.div
        className="flex flex-col items-center gap-1"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        <div className="text-5xl">🥁</div>
        <div className="text-xl font-black tracking-widest" style={{ color: '#CD7F32', fontFamily: 'var(--font-jackpot)', letterSpacing: '0.18em' }}>
          TRỐNG ĐỒNG
        </div>
        <div className="text-xs text-gray-400 tracking-widest uppercase">Free Games Triggered!</div>
      </motion.div>

      {/* 6 game counter display */}
      <div className="flex flex-col items-center gap-1">
        <div className="text-7xl font-black" style={{ color: '#FFD700', fontFamily: 'var(--font-amount)', lineHeight: 1 }}>
          {freeSpinsRemaining}
        </div>
        <div className="text-[11px] text-gray-400 uppercase tracking-widest">Free Games</div>
      </div>

      {/* Multiplier badge */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-full"
        style={{ background: 'rgba(0,200,100,0.12)', border: '1px solid rgba(0,200,100,0.4)' }}>
        <span className="text-sm font-black" style={{ color: '#00E090' }}>ALL WINS ×{freeSpinsMultiplier}</span>
      </div>

      <motion.button
        onClick={handleStart}
        className="px-12 py-3 rounded-full font-black text-black text-base tracking-widest"
        style={{ background: 'linear-gradient(90deg, #B8860B, #FFD700, #B8860B)', fontFamily: 'var(--font-jackpot)' }}
        whileTap={{ scale: 0.95 }}
        animate={{ boxShadow: ['0 0 12px rgba(255,215,0,0.4)', '0 0 28px rgba(255,215,0,0.8)', '0 0 12px rgba(255,215,0,0.4)'] }}
        transition={{ duration: 1.1, repeat: Infinity }}
      >
        START!
      </motion.button>
    </div>
  );
}
