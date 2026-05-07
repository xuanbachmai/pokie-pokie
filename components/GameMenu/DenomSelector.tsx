'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { DENOM_CONFIGS, DenomConfig, maxTotalBet, minTotalBet } from '@/lib/constants';
import { formatCredits } from '@/lib/utils';

// Coin colour gradients for each denomination
const CHIP_GRADIENTS: Record<string, string[]> = {
  '1¢':  ['#8B6914', '#D4A017', '#8B6914'],
  '2¢':  ['#6B7280', '#C0C0C0', '#6B7280'],
  '5¢':  ['#1B5E20', '#43A047', '#1B5E20'],
  '10¢': ['#0D47A1', '#1E88E5', '#0D47A1'],
  '20¢': ['#4A148C', '#8E24AA', '#4A148C'],
  '$1':  ['#7B5F00', '#FFD700', '#7B5F00'],
  '$2':  ['#7B0020', '#FF4D6D', '#7B0020'],
};

function Chip({ cfg, onSelect }: { cfg: DenomConfig; onSelect: () => void }) {
  const grads = CHIP_GRADIENTS[cfg.label] ?? ['#555', '#aaa', '#555'];
  const minBet = minTotalBet(cfg);
  const maxBet = maxTotalBet(cfg);

  return (
    <motion.button
      onClick={onSelect}
      className="flex flex-col items-center gap-2 group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.92 }}
      whileHover={{ scale: 1.06, y: -4 }}
      transition={{ type: 'spring', stiffness: 280, damping: 20 }}
    >
      {/* Coin chip */}
      <div
        className="relative w-16 h-16 rounded-full flex items-center justify-center"
        style={{
          background: `conic-gradient(${grads[0]} 0deg, ${grads[1]} 60deg, ${grads[0]} 120deg, ${grads[1]} 180deg, ${grads[0]} 240deg, ${grads[1]} 300deg, ${grads[0]} 360deg)`,
          boxShadow: `0 4px 16px ${cfg.color}66, inset 0 2px 4px rgba(255,255,255,0.2), inset 0 -2px 4px rgba(0,0,0,0.4)`,
          border: `3px solid ${grads[1]}`,
        }}
      >
        {/* Inner circle */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: `radial-gradient(circle at 35% 35%, ${grads[1]}, ${grads[0]})`,
            border: `2px solid rgba(255,255,255,0.15)`,
          }}
        >
          <span className="font-black text-[11px] text-white" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
            {cfg.label}
          </span>
        </div>

        {/* Notch marks */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
          <div
            key={deg}
            className="absolute w-1 h-1 rounded-full opacity-40"
            style={{
              background: grads[1],
              top: `calc(50% + ${Math.sin(deg * Math.PI / 180) * 27}px - 2px)`,
              left: `calc(50% + ${Math.cos(deg * Math.PI / 180) * 27}px - 2px)`,
            }}
          />
        ))}
      </div>

      {/* Bet range */}
      <div className="text-center">
        <div className="text-[9px] text-gray-500">
          {formatCredits(minBet)} – {formatCredits(maxBet)}
        </div>
        <div className="text-[8px] text-gray-600">
          {cfg.lines.length} line options
        </div>
      </div>
    </motion.button>
  );
}

export function DenomSelector({ onComplete }: { onComplete: () => void }) {
  const selectDenomination = useGameStore(s => s.selectDenomination);
  const balance = useGameStore(s => s.balance);

  function handleSelect(denom: number) {
    selectDenomination(denom);
    onComplete();
  }

  return (
    <motion.div
      className="fixed inset-0 z-[400] flex flex-col items-center justify-center p-6"
      style={{ background: 'linear-gradient(160deg, #010e05 0%, #020E06 50%, #011408 100%)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Ambient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/3 w-72 h-72 rounded-full opacity-8"
          style={{ background: 'radial-gradient(circle, #FFD700, transparent)', filter: 'blur(70px)' }} />
        <div className="absolute bottom-1/3 right-1/3 w-56 h-56 rounded-full opacity-8"
          style={{ background: 'radial-gradient(circle, #00C07A, transparent)', filter: 'blur(60px)' }} />
      </div>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-6">
        {/* Title */}
        <div className="text-center">
          <motion.h1
            className="text-3xl font-black tracking-widest"
            style={{ background: 'linear-gradient(90deg, #00C07A, #FFD700, #00C07A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundSize: '200%' }}
            animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          >
            🌾 VIETNAM MAZE
          </motion.h1>
        </div>

        {/* Balance badge */}
        <div
          className="px-5 py-2 rounded-full text-sm font-black"
          style={{ background: 'rgba(0,192,122,0.12)', border: '1px solid rgba(0,192,122,0.3)', color: '#00C07A' }}
        >
          Balance: {formatCredits(balance)}
        </div>

        {/* Divider */}
        <div className="w-full h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,192,122,0.4), transparent)' }} />

        {/* Heading */}
        <div className="text-center">
          <div className="text-sm font-black tracking-[0.2em] uppercase" style={{ color: '#00C07A' }}>
            SELECT DENOMINATION
          </div>
          <div className="text-[10px] text-gray-500 mt-1">Choose your coin value to start</div>
        </div>

        {/* Chip grid — 4 top row + 3 bottom row */}
        <div className="flex flex-col gap-4 w-full items-center">
          <div className="flex gap-4 justify-center">
            {DENOM_CONFIGS.slice(0, 4).map(cfg => (
              <Chip key={cfg.denomination} cfg={cfg} onSelect={() => handleSelect(cfg.denomination)} />
            ))}
          </div>
          <div className="flex gap-4 justify-center">
            {DENOM_CONFIGS.slice(4).map(cfg => (
              <Chip key={cfg.denomination} cfg={cfg} onSelect={() => handleSelect(cfg.denomination)} />
            ))}
          </div>
        </div>

        {/* Help text */}
        <div className="text-center text-[10px] text-gray-600 leading-relaxed max-w-xs">
          Denomination × Lines × Multiple = Total Bet<br />
          Wins are paid as multiples of your total bet
        </div>
      </div>
    </motion.div>
  );
}
