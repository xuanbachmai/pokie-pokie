'use client';
import { motion } from 'framer-motion';
import { SYMBOLS } from '@/lib/constants';
import { SymbolId } from '@/types/game';

interface Props {
  symbolId: SymbolId;
  highlighted: boolean;
  spinning: boolean;
}

export function SymbolCell({ symbolId, highlighted, spinning }: Props) {
  const sym = SYMBOLS[symbolId];

  return (
    <motion.div
      className="relative flex items-center justify-center w-full h-full rounded-lg border-2 select-none overflow-hidden"
      style={{
        borderColor: highlighted ? sym.color : 'rgba(255,215,0,0.2)',
        background: highlighted
          ? `radial-gradient(circle at center, ${sym.color}33, transparent 70%)`
          : 'rgba(0,0,0,0.4)',
        boxShadow: highlighted ? `0 0 20px ${sym.color}88` : 'none',
      }}
      animate={highlighted ? { scale: [1, 1.05, 1] } : { scale: 1 }}
      transition={{ duration: 0.4, repeat: highlighted ? Infinity : 0 }}
    >
      {spinning ? (
        <motion.div
          className="text-4xl"
          animate={{ opacity: [0.3, 1, 0.3], y: [-5, 0, 5] }}
          transition={{ duration: 0.15, repeat: Infinity }}
        >
          {sym.emoji}
        </motion.div>
      ) : (
        <motion.div
          className="text-4xl"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.15 }}
        >
          {sym.emoji}
        </motion.div>
      )}

      {sym.isWild && (
        <div className="absolute bottom-0.5 left-0 right-0 text-center text-[8px] font-bold text-orange-400">
          WILD
        </div>
      )}
      {sym.isScatter && (
        <div className="absolute bottom-0.5 left-0 right-0 text-center text-[8px] font-bold text-gray-300">
          SCATTER
        </div>
      )}
    </motion.div>
  );
}
