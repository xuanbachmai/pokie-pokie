'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
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
}

export function SpinningReel({ col, finalSymbols, spinning, stopDelay, winLines }: Props) {
  const [strip, setStrip]   = useState<SymbolId[]>(() => buildStrip(finalSymbols));
  const [offset, setOffset] = useState(STOP_OFFSET);   // px translateY
  const [transitioning, setTransitioning] = useState(false);
  const [blurAmount, setBlurAmount]       = useState(0);

  const prevSpinning = useRef(false);
  const rafRef       = useRef<number | null>(null);
  const t1Ref        = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t2Ref        = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanup = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (t1Ref.current)  clearTimeout(t1Ref.current);
    if (t2Ref.current)  clearTimeout(t2Ref.current);
  }, []);

  useEffect(() => {
    // SPIN START
    if (spinning && !prevSpinning.current) {
      const newStrip = buildStrip(finalSymbols);
      setStrip(newStrip);

      // 1. Instantly position strip at START (far above, showing randoms below finals)
      setTransitioning(false);
      setBlurAmount(4);
      setOffset(START_OFFSET);

      // 2. Next tick: animate DOWN to STOP_OFFSET (0) — strip falls top-to-bottom
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = requestAnimationFrame(() => {
          setTransitioning(true);
          setOffset(STOP_OFFSET);

          // Reduce blur halfway through
          t1Ref.current = setTimeout(() => setBlurAmount(1.5), stopDelay * 0.65);
          // Clear blur at the end
          t2Ref.current = setTimeout(() => setBlurAmount(0), stopDelay * 0.92);
        });
      });
    }

    // SPIN STOP (forced early)
    if (!spinning && prevSpinning.current) {
      cleanup();
      setTransitioning(false);
      setBlurAmount(0);
      // Hard snap to final
      const newStrip = buildStrip(finalSymbols);
      setStrip(newStrip);
      setOffset(STOP_OFFSET);
    }

    prevSpinning.current = spinning;
  });

  // When finalSymbols change while not spinning, just update display
  useEffect(() => {
    if (!spinning) {
      setStrip(buildStrip(finalSymbols));
      setOffset(STOP_OFFSET);
      setBlurAmount(0);
    }
  }, [finalSymbols, spinning]);

  useEffect(() => () => cleanup(), [cleanup]);

  const highlightedWinLineIdx = useGameStore(s => s.highlightedWinLineIdx);

  // Build highlighted row set — only for the currently cycling win line (if any)
  const highlightedRows = new Set<number>();
  if (!spinning) {
    const linesToHighlight =
      highlightedWinLineIdx !== null && winLines[highlightedWinLineIdx]
        ? [winLines[highlightedWinLineIdx]]
        : winLines;  // fallback: highlight all when no cycling active

    linesToHighlight.forEach(line => {
      line.cellPositions.forEach(([c, r]) => {
        if (c === col) highlightedRows.add(r);
      });
    });
  }

  // easing: fast acceleration then very smooth deceleration with tiny bounce
  // cubic-bezier(0.15, 0.8, 0.7, 1) → starts fast, ends gently
  // We add a custom spring-like end by using two-phase transition
  const transitionStyle = transitioning
    ? `transform ${stopDelay}ms cubic-bezier(0.05, 0.6, 0.6, 1.04)`
    : 'none';

  return (
    <div
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
          transform: `translateY(${offset}px)`,
          transition: transitionStyle,
          filter: blurAmount > 0 ? `blur(${blurAmount}px)` : 'none',
          willChange: 'transform',
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
          background: 'linear-gradient(180deg, rgba(5,0,2,0.92) 0%, transparent 100%)',
          pointerEvents: 'none', zIndex: 20,
        }}
      />
      <div
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 32,
          background: 'linear-gradient(0deg, rgba(5,0,2,0.92) 0%, transparent 100%)',
          pointerEvents: 'none', zIndex: 20,
        }}
      />
    </div>
  );
}
