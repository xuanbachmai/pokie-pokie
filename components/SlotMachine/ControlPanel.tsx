'use client';
import { useGameStore } from '@/store/gameStore';
import { useSpinSequence } from '@/hooks/useSpinSequence';
import { BET_OPTIONS } from '@/lib/constants';
import { formatCredits } from '@/lib/utils';
import { motion } from 'framer-motion';

export function ControlPanel() {
  const balance = useGameStore(s => s.balance);
  const betPerLine = useGameStore(s => s.betPerLine);
  const activeLines = useGameStore(s => s.activeLines);
  const phase = useGameStore(s => s.phase);
  const autoSpinActive = useGameStore(s => s.autoSpinActive);
  const freeSpinsRemaining = useGameStore(s => s.freeSpinsRemaining);
  const isFreeSpinActive = useGameStore(s => s.isFreeSpinActive);
  const setBetIndex = useGameStore(s => s.setBetIndex);
  const setLines = useGameStore(s => s.setLines);
  const stopAutoSpin = useGameStore(s => s.stopAutoSpin);
  const startAutoSpin = useGameStore(s => s.startAutoSpin);
  const { startSpin } = useSpinSequence();

  const canSpin = (phase === 'IDLE' || phase === 'FREE_SPINS') && !autoSpinActive;
  const totalBet = betPerLine * activeLines;
  const currentBetIndex = BET_OPTIONS.indexOf(betPerLine);

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Balance and free spins */}
      <div className="flex justify-between items-center px-2">
        <div className="text-sm">
          <span className="text-gray-400 text-xs">BALANCE </span>
          <span className="text-gold font-bold">{formatCredits(balance)}</span>
        </div>
        {isFreeSpinActive && (
          <div className="text-sm">
            <span className="text-emerald-400 font-bold animate-pulse">
              FREE SPINS: {freeSpinsRemaining}
            </span>
          </div>
        )}
        <div className="text-sm">
          <span className="text-gray-400 text-xs">TOTAL BET </span>
          <span className="text-white font-bold">{formatCredits(totalBet)}</span>
        </div>
      </div>

      {/* Bet and Lines controls */}
      <div className="flex gap-3 items-center">
        <div className="flex-1 flex flex-col gap-1">
          <span className="text-[10px] text-gray-400 uppercase tracking-widest">Bet/Line</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setBetIndex(Math.max(0, currentBetIndex - 1))}
              className="w-7 h-7 rounded-full border border-gold/40 text-gold font-bold text-sm hover:bg-gold/20 transition-colors"
              disabled={currentBetIndex === 0}
            >−</button>
            <span className="text-white font-bold text-sm flex-1 text-center">{formatCredits(betPerLine)}</span>
            <button
              onClick={() => setBetIndex(Math.min(BET_OPTIONS.length - 1, currentBetIndex + 1))}
              className="w-7 h-7 rounded-full border border-gold/40 text-gold font-bold text-sm hover:bg-gold/20 transition-colors"
              disabled={currentBetIndex === BET_OPTIONS.length - 1}
            >+</button>
          </div>
        </div>

        {/* SPIN Button */}
        <motion.button
          onClick={startSpin}
          disabled={!canSpin || balance < totalBet}
          className="relative w-20 h-20 rounded-full font-black text-sm text-black disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: 'linear-gradient(135deg, #FFD700, #FF8C00)',
            boxShadow: canSpin ? '0 0 20px rgba(255,165,0,0.6), 0 4px 12px rgba(0,0,0,0.5)' : 'none',
          }}
          whileTap={canSpin ? { scale: 0.92 } : {}}
          animate={canSpin ? { boxShadow: ['0 0 20px rgba(255,165,0,0.4)', '0 0 35px rgba(255,165,0,0.8)', '0 0 20px rgba(255,165,0,0.4)'] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {phase === 'SPINNING' ? '⏳' : '🎰'}
          <span className="block text-[10px] tracking-widest">SPIN</span>
        </motion.button>

        <div className="flex-1 flex flex-col gap-1">
          <span className="text-[10px] text-gray-400 uppercase tracking-widest">Lines</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLines(activeLines - 1)}
              className="w-7 h-7 rounded-full border border-gold/40 text-gold font-bold text-sm hover:bg-gold/20 transition-colors"
              disabled={activeLines === 1}
            >−</button>
            <span className="text-white font-bold text-sm flex-1 text-center">{activeLines}</span>
            <button
              onClick={() => setLines(activeLines + 1)}
              className="w-7 h-7 rounded-full border border-gold/40 text-gold font-bold text-sm hover:bg-gold/20 transition-colors"
              disabled={activeLines === 25}
            >+</button>
          </div>
        </div>
      </div>

      {/* Auto spin controls */}
      <div className="flex gap-2 justify-center">
        {[10, 25, 50, 100].map(count => (
          <button
            key={count}
            onClick={() => autoSpinActive ? stopAutoSpin() : startAutoSpin(count)}
            className="px-3 py-1 rounded-full text-xs font-bold border transition-colors"
            style={{
              borderColor: 'rgba(255,215,0,0.3)',
              background: autoSpinActive ? 'rgba(255,215,0,0.2)' : 'transparent',
              color: autoSpinActive ? '#FFD700' : '#888',
            }}
          >
            {autoSpinActive ? 'STOP' : `AUTO ${count}`}
          </button>
        ))}
      </div>
    </div>
  );
}
