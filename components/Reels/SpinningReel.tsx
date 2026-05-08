'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SymbolId, WinLine } from '@/types/game';
import { SYMBOLS } from '@/lib/constants';
import { SymbolSVG } from './SymbolSVG';
import { useGameStore } from '@/store/gameStore';

export const CELL_HEIGHT = 108;
const GAP          = 4;
const CELL_TOTAL   = CELL_HEIGHT + GAP;
const EXTRA_BELOW  = 22;                        // random symbols below finals in strip
const STRIP_LEN    = 3 + EXTRA_BELOW;           // total strip symbols rendered
const STOP_OFFSET  = 0;                         // final 3 are at TOP of strip (translateY = 0)
const START_OFFSET = -(EXTRA_BELOW * CELL_TOTAL); // start below finals → strip scrolls DOWN

const ALL_IDS = Object.values(SymbolId);
function rnd(): SymbolId {
  return ALL_IDS[Math.floor(Math.random() * ALL_IDS.length)];
}

function buildStrip(finals: SymbolId[]): SymbolId[] {
  // Finals at TOP (indices 0-2), randoms below — strip scrolls DOWN to reveal finals
  const strip: SymbolId[] = [finals[0], finals[1], finals[2]];
  for (let i = 0; i < EXTRA_BELOW; i++) strip.push(rnd());
  return strip;
}

/* ── Single cell ── */
function SymbolCell({ symbolId, highlighted }: { symbolId: SymbolId; highlighted: boolean }) {
  const sym = SYMBOLS[symbolId];
  return (
    <div
      style={{
        height: CELL_HEIGHT,
        minHeight: CELL_HEIGHT,
        borderRadius: 10,
        border: `2px solid ${highlighted ? sym.color : 'rgba(255,215,0,0.12)'}`,
        background: highlighted
          ? `radial-gradient(circle at center, ${sym.color}33, rgba(0,0,0,0.6) 75%)`
          : 'rgba(0,0,0,0.55)',
        boxShadow: highlighted ? `0 0 22px ${sym.color}99, inset 0 0 12px ${sym.color}22` : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        flexShrink: 0,
      }}
    >
      <div style={{ filter: highlighted ? `drop-shadow(0 0 6px ${sym.color})` : 'none' }}>
        <SymbolSVG id={symbolId} size={62} />
      </div>
    </div>
  );
}

/* ── Spinning reel ── */
interface Props {
  col: number;
  finalSymbols: SymbolId[];
  spinning: boolean;
  stopDelay: number;
  winLines: WinLine[];
  anticipation?: 'scatter' | 'buffalo' | 'spin' | false;
}

