'use client';
import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { formatCredits } from '@/lib/utils';
import { JackpotTier } from '@/types/game';
import { JACKPOT_CONFIGS } from '@/lib/constants';

interface Props {
  tier: JackpotTier;
  value: number;
}

// Only MEGA (GRAND tier) is a growing progressive jackpot.
// MINI / MAJOR / MAXI are fixed prize amounts.
const PROGRESSIVE_TIER = JackpotTier.GRAND;

export function JackpotTicker({ tier, value }: Props) {
  const config       = JACKPOT_CONFIGS[tier];
  const isProgressive = tier === PROGRESSIVE_TIER;
  const prevValue    = useRef(value);
  const [pulseKey, setPulseKey] = useState(0);

  const spring    = useSpring(value, { stiffness: isProgressive ? 60 : 120, damping: 18 });
  const displayed = useTransform(spring, (v) => formatCredits(v));

  useEffect(() => {
    if (value !== prevValue.current) {
      spring.set(value);
      if (isProgressive) setPulseKey(k => k + 1);
      prevValue.current = value;
    }
  }, [value, spring, isProgressive]);

  return (
    <motion.div
      key={pulseKey}
      className="flex flex-col items-center px-2 py-1.5 rounded-lg flex-1 relative overflow-hidden"
      style={{ background: config.bgColor, border: `1px solid ${config.color}44` }}
      animate={pulseKey > 0 ? {
        boxShadow: [`0 0 0px ${config.color}00`, `0 0 14px ${config.color}cc`, `0 0 0px ${config.color}00`],
        borderColor: [`${config.color}44`, `${config.color}ff`, `${config.color}44`],
      } : {}}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Label row */}
      <div className="flex items-center gap-1">
        <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: config.color }}>
          {config.label}
        </span>
        {/* Badge: LIVE for progressive, FIXED for static */}
        <span
          className="text-[8px] font-black rounded px-0.5 leading-tight"
          style={{
            color: isProgressive ? '#FF4D6D' : 'rgba(255,255,255,0.35)',
            background: isProgressive ? 'rgba(255,77,109,0.15)' : 'rgba(255,255,255,0.06)',
            border: `0.5px solid ${isProgressive ? 'rgba(255,77,109,0.4)' : 'rgba(255,255,255,0.12)'}`,
          }}
        >
          {isProgressive ? '▲ LIVE' : 'FIXED'}
        </span>
      </div>

      {/* Value */}
      <motion.span
        className="text-base font-black tabular-nums"
        style={{ color: config.color }}
        animate={pulseKey > 0 ? { scale: [1, 1.12, 1] } : {}}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {displayed}
      </motion.span>
    </motion.div>
  );
}
