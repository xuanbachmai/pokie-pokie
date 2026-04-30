'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';

/** Single buffalo silhouette running across the screen */
function RunningBuffalo({ delay, y, size, flip }: {
  delay: number; y: string; size: number; flip: boolean;
}) {
  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{ top: y, fontSize: size, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.8))' }}
      initial={{ x: flip ? '110vw' : '-20vw', opacity: 0 }}
      animate={{ x: flip ? '-20vw' : '110vw', opacity: [0, 1, 1, 0] }}
      transition={{ duration: 1.4, delay, ease: 'easeIn' }}
    >
      🐃
    </motion.div>
  );
}

/** Dust cloud particle */
function DustPuff({ x, y, delay }: { x: string; y: string; delay: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none rounded-full"
      style={{
        left: x, top: y,
        width: 80, height: 80,
        background: 'radial-gradient(circle, rgba(180,120,40,0.55) 0%, transparent 70%)',
        filter: 'blur(8px)',
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: [0, 2.5, 3], opacity: [0, 0.7, 0] }}
      transition={{ duration: 1.0, delay, ease: 'easeOut' }}
    />
  );
}

export function BuffaloRushEffect() {
  const phase          = useGameStore(s => s.phase);
  const activeBonusType = useGameStore(s => s.activeBonusType);
  const nuggetCount    = useGameStore(s => s.nuggetCount);

  const [visible, setVisible] = useState(false);
  const [count,   setCount]   = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (phase === 'BONUS_ACTIVE' && activeBonusType === 'NUGGET_HOLD') {
      setCount(nuggetCount);
      setVisible(true);
      timerRef.current = setTimeout(() => setVisible(false), 2600);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [phase, activeBonusType, nuggetCount]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 overflow-hidden pointer-events-none"
          style={{ zIndex: 200 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6 } }}
        >
          {/* ── Background flash ─────────────────────────────── */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at 50% 60%, rgba(180,90,0,0.85) 0%, rgba(60,20,0,0.97) 70%)',
            }}
            animate={{
              background: [
                'radial-gradient(ellipse at 50% 60%, rgba(200,100,0,0.95) 0%, rgba(60,20,0,0.98) 70%)',
                'radial-gradient(ellipse at 50% 60%, rgba(140,60,0,0.8) 0%, rgba(30,10,0,0.95) 70%)',
                'radial-gradient(ellipse at 50% 60%, rgba(200,100,0,0.85) 0%, rgba(50,15,0,0.97) 70%)',
              ],
            }}
            transition={{ duration: 0.8, repeat: 2, ease: 'easeInOut' }}
          />

          {/* ── Ground shake wrapper ──────────────────────────── */}
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center gap-4"
            animate={{ x: [0, -6, 6, -4, 4, -2, 2, 0], y: [0, 3, -3, 2, -2, 1, -1, 0] }}
            transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
          >
            {/* ── BUFFALO RUSH title ────────────────────────────── */}
            <motion.div
              className="text-center"
              initial={{ scale: 3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.35, ease: [0.22, 1.2, 0.36, 1] }}
            >
              <div
                className="text-5xl font-black tracking-widest uppercase"
                style={{
                  background: 'linear-gradient(180deg, #FFD700 0%, #FF8C00 50%, #CC4400 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 20px rgba(255,140,0,0.9))',
                  textShadow: 'none',
                  letterSpacing: '0.12em',
                }}
              >
                🐃 BUFFALO RUSH 🐃
              </div>
            </motion.div>

            {/* ── Buffalo count badge ───────────────────────────── */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0,  opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.4, ease: 'backOut' }}
              className="flex items-center gap-2 px-6 py-2 rounded-full"
              style={{
                background: 'rgba(0,0,0,0.6)',
                border: '2px solid rgba(255,140,0,0.7)',
                boxShadow: '0 0 24px rgba(255,100,0,0.5)',
              }}
            >
              <span className="text-2xl">🐃</span>
              <span
                className="text-3xl font-black tabular-nums"
                style={{ color: '#FFD700', textShadow: '0 0 12px rgba(255,215,0,0.8)' }}
              >
                {count}
              </span>
              <span
                className="text-base font-black tracking-widest uppercase"
                style={{ color: 'rgba(255,215,0,0.7)' }}
              >
                BUFFALO!
              </span>
            </motion.div>

            {/* ── "HOLD & COLLECT" subtitle ─────────────────────── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm font-black tracking-[0.3em] uppercase"
              style={{ color: 'rgba(255,180,60,0.75)' }}
            >
              HOLD &amp; COLLECT
            </motion.div>
          </motion.div>

          {/* ── Running buffaloes ─────────────────────────────── */}
          <RunningBuffalo delay={0.1}  y="60%" size={52} flip={false} />
          <RunningBuffalo delay={0.25} y="68%" size={44} flip={false} />
          <RunningBuffalo delay={0.4}  y="72%" size={36} flip={false} />
          <RunningBuffalo delay={0.55} y="64%" size={48} flip={true}  />
          <RunningBuffalo delay={0.7}  y="70%" size={40} flip={true}  />

          {/* ── Dust clouds along ground ──────────────────────── */}
          {['15%','30%','50%','65%','80%'].map((x, i) => (
            <DustPuff key={i} x={x} y="72%" delay={0.1 + i * 0.15} />
          ))}

          {/* ── Top & bottom decorative bars ─────────────────── */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-1.5"
            style={{ background: 'linear-gradient(90deg, transparent, #FF8C00, #FFD700, #FF8C00, transparent)' }}
            animate={{ scaleX: [0, 1] }}
            transition={{ duration: 0.4 }}
          />
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-1.5"
            style={{ background: 'linear-gradient(90deg, transparent, #CC4400, #FF8C00, #CC4400, transparent)' }}
            animate={{ scaleX: [0, 1] }}
            transition={{ duration: 0.4, delay: 0.1 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
