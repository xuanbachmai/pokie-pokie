'use client';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { SpinningReel, CELL_HEIGHT } from './SpinningReel';

const STOP_DELAYS = [800, 1100, 1400, 1700, 2200];

export function ReelGrid() {
  const visibleGrid = useGameStore(s => s.visibleGrid);
  const pendingGrid = useGameStore(s => s.pendingGrid);
  const spinningReels = useGameStore(s => s.spinningReels);
  const winLines = useGameStore(s => s.lastWinLines);
  const nuggetCount = useGameStore(s => s.nuggetCount);

  return (
    <div className="relative w-full">
      {/* Decorative frame */}
      <div className="absolute inset-0 rounded-2xl border-2 border-gold-dark/40 pointer-events-none z-10" />
      <div className="absolute inset-[-2px] rounded-2xl border border-gold/20 pointer-events-none z-10" />

      <div
        className="grid gap-2 p-3 rounded-2xl"
        style={{
          gridTemplateColumns: 'repeat(5, 1fr)',
          background: 'linear-gradient(180deg, rgba(10,0,0,0.95) 0%, rgba(20,0,5,0.98) 100%)',
          height: CELL_HEIGHT * 3 + 4 * 2 + 24, // 3 cells + 2 gaps (4px each) + padding
        }}
      >
        {Array.from({ length: 5 }, (_, col) => (
          <SpinningReel
            key={col}
            col={col}
            finalSymbols={pendingGrid?.[col] ?? visibleGrid[col]}
            spinning={spinningReels[col]}
            stopDelay={STOP_DELAYS[col]}
            winLines={winLines}
          />
        ))}
      </div>

      {nuggetCount > 0 && (
        <motion.div
          className="flex items-center justify-center gap-2 mt-1 text-sm"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="font-black" style={{ color: '#8B5E3C' }}>🐃 ×{nuggetCount}</span>
          <span className="text-gray-500 text-xs">
            {nuggetCount >= 15
              ? 'GRAND JACKPOT!'
              : nuggetCount >= 12
              ? 'MAXI BONUS!'
              : nuggetCount >= 10
              ? 'MAJOR BONUS!'
              : nuggetCount >= 8
              ? 'MINI BONUS!'
              : nuggetCount >= 6
              ? 'BUFFALO RUSH!'
              : 'buffaloes'}
          </span>
        </motion.div>
      )}
    </div>
  );
}
