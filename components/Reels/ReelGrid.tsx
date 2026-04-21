'use client';
import { useGameStore } from '@/store/gameStore';
import { ReelStrip } from './ReelStrip';

export function ReelGrid() {
  const visibleGrid = useGameStore(s => s.visibleGrid);
  const spinningReels = useGameStore(s => s.spinningReels);
  const winLines = useGameStore(s => s.lastWinLines);

  return (
    <div className="relative w-full">
      {/* Decorative frame */}
      <div className="absolute inset-0 rounded-2xl border-2 border-gold-dark/40 pointer-events-none z-10" />
      <div className="absolute inset-[-2px] rounded-2xl border border-gold/20 pointer-events-none z-10" />

      <div
        className="grid gap-1.5 p-3 rounded-2xl"
        style={{
          gridTemplateColumns: 'repeat(5, 1fr)',
          background: 'linear-gradient(180deg, rgba(10,0,0,0.95) 0%, rgba(20,0,5,0.98) 100%)',
          height: '260px',
        }}
      >
        {visibleGrid.map((colSymbols, col) => (
          <ReelStrip
            key={col}
            col={col}
            symbols={colSymbols}
            spinning={spinningReels[col]}
            winLines={winLines}
          />
        ))}
      </div>
    </div>
  );
}