export function SpinningReel({ col, finalSymbols, spinning, stopDelay, winLines, anticipation }: Props) {
  const [strip, setStrip]       = useState<SymbolId[]>(() => buildStrip(finalSymbols));
  const [offset, setOffset]     = useState(STOP_OFFSET);
  const [transitioning, setTransitioning] = useState(false);
  const [blurAmount, setBlurAmount]       = useState(0);
  const [bouncing, setBouncing]           = useState(false); // post-stop bounce

  const prevSpinning = useRef(false);
  const rafRef       = useRef<number | null>(null);
  const t1Ref        = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t2Ref        = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t3Ref        = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reelRef      = useRef<HTMLDivElement>(null); // for CSS shake

  const cleanup = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (t1Ref.current)  clearTimeout(t1Ref.current);
    if (t2Ref.current)  clearTimeout(t2Ref.current);
    if (t3Ref.current)  clearTimeout(t3Ref.current);
  }, []);

  useEffect(() => {
    // SPIN START
    if (spinning && !prevSpinning.current) {
      const newStrip = buildStrip(finalSymbols);
      setStrip(newStrip);
      setBouncing(false);

      setTransitioning(false);
      setBlurAmount(8);   // heavier initial blur
      setOffset(START_OFFSET);

      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = requestAnimationFrame(() => {
          setTransitioning(true);
          setOffset(STOP_OFFSET);

          // Blur fade schedule
          t1Ref.current = setTimeout(() => setBlurAmount(3),   stopDelay * 0.55);
          t2Ref.current = setTimeout(() => setBlurAmount(0.8), stopDelay * 0.80);
          t3Ref.current = setTimeout(() => setBlurAmount(0),   stopDelay * 0.95);
        });
      });
    }

    // SPIN STOP (natural or forced)
    if (!spinning && prevSpinning.current) {
      cleanup();
      setTransitioning(false);
      setBlurAmount(0);
      const newStrip = buildStrip(finalSymbols);
      setStrip(newStrip);
      setOffset(STOP_OFFSET);

      // Post-stop bounce + shake
      setBouncing(true);
      if (reelRef.current) {
        reelRef.current.classList.remove('reel-shake');
        void reelRef.current.offsetWidth; // force reflow to restart animation
        reelRef.current.classList.add('reel-shake');
      }
      setTimeout(() => setBouncing(false), 220);
    }

    prevSpinning.current = spinning;
  });

  useEffect(() => {
    if (!spinning) {
      setStrip(buildStrip(finalSymbols));
      setOffset(STOP_OFFSET);
      setBlurAmount(0);
    }
  }, [finalSymbols, spinning]);

  useEffect(() => () => cleanup(), [cleanup]);

  const highlightedWinLineIdx = useGameStore(s => s.highlightedWinLineIdx);

  const highlightedRows = new Set<number>();
  if (!spinning) {
    const linesToHighlight =
      highlightedWinLineIdx !== null && winLines[highlightedWinLineIdx]
        ? [winLines[highlightedWinLineIdx]]
        : winLines;

    linesToHighlight.forEach(line => {
      line.cellPositions.forEach(([c, r]) => {
        if (c === col) highlightedRows.add(r);
      });
    });
  }

  const transitionStyle = transitioning
    ? `transform ${stopDelay}ms cubic-bezier(0.08, 0.65, 0.45, 1.0)`
    : 'none';

  // Bounce offset: overshoot -8px → settle to 0
  const bounceTransform = bouncing
    ? 'translateY(-8px)'
    : 'translateY(0px)';

  return (
    <div
      ref={reelRef}
      style={{
        height: CELL_HEIGHT * 3 + GAP * 2,
        borderRadius: 10,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* ── Reel strip ── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: GAP,
          transform: `translateY(${offset}px) ${bounceTransform}`,
          transition: bouncing
            ? 'transform 220ms cubic-bezier(0.34, 1.56, 0.64, 1)'
            : transitionStyle,
          filter: blurAmount > 0 ? `blur(${blurAmount}px) ${blurAmount > 3 ? 'scaleY(1.04)' : ''}` : 'none',
        }}
      >
        {strip.map((symId, idx) => (
          // Finals are at indices 0, 1, 2 — those are the visible rows at STOP_OFFSET = 0
          <SymbolCell
            key={idx}
            symbolId={symId}
            highlighted={!spinning && idx <= 2 && highlightedRows.has(idx)}
          />
        ))}
      </div>

      {/* ── Motion blur overlay (extra depth during fast phase) ── */}
      {spinning && blurAmount > 2 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, transparent 15%, transparent 85%, rgba(0,0,0,0.15) 100%)',
            zIndex: 5,
          }}
        />
      )}

      {/* ── Speed streak lines ── */}
      {spinning && blurAmount > 2.5 && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 6, overflow: 'hidden' }}>
          {[20, 40, 55, 70, 85].map((x, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${x}%`,
                top: 0,
                bottom: 0,
                width: 1,
                background: 'linear-gradient(180deg, transparent 0%, rgba(255,215,0,0.12) 50%, transparent 100%)',
                opacity: 0.6,
              }}
            />
          ))}
        </div>
      )}

      {/* ── Edge fade masks ── */}
      <div
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 32,
          background: 'linear-gradient(180deg, rgba(1,8,3,0.92) 0%, transparent 100%)',
          pointerEvents: 'none', zIndex: 20,
        }}
      />
      <div
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 32,
          background: 'linear-gradient(0deg, rgba(1,8,3,0.92) 0%, transparent 100%)',
          pointerEvents: 'none', zIndex: 20,
        }}
      />

      {/* ── Anticipation overlay ── */}
      <AnimatePresence>
        {spinning && anticipation && anticipation !== 'spin' && (
          <motion.div
            key="anticipation"
            style={{
              position: 'absolute', inset: 0,
              borderRadius: 10, zIndex: 25, pointerEvents: 'none',
              border: `3px solid ${anticipation === 'scatter' ? '#FFD700' : '#FF6B00'}`,
              overflow: 'hidden',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              style={{
                position: 'absolute', inset: 0,
                background: anticipation === 'scatter'
                  ? 'radial-gradient(ellipse at center, rgba(255,215,0,0.18) 0%, transparent 70%)'
                  : 'radial-gradient(ellipse at center, rgba(255,100,0,0.22) 0%, transparent 70%)',
              }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
            <motion.div
              style={{
                position: 'absolute', inset: 0,
                background: anticipation === 'scatter'
                  ? 'repeating-linear-gradient(180deg, transparent 0px, transparent 10px, rgba(255,215,0,0.06) 10px, rgba(255,215,0,0.06) 12px)'
                  : 'repeating-linear-gradient(180deg, transparent 0px, transparent 10px, rgba(255,100,0,0.08) 10px, rgba(255,100,0,0.08) 12px)',
              }}
              animate={{ backgroundPositionY: ['0px', '24px'] }}
              transition={{ duration: 0.18, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: 36,
                filter: `drop-shadow(0 0 12px ${anticipation === 'scatter' ? '#FFD700' : '#FF6B00'})`,
              }}
              animate={{ scale: [0.85, 1.15, 0.85] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              {anticipation === 'scatter' ? '🥁' : '🐃'}
            </motion.div>
            <motion.div
              style={{ position: 'absolute', inset: 0, borderRadius: 10,
                boxShadow: anticipation === 'scatter'
                  ? '0 0 24px rgba(255,215,0,0.6), inset 0 0 16px rgba(255,215,0,0.15)'
                  : '0 0 24px rgba(255,100,0,0.6), inset 0 0 16px rgba(255,100,0,0.18)',
              }}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 0.4, repeat: Infinity }}
            />
          </motion.div>
        )}

        {/* ── Spin anticipation — reel 5 blur/speed effect ── */}
        {spinning && anticipation === 'spin' && (
          <motion.div
            key="spin-anticipation"
            style={{ position: 'absolute', inset: 0, borderRadius: 10, zIndex: 25, pointerEvents: 'none', overflow: 'hidden' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Blur overlay — simulates reel spinning faster */}
            <motion.div
              style={{
                position: 'absolute', inset: 0,
                backdropFilter: 'blur(3px)',
                background: 'linear-gradient(180deg, rgba(255,140,0,0.12) 0%, rgba(255,80,0,0.08) 50%, rgba(255,140,0,0.12) 100%)',
              }}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 0.25, repeat: Infinity }}
            />
            {/* Fast vertical speed lines */}
            <motion.div
              style={{
                position: 'absolute', inset: 0,
                background: 'repeating-linear-gradient(180deg, transparent 0px, transparent 6px, rgba(255,160,0,0.12) 6px, rgba(255,160,0,0.12) 8px)',
              }}
              animate={{ backgroundPositionY: ['0px', '16px'] }}
              transition={{ duration: 0.08, repeat: Infinity, ease: 'linear' }}
            />
            {/* Flashing amber border */}
            <motion.div
              style={{ position: 'absolute', inset: 0, borderRadius: 10,
                border: '3px solid #FF8C00',
                boxShadow: '0 0 28px rgba(255,140,0,0.8), inset 0 0 18px rgba(255,100,0,0.2)',
              }}
              animate={{ opacity: [0.5, 1, 0.5], boxShadow: [
                '0 0 18px rgba(255,140,0,0.5), inset 0 0 10px rgba(255,100,0,0.1)',
                '0 0 40px rgba(255,180,0,1.0), inset 0 0 24px rgba(255,140,0,0.35)',
                '0 0 18px rgba(255,140,0,0.5), inset 0 0 10px rgba(255,100,0,0.1)',
              ]}}
              transition={{ duration: 0.22, repeat: Infinity }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
