'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LANTERN_PRIZES } from '@/lib/constants';
import { resolveLanterns } from '@/lib/bonusEngine';
import { useGameStore } from '@/store/gameStore';
import { formatCredits } from '@/lib/utils';

interface Props {
  onClose: () => void;
}

const MAX_PICKS = 3;

export function LuckyLanterns({ onClose }: Props) {
  const resolveBonus = useGameStore(s => s.resolveBonus);
  const [picks, setPicks] = useState<number[]>([]);
  const [revealed, setRevealed] = useState<boolean[]>(Array(8).fill(false));
  const done = picks.length >= MAX_PICKS;

  function handlePick(idx: number) {
    if (done || picks.includes(idx)) return;
    const newPicks = [...picks, idx];
    const newRevealed = [...revealed];
    newRevealed[idx] = true;
    setPicks(newPicks);
    setRevealed(newRevealed);
  }

  function handleCollect() {
    const amount = resolveLanterns(picks);
    resolveBonus({ type: 'LUCKY_LANTERNS', amount });
    onClose();
  }

  const totalWin = resolveLanterns(picks);

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <div className="text-2xl font-black text-red-400">🏮 Lucky Lanterns!</div>
      <p className="text-gray-300 text-sm">
        Pick {MAX_PICKS - picks.length} more lantern{MAX_PICKS - picks.length !== 1 ? 's' : ''}
      </p>

      <div className="grid grid-cols-4 gap-3">
        {LANTERN_PRIZES.map((credits, idx) => (
          <motion.button
            key={idx}
            onClick={() => handlePick(idx)}
            disabled={done || picks.includes(idx)}
            className="relative w-16 h-20 flex flex-col items-center justify-center rounded-xl border-2"
            style={{
              borderColor: picks.includes(idx) ? '#FF4D6D' : 'rgba(255,77,109,0.3)',
              background: revealed[idx]
                ? 'radial-gradient(circle, rgba(220,20,60,0.2), transparent)'
                : 'linear-gradient(135deg, #1a0005, #3d0010)',
              cursor: done || picks.includes(idx) ? 'default' : 'pointer',
            }}
            whileHover={!done && !picks.includes(idx) ? { scale: 1.08, y: -3 } : {}}
          >
            {revealed[idx] ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex flex-col items-center"
              >
                <span className="text-2xl">🪙</span>
                <span className="text-xs font-bold text-gold">{formatCredits(credits)}</span>
              </motion.div>
            ) : (
              <span className="text-3xl">🏮</span>
            )}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {picks.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <span className="text-gray-400 text-sm">Running total: </span>
            <span className="text-gold font-black text-xl">{formatCredits(totalWin)}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {done && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={handleCollect}
          className="px-8 py-2.5 rounded-full bg-crimson text-white font-black text-sm hover:bg-red-500 transition-colors"
        >
          COLLECT {formatCredits(totalWin)}!
        </motion.button>
      )}
    </div>
  );
}
