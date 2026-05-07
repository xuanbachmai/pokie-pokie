'use client';
import { useEffect } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { formatCredits } from '@/lib/utils';
import { CoinBurst } from '@/components/Effects/CoinBurst';

// Only MEGA uses the full-screen overlay — WIN/GREAT/BIG are handled in WinDisplay
const TIERS = {
  MEGA:  { label: 'MEGA WIN!', color: '#fff', glow: '#FF00FF', bg: 'linear-gradient(135deg, #1a0040, #500090)' },
} as const;

function RollingNumber({ target }: { target: number }) {
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 60, damping: 18 });

  useEffect(() => {
    mv.set(0);
    // small delay so spring starts from 0
    const t = setTimeout(() => mv.set(target), 80);
    return () => clearTimeout(t);
  }, [target, mv]);

  return (
    <motion.span>
      {spring.get() === target
        ? formatCredits(target)
        : <MotionCredits spring={spring} />}
    </motion.span>
  );
}

function MotionCredits({ spring }: { spring: ReturnType<typeof useSpring> }) {
  return (
    <motion.span>
      {useMotionValue(0) && spring && (
        <motion.span>{formatCredits(0)}</motion.span>
      )}
    </motion.span>
  );
}

// Simpler rolling number using useEffect + requestAnimationFrame
function AnimatedAmount({ amount }: { amount: number }) {
  const mv = useMotionValue(0);
  const springVal = useSpring(mv, { stiffness: 45, damping: 15 });

  useEffect(() => {
    mv.set(0);
    const t = setTimeout(() => mv.set(amount), 60);
    return () => clearTimeout(t);
  }, [amount, mv]);

  return (
    <motion.span>
      {springVal.get() === amount
        ? formatCredits(amount)
        : formatCredits(Math.max(0, springVal.get()))}
    </motion.span>
  );
}

export function BigWinBanner() {
  const tier        = useGameStore(s => s.bigWinTier);
  const winAmount   = useGameStore(s => s.totalWinThisSpin);
  const clearBigWin = useGameStore(s => s.clearBigWin);

  // Auto-dismiss MEGA after 4s
  useEffect(() => {
    if (tier !== 'MEGA') return;
    const t = setTimeout(clearBigWin, 4000);
    return () => clearTimeout(t);
  }, [tier, clearBigWin]);

  const config = tier === 'MEGA' ? TIERS.MEGA : null;

  return (
    <AnimatePresence>
      {tier && config && (
        <motion.div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center cursor-pointer"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4 } }}
          onClick={clearBigWin}
        >
          {/* Coin burst effect */}
          <CoinBurst active={!!tier} />

          {/* Edge flash ring */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ borderRadius: 0 }}
            initial={{ boxShadow: `inset 0 0 0px ${config.glow}` }}
            animate={{ boxShadow: [`inset 0 0 60px ${config.glow}88`, `inset 0 0 120px ${config.glow}44`, `inset 0 0 60px ${config.glow}88`] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />

          {/* Main banner */}
          <motion.div
            className="flex flex-col items-center gap-3 px-10 py-8 rounded-3xl"
            style={{
              background: config.bg,
              border: `3px solid ${config.glow}`,
              boxShadow: `0 0 60px ${config.glow}88, 0 0 120px ${config.glow}44`,
            }}
            initial={{ scale: 0.4, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.7, y: -20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 18 }}
          >
            {/* Tier label */}
            <motion.div
              className="font-black tracking-widest"
              style={{
                fontSize: tier === 'MEGA' ? 44 : 36,
                color: config.color,
                textShadow: `0 0 20px ${config.glow}, 0 0 40px ${config.glow}88`,
                letterSpacing: '0.15em',
              }}
              animate={tier === 'MEGA' ? {
                color: ['#FF00FF', '#FF8C00', '#FFD700', '#00FFFF', '#FF00FF'],
                textShadow: [
                  '0 0 20px #FF00FF, 0 0 40px #FF00FF88',
                  '0 0 20px #FFD700, 0 0 40px #FFD70088',
                  '0 0 20px #00FFFF, 0 0 40px #00FFFF88',
                  '0 0 20px #FF00FF, 0 0 40px #FF00FF88',
                ],
              } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            >
              {config.label}
            </motion.div>

            {/* Rolling amount */}
            <motion.div
              className="font-black tabular-nums"
              style={{
                fontSize: 42,
                color: '#fff',
                textShadow: `0 0 16px ${config.glow}`,
              }}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
            >
              <CountUp to={winAmount} />
            </motion.div>

            <div className="text-xs text-white/40 tracking-widest mt-1">TAP TO CONTINUE</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Simple count-up component
function CountUp({ to }: { to: number }) {
  const mv     = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 40, damping: 14 });
  const display = useMotionValue(formatCredits(0));

  useEffect(() => {
    mv.set(0);
    const t = setTimeout(() => mv.set(to), 100);
    return () => clearTimeout(t);
  }, [to, mv]);

  useEffect(() => {
    return spring.on('change', v => {
      display.set(formatCredits(Math.max(0, v)));
    });
  }, [spring, display]);

  return <motion.span>{display}</motion.span>;
}
