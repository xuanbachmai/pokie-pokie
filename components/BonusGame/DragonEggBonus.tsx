'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DRAGON_EGG_MULTIPLIERS } from '@/lib/constants';
import { resolveDragonEgg } from '@/lib/bonusEngine';
import { useGameStore } from '@/store/gameStore';
import { formatCredits } from '@/lib/utils';

interface Props {
  onClose: () => void;
}

export function DragonEggBonus({ onClose }: Props) {
  const betPerLine = useGameStore(s => s.betPerLine);
  const activeLines = useGameStore(s => s.activeLines);
  const resolveBonus = useGameStore(s => s.resolveBonus);
  const [picked, setPicked] = useState<number | null>(null);
  const [prize, setPrize] = useState<number>(0);
  const [revealed, setRevealed] = useState<boolean[]>(Array(5).fill(false));

  const totalBet = betPerLine * activeLines;

  function handlePick(idx: number) {
    if (picked !== null) return;
    const amount = resolveDragonEgg(idx, totalBet);
    const newRevealed = Array(5).fill(true);
    setPicked(idx);
    setPrize(amount);
    setRevealed(newRevealed);
  }

  function handleCollect() {
    resolveBonus({ type: 'DRAGON_EGG', amount: prize, multiplier: DRAGON_EGG_MULTIPLIERS[picked!] });
    onClose();
  }

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <div className="text-2xl font-black text-yellow-400">🐉 Dragon Egg Bonus!</div>
      <p className="text-gray-300 text-sm">Pick an egg to reveal your prize</p>

      <div className="flex gap-4 flex-wrap justify-center">
        {DRAGON_EGG_MULTIPLIERS.map((mult, idx) => (
          <motion.button
            key={idx}
            onClick={() => handlePick(idx)}
            disabled={picked !== null}
            className="relative w-20 h-24 flex flex-col items-center justify-center rounded-xl border-2 transition-all"
            style={{
              borderColor: picked === idx ? '#FFD700' : 'rgba(255,215,0,0.3)',
              background: revealed[idx]
                ? picked === idx
                  ? 'radial-gradient(circle, rgba(255,215,0,0.3), transparent)'
                  : 'rgba(100,100,100,0.2)'
                : 'linear-gradient(135deg, #1a0a00, #3d1a00)',
              cursor: picked !== null ? 'default' : 'pointer',
            }}
            whileHover={picked === null ? { scale: 1.08, y: -4 } : {}}
            whileTap={picked === null ? { scale: 0.95 } : {}}
          >
            {revealed[idx] ? (
              <motion.div
                initial={{ scale: 0, rotateY: 90 }}
                animate={{ scale: 1, rotateY: 0 }}
                className="flex flex-col items-center"
              >
                <span className="text-3xl">💰</span>
                <span className="text-xs font-bold text-yellow-400">{mult}x</span>
                <span className="text-[10px] text-gray-300">{formatCredits(totalBet * mult)}</span>
              </motion.div>
            ) : (
              <span className="text-4xl">🥚</span>
            )}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {picked !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="text-lg text-white">
              You won <span className="text-gold font-black text-2xl">{formatCredits(prize)}</span>!
            </div>
            <button
              onClick={handleCollect}
              className="px-8 py-2.5 rounded-full bg-gold text-black font-black text-sm hover:bg-yellow-300 transition-colors"
            >
              COLLECT PRIZE!
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
