'use client';
import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { formatCredits } from '@/lib/utils';
import { JackpotTier } from '@/types/game';
import { JACKPOT_CONFIGS } from '@/lib/constants';

interface Props {
  tier: JackpotTier;
  value: number;
}

export function JackpotTicker({ tier, value }: Props) {
  const config = JACKPOT_CONFIGS[tier];
  const prevValue = useRef(value);

  const spring = useSpring(value, { stiffness: 60, damping: 20 });

  useEffect(() => {
    spring.set(value);
    prevValue.current = value;
  }, [value, spring]);

  const displayed = useTransform(spring, (v) => formatCredits(v));

  return (
    <div
      className="flex flex-col items-center px-3 py-1.5 rounded-lg flex-1"
      style={{ background: config.bgColor, border: `1px solid ${config.color}44` }}
    >
      <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: config.color }}>
        {config.label}
      </span>
      <motion.span
        className="text-sm font-bold tabular-nums"
        style={{ color: config.color }}
      >
        {displayed}
      </motion.span>
    </div>
  );
}
