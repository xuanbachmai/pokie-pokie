'use client';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { SpinningReel, CELL_HEIGHT } from './SpinningReel';
import { PaylineOverlay } from './PaylineOverlay';

export function ReelGrid() {
  const visibleGrid        = useGameStore(s => s.visibleGrid);
  const pendingGrid        = useGameStore(s => s.pendingGrid);
  const spinningReels      = useGameStore(s => s.spinningReels);
  const winLines           = useGameStore(s => s.lastWinLines);
  const nuggetCount        = useGameStore(s => s.nuggetCount);
  const anticipationCols   = useGameStore(s => s.anticipationCols);
  const reelStopDelays     = useGameStore(s => s.reelStopDelays);
  const phase              = useGameStore(s => s.phase);
  const isFreeSpinActive   = useGameStore(s => s.isFreeSpinActive);
  const freeSpinsTotal     = useGameStore(s => s.freeSpinsTotal);
  const freeSpinsPlayed    = useGameStore(s => s.freeSpinsPlayed);

  const isSpinning = phase === 'SPINNING';

  return (
    <div className="relative w-full">

      {/* ── Chrome cabinet outer frame ── */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          inset: -6,
          borderRadius: 22,
          zIndex: 15,
          border: '3px solid transparent',
          background: [
            'linear-gradient(#111, #111) padding-box',
            'linear-gradient(160deg, #888 0%, #444 25%, #ccc 50%, #444 75%, #888 100%) border-box',
          ].join(', '),
          boxShadow: [
            '0 0 0 1px rgba(0,0,0,0.8)',
            '0 4px 24px rgba(0,0,0,0.9)',
            'inset 0 1px 0 rgba(255,255,255,0.08)',
          ].join(', '),
        }}
      />

      {/* ── Animated LED strip ── */}
      <motion.div
        className="absolute pointer-events-none"
        style={{ inset: -6, borderRadius: 22, zIndex: 14 }}
        animate={{
          boxShadow: [
            '0 0 8px rgba(0,192,122,0.35), inset 0 0 8px rgba(0,192,122,0.08)',
            '0 0 22px rgba(255,215,0,0.60), inset 0 0 14px rgba(255,215,0,0.12)',
            '0 0 8px rgba(0,192,122,0.35), inset 0 0 8px rgba(0,192,122,0.08)',
          ],
        }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* ── Corner screws ── */}
      {[
        { top: -2, left:  -2 },
        { top: -2, right: -2 },
        { bottom: -2, left:  -2 },
        { bottom: -2, right: -2 },
      ].map((pos, i) => (
        <div
          key={i}
          className="absolute pointer-events-none"
          style={{
            ...pos,
            width: 10,
            height: 10,
            borderRadius: '50%',
            zIndex: 22,
            background: 'radial-gradient(circle at 35% 35%, #ddd 0%, #888 45%, #444 100%)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.8)',
          }}
        />
      ))}

      {/* ── Reel area ── */}
      <div
        className="grid gap-2 p-3 rounded-2xl"
        style={{
          gridTemplateColumns: 'repeat(5, 1fr)',
          background: 'linear-gradient(180deg, rgba(1,8,3,0.97) 0%, rgba(2,14,6,0.99) 100%)',
          height: CELL_HEIGHT * 3 + 4 * 2 + 24,
          position: 'relative',
          zIndex: 20,  // must be above chrome frame (zIndex 15) so symbols are visible
        }}
      >
        {Array.from({ length: 5 }, (_, col) => {
          const isAnticipating = anticipationCols.includes(col);
          const anticType = isAnticipating
            ? (col === 3 ? 'scatter' : 'spin') as 'scatter' | 'spin'
            : false;
          return (
            <SpinningReel
              key={col}
              col={col}
              finalSymbols={pendingGrid?.[col] ?? visibleGrid[col]}
              spinning={spinningReels[col]}
              stopDelay={reelStopDelays[col]}
              winLines={winLines}
              anticipation={anticType}
            />
          );
        })}

        {/* ── Glass glare overlay ── */}
        <div
          style={{
            position: 'absolute', inset: 0, borderRadius: 14, pointerEvents: 'none', zIndex: 30,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.055) 0%, transparent 45%, transparent 70%, rgba(255,255,255,0.02) 100%)',
          }}
        />

        {/* ── Payline overlay ── */}
        <PaylineOverlay />

        {/* ── Free games counter — bottom centre of reel frame ── */}
        {isFreeSpinActive && (
          <motion.div
            className="absolute bottom-2 left-0 right-0 flex items-center justify-center pointer-events-none"
            style={{ zIndex: 35 }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div
              className="flex items-center gap-2 px-4 py-1 rounded-full"
              style={{
                background: 'rgba(0,0,0,0.78)',
                border: '1px solid rgba(255,215,0,0.55)',
              }}
            >
              <span
                className="text-amber-400 text-[11px] font-black tracking-widest"
                style={{ animation: 'pulse 1.4s ease-in-out infinite' }}
              >
                🥁 FREE GAMES
              </span>
              <span className="text-yellow-300 font-black text-xl tabular-nums leading-none">
                {freeSpinsPlayed + 1}
                <span className="text-gray-400 font-normal text-sm">/{freeSpinsTotal}</span>
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── LED strip pulse on spin ── */}
      {isSpinning && (
        <motion.div
          className="absolute pointer-events-none"
          style={{ inset: -6, borderRadius: 22, zIndex: 13 }}
          animate={{
            boxShadow: [
              '0 0 30px rgba(0,220,120,0.0)',
              '0 0 50px rgba(0,220,120,0.5)',
              '0 0 30px rgba(0,220,120,0.0)',
            ],
          }}
          transition={{ duration: 0.45, repeat: Infinity }}
        />
      )}

      {/* ── Buffalo count badge ── */}
      {nuggetCount > 0 && (
        <motion.div
          className="flex items-center justify-center gap-2 mt-1 text-sm"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="font-black" style={{ color: '#8B5E3C' }}>🐃 ×{nuggetCount}</span>
          <span className="text-gray-500 text-xs">
            {nuggetCount >= 15 ? 'GRAND JACKPOT!'
              : nuggetCount >= 12 ? 'MAXI BONUS!'
              : nuggetCount >= 10 ? 'MAJOR BONUS!'
              : nuggetCount >= 8  ? 'MINI BONUS!'
              : nuggetCount >= 6  ? 'BUFFALO RUSH!'
              : 'buffaloes'}
          </span>
        </motion.div>
      )}
    </div>
  );
}
