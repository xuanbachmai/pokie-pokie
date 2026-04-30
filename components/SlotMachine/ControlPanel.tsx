'use client';
import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { useSpinSequence } from '@/hooks/useSpinSequence';
import { getDenomConfig } from '@/lib/constants';
import { formatCredits } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Reusable info tile ─────────────────────────────────────────────────── */
function InfoBox({ label, value, highlight, sub }: {
  label: string; value: string; highlight?: boolean; sub?: string;
}) {
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center py-3 px-2 rounded-xl"
      style={{ background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,215,0,0.15)' }}
    >
      <span className="text-[10px] uppercase tracking-widest text-gray-500">{label}</span>
      <motion.span
        key={value}
        className="text-lg font-black mt-0.5 tabular-nums"
        style={{ color: highlight ? '#FFD700' : '#fff' }}
        initial={highlight ? { scale: 1.25 } : {}}
        animate={{ scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        {value}
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
      <span className="text-[10px] uppercase tracking-widest text-center" style={{ color: 'rgba(255,215,0,0.5)' }}>
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
  const autoSpinActive     = useGameStore(s => s.autoSpinActive);
  const freeSpinsRemaining = useGameStore(s => s.freeSpinsRemaining);
  const isFreeSpinActive   = useGameStore(s => s.isFreeSpinActive);
  const totalWinThisSpin   = useGameStore(s => s.totalWinThisSpin);
  const lastWinAmount      = useGameStore(s => s.lastWinAmount);
  const setBetMultiple     = useGameStore(s => s.setBetMultiple);
  const setLines           = useGameStore(s => s.setLines);
  const stopAutoSpin       = useGameStore(s => s.stopAutoSpin);
  const startAutoSpin      = useGameStore(s => s.startAutoSpin);
  const openGamble         = useGameStore(s => s.openGamble);
  const takeWin            = useGameStore(s => s.takeWin);
  const { startSpin }      = useSpinSequence();

  const cfg      = getDenomConfig(denomination);
  const totalBet = parseFloat((betPerLine * activeLines).toFixed(2));
  const canSpin  = (phase === 'IDLE' || phase === 'FREE_SPINS') && !autoSpinActive;
  const showTakeWin = phase === 'IDLE' && lastWinAmount > 0 && !autoSpinActive;

  /* Stepper helpers */
  const lineIdx = cfg.lines.indexOf(activeLines);
  const multIdx = cfg.multiples.indexOf(betMultiple);

  function prevLine() { if (lineIdx > 0) setLines(cfg.lines[lineIdx - 1]); }
  function nextLine() { if (lineIdx < cfg.lines.length - 1) setLines(cfg.lines[lineIdx + 1]); }
  function prevMult() { if (multIdx > 0) setBetMultiple(cfg.multiples[multIdx - 1]); }
  function nextMult() { if (multIdx < cfg.multiples.length - 1) setBetMultiple(cfg.multiples[multIdx + 1]); }

  return (
    <div className="flex flex-col gap-4 w-full">

      {/* ── Credit / Bet / Win ── */}
      <div className="flex gap-2">
        <InfoBox label="Credit"  value={formatCredits(balance)} />
        <InfoBox label="Total Bet" value={formatCredits(totalBet)} highlight />
        <InfoBox
          label="Win"
          value={totalWinThisSpin > 0 ? formatCredits(totalWinThisSpin) : '$0.00'}
          highlight={totalWinThisSpin > 0}
        />
      </div>

      {/* ── Gamble / Take Win row ── */}
      <AnimatePresence>
        {showTakeWin && (
          <motion.div
            className="flex gap-2"
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {/* GAMBLE button */}
            <motion.button
              onClick={openGamble}
              className="flex-1 py-3 rounded-xl font-black text-sm tracking-widest flex flex-col items-center gap-0.5"
              style={{
                background: 'linear-gradient(135deg, #3a0060, #6a00aa)',
                border: '1px solid rgba(180,80,255,0.5)',
                color: '#e080ff',
              }}
              whileTap={{ scale: 0.94 }}
              animate={{
                boxShadow: [
                  '0 0 8px rgba(160,60,255,0.3)',
                  '0 0 20px rgba(160,60,255,0.7)',
                  '0 0 8px rgba(160,60,255,0.3)',
                ],
              }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              <span className="text-lg leading-none">♠️</span>
              <span>GAMBLE</span>
              <span className="text-[10px] font-bold opacity-70">{formatCredits(lastWinAmount)}</span>
            </motion.button>

            {/* TAKE WIN button */}
            <motion.button
              onClick={takeWin}
              className="flex-1 py-3 rounded-xl font-black text-sm tracking-widest flex flex-col items-center gap-0.5"
              style={{
                background: 'linear-gradient(135deg, #004020, #007840)',
                border: '1px solid rgba(0,200,100,0.5)',
                color: '#40ff90',
              }}
              whileTap={{ scale: 0.94 }}
              animate={{
                boxShadow: [
                  '0 0 8px rgba(0,200,80,0.3)',
                  '0 0 20px rgba(0,200,80,0.65)',
                  '0 0 8px rgba(0,200,80,0.3)',
                ],
              }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0.6 }}
            >
              <span className="text-lg leading-none">✅</span>
              <span>TAKE WIN</span>
              <span className="text-[10px] font-bold opacity-70">{formatCredits(lastWinAmount)}</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Denomination row ── */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div
            className="px-3 py-1.5 rounded-full text-sm font-black"
            style={{ background: `${cfg.color}22`, border: `1px solid ${cfg.color}66`, color: cfg.color }}
          >
            {cfg.label}
          </div>
        </div>
        {onChangeDenom && (
          <button
            onClick={onChangeDenom}
            disabled={!canSpin}
            className="text-xs text-gray-500 hover:text-yellow-400 transition-colors disabled:opacity-30 underline"
          >
            game menu
          </button>
        )}
      </div>

      {/* ── Steppers row: Lines | Multiple ── */}
      <div className="grid grid-cols-2 gap-4">
        <Stepper
          label="Lines"
          values={cfg.lines}
          current={activeLines}
          onPrev={prevLine}
          onNext={nextLine}
          disabled={!canSpin}
          color={cfg.color}
        />
        <Stepper
          label="Multiple"
          values={cfg.multiples}
          current={betMultiple}
          onPrev={prevMult}
          onNext={nextMult}
          disabled={!canSpin}
          color={cfg.color}
          suffix="×"
        />
      </div>

      {/* ── SPIN row ── */}
      <div className="flex items-center gap-4">

        {/* MAX BET / Free spins info */}
        <div className="flex-1 flex flex-col items-center gap-1.5">
          {isFreeSpinActive ? (
            <div className="text-center">
              <div className="text-amber-500 font-black text-sm animate-pulse">🥁 FREE GAMES</div>
              <div className="text-yellow-300 font-black text-2xl">{freeSpinsRemaining}</div>
              <div className="text-gray-500 text-[10px]">spins left</div>
            </div>
          ) : (
            <>
              <button
                onClick={() => {
                  setBetMultiple(cfg.multiples[cfg.multiples.length - 1]);
                  setLines(cfg.lines[cfg.lines.length - 1]);
                }}
                disabled={!canSpin}
                className="w-full py-2.5 rounded-xl text-sm font-black border transition-colors disabled:opacity-30"
                style={{ borderColor: 'rgba(255,100,0,0.5)', color: '#FF8C00', background: 'rgba(255,100,0,0.12)' }}
              >
                MAX BET
              </button>
              <span className="text-[10px] text-gray-600">{formatCredits(totalBet)} total</span>
            </>
          )}
        </div>

        {/* SPIN button */}
        <motion.button
          onClick={startSpin}
          disabled={!canSpin || (!isFreeSpinActive && balance < totalBet)}
          className="w-24 h-24 rounded-full font-black text-black disabled:opacity-40 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-0.5"
          style={{
            background: 'linear-gradient(135deg, #FFD700, #FF8C00)',
            boxShadow: canSpin ? '0 0 28px rgba(255,165,0,0.7), 0 6px 16px rgba(0,0,0,0.5)' : 'none',
            fontSize: 28,
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

        {/* Auto spin */}
        <div className="flex-1 flex flex-col gap-1.5 items-center">
          <span className="text-[10px] text-gray-500 uppercase tracking-widest">Auto</span>
          <div className="flex flex-col gap-1 w-full">
            {autoSpinActive ? (
              <button
                onClick={stopAutoSpin}
                className="w-full py-2 rounded-xl text-sm font-black"
                style={{ background: 'rgba(255,80,80,0.2)', border: '1px solid rgba(255,80,80,0.5)', color: '#ff6060' }}
              >
                STOP
              </button>
            ) : (
              [10, 25, 50].map(count => (
                <button
                  key={count}
                  onClick={() => startAutoSpin(count)}
                  disabled={phase !== 'IDLE'}
                  className="w-full py-1 rounded-lg text-xs font-bold border transition-colors disabled:opacity-30"
                  style={{ borderColor: 'rgba(255,215,0,0.25)', color: '#888', background: 'transparent' }}
                >
                  {count}×
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
