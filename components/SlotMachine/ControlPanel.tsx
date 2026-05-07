'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useSpinSequence } from '@/hooks/useSpinSequence';
import { getDenomConfig } from '@/lib/constants';
import { formatCredits } from '@/lib/utils';
import { motion } from 'framer-motion';
import { getAudio } from '@/lib/audioEngine';

/* ── Animated win counter ────────────────────────────────────────────────── */
function AnimatedWin({ target }: { target: number }) {
  const [displayed, setDisplayed] = useState(target);
  const rafRef   = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const fromRef  = useRef<number>(0);
  const toRef    = useRef<number>(target);

  useEffect(() => {
    if (target === toRef.current && displayed === target) return;
    toRef.current  = target;
    fromRef.current = displayed;

    if (target <= 0) { setDisplayed(0); return; }

    startRef.current = performance.now();
    const duration   = Math.min(2200, Math.max(700, target * 40));

    function tick(now: number) {
      const elapsed  = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      const val      = fromRef.current + (toRef.current - fromRef.current) * eased;
      setDisplayed(parseFloat(val.toFixed(2)));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    }

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return <>{formatCredits(displayed)}</>;
}

/* ── Reusable info tile ─────────────────────────────────────────────────── */
function InfoBox({ label, value, highlight, sub, animateWin }: {
  label: string; value: string; highlight?: boolean; sub?: string; animateWin?: number;
}) {
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center py-3 px-2 rounded-xl"
      style={{ background: 'rgba(0,14,6,0.60)', border: '1px solid rgba(0,192,122,0.14)' }}
    >
      <span className="text-[10px] uppercase tracking-widest text-gray-500">{label}</span>
      <motion.span
        key={animateWin !== undefined ? animateWin : value}
        className="text-lg font-black mt-0.5 tabular-nums"
        style={{ color: highlight ? '#FFD700' : '#fff' }}
        initial={highlight ? { scale: 1.25 } : {}}
        animate={{ scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        {animateWin !== undefined ? <AnimatedWin target={animateWin} /> : value}
      </motion.span>
      {sub && <span className="text-[9px] text-gray-600 mt-0.5">{sub}</span>}
    </div>
  );
}

/* ── Stepper control: [◀] label [▶] ──────────────────────────────────────
   Cycles through an array of valid values using prev/next buttons.        */
function Stepper({
  label, values, current, onPrev, onNext, disabled, color, suffix,
}: {
  label: string;
  values: number[];
  current: number;
  onPrev: () => void;
  onNext: () => void;
  disabled?: boolean;
  color: string;
  suffix?: string;
}) {
  const idx     = values.indexOf(current);
  const canPrev = idx > 0;
  const canNext = idx < values.length - 1;

  const btnBase: React.CSSProperties = {
    width: 40,
    height: 40,
    borderRadius: 10,
    border: `2px solid ${color}55`,
    background: `${color}18`,
    color,
    fontWeight: 900,
    fontSize: 18,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'opacity 0.15s, transform 0.1s',
    flexShrink: 0,
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] uppercase tracking-widest text-center" style={{ color: 'rgba(0,192,122,0.6)' }}>
        {label}
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          disabled={!canPrev || disabled}
          style={{ ...btnBase, opacity: !canPrev || disabled ? 0.25 : 1 }}
          onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.88)')}
          onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
          onTouchStart={e => (e.currentTarget.style.transform = 'scale(0.88)')}
          onTouchEnd={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          ‹
        </button>

        <motion.div
          key={current}
          className="flex-1 flex flex-col items-center justify-center rounded-xl py-1.5"
          style={{
            minWidth: 60,
            background: `${color}18`,
            border: `2px solid ${color}55`,
            boxShadow: `0 0 10px ${color}33`,
          }}
          initial={{ scale: 0.88, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.15 }}
        >
          <span className="font-black text-xl tabular-nums" style={{ color }}>
            {suffix ? `${suffix}${current}` : current}
          </span>
        </motion.div>

        <button
          onClick={onNext}
          disabled={!canNext || disabled}
          style={{ ...btnBase, opacity: !canNext || disabled ? 0.25 : 1 }}
          onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.88)')}
          onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
          onTouchStart={e => (e.currentTarget.style.transform = 'scale(0.88)')}
          onTouchEnd={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          ›
        </button>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1 justify-center">
        {values.map((v, i) => (
          <div
            key={v}
            style={{
              width: i === idx ? 12 : 5,
              height: 3,
              borderRadius: 2,
              background: i === idx ? color : `${color}30`,
              transition: 'width 0.2s, background 0.2s',
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Main control panel ─────────────────────────────────────────────────── */
export function ControlPanel({ onChangeDenom }: { onChangeDenom?: () => void }) {
  const balance            = useGameStore(s => s.balance);
  const denomination       = useGameStore(s => s.denomination);
  const betMultiple        = useGameStore(s => s.betMultiple);
  const betPerLine         = useGameStore(s => s.betPerLine);
  const activeLines        = useGameStore(s => s.activeLines);
  const phase              = useGameStore(s => s.phase);
  const freeSpinsRemaining = useGameStore(s => s.freeSpinsRemaining);
  const freeSpinsTotal     = useGameStore(s => s.freeSpinsTotal);
  const isFreeSpinActive   = useGameStore(s => s.isFreeSpinActive);
  const totalWinThisSpin   = useGameStore(s => s.totalWinThisSpin);
  const lastWinAmount      = useGameStore(s => s.lastWinAmount);
  const setBetMultiple     = useGameStore(s => s.setBetMultiple);
  const setLines           = useGameStore(s => s.setLines);
  const openGamble         = useGameStore(s => s.openGamble);
  const takeWin            = useGameStore(s => s.takeWin);
  const forceBuffaloRush   = useGameStore(s => s.forceBuffaloRush);
  const { startSpin }      = useSpinSequence();

  const cfg      = getDenomConfig(denomination);
  const totalBet = parseFloat((betPerLine * activeLines).toFixed(2));
  const canSpin     = phase === 'IDLE' || phase === 'FREE_SPINS';
  const showTakeWin = phase === 'IDLE' && lastWinAmount > 0;
  // WIN box shows lastWinAmount when idle (keeps value visible for gamble decision)
  const winDisplay  = (phase === 'IDLE' && lastWinAmount > 0) ? lastWinAmount : totalWinThisSpin;

  return (
    <div className="flex flex-col gap-4 w-full">

      {/* ── Credit / Bet / Win ── */}
      <div className="flex gap-2">
        <InfoBox label="Credit"    value={formatCredits(balance)} />
        <InfoBox label="Total Bet" value={formatCredits(totalBet)} highlight />
        <InfoBox
          label="Win"
          value={winDisplay > 0 ? formatCredits(winDisplay) : '$0.00'}
          highlight={winDisplay > 0}
          animateWin={winDisplay}
        />
      </div>

      {/* ── SPIN row: [GAMBLE] [SPIN] [TAKE WIN] — always visible ── */}
      <div className="flex items-center justify-between gap-2">

        {/* GAMBLE — left of SPIN, always shown, active only when there's a win */}
        <motion.button
          onClick={showTakeWin ? openGamble : undefined}
          disabled={!showTakeWin}
          className="flex flex-col items-center justify-center py-3 rounded-xl font-black text-sm tracking-widest"
          style={{
            flex: 1,
            minHeight: 72,
            background: showTakeWin
              ? 'linear-gradient(135deg, #3a0060, #6a00aa)'
              : 'rgba(60,0,100,0.18)',
            border: showTakeWin
              ? '1px solid rgba(180,80,255,0.5)'
              : '1px solid rgba(180,80,255,0.15)',
            color: showTakeWin ? '#e080ff' : 'rgba(200,120,255,0.25)',
            cursor: showTakeWin ? 'pointer' : 'default',
            transition: 'background 0.3s, border 0.3s, color 0.3s',
          }}
          whileTap={showTakeWin ? { scale: 0.94 } : {}}
          animate={showTakeWin ? {
            boxShadow: [
              '0 0 8px rgba(160,60,255,0.3)',
              '0 0 20px rgba(160,60,255,0.7)',
              '0 0 8px rgba(160,60,255,0.3)',
            ],
          } : { boxShadow: '0 0 0px rgba(0,0,0,0)' }}
          transition={{ duration: 1.2, repeat: Infinity }}
        >
          <span className="text-xl leading-none" style={{ opacity: showTakeWin ? 1 : 0.22 }}>♠️</span>
          <span className="text-xs mt-0.5">GAMBLE</span>
          <span className="text-[10px] font-bold mt-0.5" style={{ opacity: showTakeWin ? 0.7 : 0.2 }}>
            {showTakeWin ? formatCredits(lastWinAmount) : '$0.00'}
          </span>
        </motion.button>

        {/* SPIN button — centre */}
        <motion.button
          onClick={() => {
            if (!canSpin) return;
            if (!isFreeSpinActive && balance < totalBet) {
              const audio = getAudio();
              if (audio.ready) audio.playInsufficientFunds();
              return;
            }
            startSpin();
          }}
          disabled={!canSpin}
          className="w-24 h-24 rounded-full font-black text-black disabled:opacity-40 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-0.5"
          style={{
            background: 'linear-gradient(135deg, #FFD700, #FF8C00)',
            boxShadow: canSpin ? '0 0 28px rgba(255,165,0,0.7), 0 6px 16px rgba(0,0,0,0.5)' : 'none',
            fontSize: 28,
            flexShrink: 0,
          }}
          whileTap={canSpin ? { scale: 0.9 } : {}}
          animate={canSpin ? {
            boxShadow: [
              '0 0 20px rgba(255,165,0,0.4)',
              '0 0 42px rgba(255,165,0,0.9)',
              '0 0 20px rgba(255,165,0,0.4)',
            ],
          } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <span>{phase === 'SPINNING' ? '⏳' : '🎰'}</span>
          <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.12em' }}>SPIN</span>
        </motion.button>

        {/* TAKE WIN — right of SPIN, always shown, active only when there's a win */}
        <motion.button
          onClick={showTakeWin ? takeWin : undefined}
          disabled={!showTakeWin}
          className="flex flex-col items-center justify-center py-3 rounded-xl font-black text-sm tracking-widest"
          style={{
            flex: 1,
            minHeight: 72,
            background: showTakeWin
              ? 'linear-gradient(135deg, #004020, #007840)'
              : 'rgba(0,60,30,0.18)',
            border: showTakeWin
              ? '1px solid rgba(0,200,100,0.5)'
              : '1px solid rgba(0,200,100,0.15)',
            color: showTakeWin ? '#40ff90' : 'rgba(60,220,130,0.25)',
            cursor: showTakeWin ? 'pointer' : 'default',
            transition: 'background 0.3s, border 0.3s, color 0.3s',
          }}
          whileTap={showTakeWin ? { scale: 0.94 } : {}}
          animate={showTakeWin ? {
            boxShadow: [
              '0 0 8px rgba(0,200,80,0.3)',
              '0 0 20px rgba(0,200,80,0.65)',
              '0 0 8px rgba(0,200,80,0.3)',
            ],
          } : { boxShadow: '0 0 0px rgba(0,0,0,0)' }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0.6 }}
        >
          <span className="text-xl leading-none" style={{ opacity: showTakeWin ? 1 : 0.22 }}>✅</span>
          <span className="text-xs mt-0.5">TAKE WIN</span>
          <span className="text-[10px] font-bold mt-0.5" style={{ opacity: showTakeWin ? 0.7 : 0.2 }}>
            {showTakeWin ? formatCredits(lastWinAmount) : '$0.00'}
          </span>
        </motion.button>
      </div>

      {/* ── Row 1: Multiple options ── */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] uppercase tracking-widest px-0.5" style={{ color: 'rgba(0,192,122,0.55)' }}>Multiple</span>
        <div className="flex gap-1.5">
          {cfg.multiples.map(m => {
            const active = m === betMultiple;
            return (
              <button
                key={m}
                onClick={() => setBetMultiple(m)}
                disabled={!canSpin}
                className="flex-1 py-1.5 rounded-lg font-black text-sm disabled:opacity-30 transition-all"
                style={{
                  background: active ? cfg.color : `${cfg.color}18`,
                  border: `1px solid ${active ? cfg.color : `${cfg.color}40`}`,
                  color: active ? '#000' : cfg.color,
                  boxShadow: active ? `0 0 10px ${cfg.color}66` : 'none',
                }}
              >
                ×{m}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Row 2: Lines options + denom chip ── */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[10px] uppercase tracking-widest" style={{ color: 'rgba(0,192,122,0.55)' }}>Lines</span>
          {onChangeDenom && (
            <button
              onClick={onChangeDenom}
              disabled={!canSpin}
              className="text-[10px] font-black rounded-full px-2 py-0.5 disabled:opacity-30 transition-all"
              style={{ background: `${cfg.color}22`, border: `1px solid ${cfg.color}55`, color: cfg.color }}
            >
              {cfg.label} · change
            </button>
          )}
        </div>
        <div className="flex gap-1.5">
          {cfg.lines.map(l => {
            const active = l === activeLines;
            return (
              <button
                key={l}
                onClick={() => setLines(l)}
                disabled={!canSpin}
                className="flex-1 py-1.5 rounded-lg font-black text-sm disabled:opacity-30 transition-all"
                style={{
                  background: active ? cfg.color : `${cfg.color}18`,
                  border: `1px solid ${active ? cfg.color : `${cfg.color}40`}`,
                  color: active ? '#000' : cfg.color,
                  boxShadow: active ? `0 0 10px ${cfg.color}66` : 'none',
                }}
              >
                {l}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── DEV cheat: force Buffalo Rush with Diamond Buffalo ── */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={forceBuffaloRush}
          className="w-full py-1.5 rounded-lg font-black text-xs tracking-widest transition-all"
          style={{
            background: 'rgba(0,191,255,0.10)',
            border: '1px dashed rgba(0,191,255,0.35)',
            color: 'rgba(0,191,255,0.65)',
          }}
        >
          💎 DEV: BUFFALO RUSH
        </button>
      )}
    </div>
  );
}
