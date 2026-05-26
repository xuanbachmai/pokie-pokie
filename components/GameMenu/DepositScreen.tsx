'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { formatCredits } from '@/lib/utils';
import { trackDeposit } from '@/lib/analytics';

const DEPOSIT_OPTIONS = [
  { amount: 10,   label: '$10',   emoji: '🪙', color: '#B87333', glow: 'rgba(184,115,51,0.6)' },
  { amount: 20,   label: '$20',   emoji: '💵', color: '#4CAF50', glow: 'rgba(76,175,80,0.6)'  },
  { amount: 50,   label: '$50',   emoji: '💶', color: '#2196F3', glow: 'rgba(33,150,243,0.6)' },
  { amount: 100,  label: '$100',  emoji: '💴', color: '#9C27B0', glow: 'rgba(156,39,176,0.6)' },
  { amount: 200,  label: '$200',  emoji: '💷', color: '#FFD700', glow: 'rgba(255,215,0,0.6)'  },
  { amount: 500,  label: '$500',  emoji: '🏆', color: '#FF8C00', glow: 'rgba(255,140,0,0.6)'  },
  { amount: 1000, label: '$1000', emoji: '💎', color: '#FF4D6D', glow: 'rgba(255,77,109,0.6)' },
];

export function DepositScreen({ onComplete, isTopUp = false }: { onComplete: () => void; isTopUp?: boolean }) {
  const addDeposit      = useGameStore(s => s.addDeposit);
  const completeDeposit = useGameStore(s => s.completeDeposit);
  const balance         = useGameStore(s => s.balance);
  const [chosen, setChosen]     = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  function handleSelect(amount: number) {
    setChosen(amount);
  }

  function handleConfirm() {
    if (chosen === null) return;
    addDeposit(chosen);
    trackDeposit(chosen);
    setConfirmed(true);
    setTimeout(() => {
      if (!isTopUp) completeDeposit();
      onComplete();
    }, 900);
  }

  return (
    <motion.div
      className="fixed inset-0 z-[400] flex flex-col items-center justify-center p-6"
      style={{ background: 'linear-gradient(160deg, #010e05 0%, #020E06 50%, #011408 100%)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Ambient glow orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #FFD700, transparent)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #00C07A, transparent)', filter: 'blur(50px)' }} />
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

        {/* Divider */}
        <div className="w-full h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,192,122,0.4), transparent)' }} />

        {/* Heading */}
        <div className="text-center">
          <div className="text-base font-black tracking-widest" style={{ color: '#00C07A' }}>
            💰 {isTopUp ? 'ADD MORE CREDITS' : 'SELECT DEPOSIT AMOUNT'}
          </div>
          <div className="text-[10px] text-gray-500 mt-1">Credits are for entertainment only · No real money</div>
        </div>

        {/* Deposit chips grid */}
        <div className="grid grid-cols-4 gap-3 w-full">
          {DEPOSIT_OPTIONS.map((opt) => {
            const isSelected = chosen === opt.amount;
            return (
              <motion.button
                key={opt.amount}
                onClick={() => handleSelect(opt.amount)}
                className="flex flex-col items-center justify-center py-3 rounded-2xl font-black"
                style={{
                  background: isSelected
                    ? `radial-gradient(circle at center, ${opt.color}44, ${opt.color}18)`
                    : 'rgba(255,255,255,0.04)',
                  border: `2px solid ${isSelected ? opt.color : 'rgba(255,255,255,0.08)'}`,
                  boxShadow: isSelected ? `0 0 20px ${opt.glow}` : 'none',
                }}
                whileTap={{ scale: 0.93 }}
                animate={isSelected ? { scale: [1, 1.04, 1] } : { scale: 1 }}
                transition={{ duration: 0.6, repeat: isSelected ? Infinity : 0 }}
              >
                <span className="text-xl">{opt.emoji}</span>
                <span className="text-[11px] mt-1" style={{ color: isSelected ? opt.color : '#aaa' }}>
                  {opt.label}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Disclaimer — shown on both first deposit and top-up */}
        <div
          className="w-full rounded-xl px-4 py-3 text-center"
          style={{ background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.15)' }}
        >
          <div className="flex items-center justify-center gap-1.5 mb-1.5">
            <span className="text-yellow-400 text-sm">⚠️</span>
            <span className="text-[10px] font-black tracking-widest uppercase text-yellow-400">
              Simulation Only
            </span>
          </div>
          <p className="text-[10px] text-gray-400 leading-[1.65]">
            This is a <span className="text-white font-bold">free educational demo</span> — no real money, no real prizes.
            The mechanics here (variable rewards, near-misses, free spins) mirror those engineered into real machines.
            If it feels compelling, <span className="text-white">that&apos;s by design.</span>{' '}
            Do your own research and play with responsibility.
          </p>
          <p className="text-[10px] text-gray-600 mt-1.5">
            🇦🇺 Built in Australia · For demonstration purposes only
          </p>
        </div>

        {/* Current balance */}
        {balance > 0 && (
          <div className="text-sm text-gray-400">
            Current balance: <span className="font-black text-yellow-400">{formatCredits(balance)}</span>
          </div>
        )}

        {/* Confirm button */}
        <AnimatePresence>
          {chosen !== null && !confirmed && (
            <motion.button
              onClick={handleConfirm}
              className="w-full py-4 rounded-2xl font-black text-black text-lg tracking-widest"
              style={{ background: 'linear-gradient(90deg, #FFD700, #FF8C00)' }}
              initial={{ opacity: 0, y: 12 }}
              animate={{
                opacity: 1, y: 0,
                boxShadow: ['0 0 20px rgba(255,215,0,0.4)', '0 0 40px rgba(255,215,0,0.9)', '0 0 20px rgba(255,215,0,0.4)'],
              }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.9, repeat: Infinity }}
              whileTap={{ scale: 0.96 }}
            >
              DEPOSIT {formatCredits(chosen!)} →
            </motion.button>
          )}
        </AnimatePresence>

        {/* Confirmed animation */}
        <AnimatePresence>
          {confirmed && (
            <motion.div
              className="text-2xl font-black text-center"
              style={{ color: '#4CAF50', textShadow: '0 0 20px rgba(76,175,80,0.8)' }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1.2 }}
              exit={{ opacity: 0 }}
            >
              ✓ CREDITED!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Skip / back to game */}
        {(balance > 0 || isTopUp) && (
          <button
            onClick={() => { if (!isTopUp) completeDeposit(); onComplete(); }}
            className="text-[11px] text-gray-600 underline hover:text-gray-400 transition-colors"
          >
            {isTopUp ? '← Back to game' : `Continue with ${formatCredits(balance)}`}
          </button>
        )}
      </div>
    </motion.div>
  );
}
