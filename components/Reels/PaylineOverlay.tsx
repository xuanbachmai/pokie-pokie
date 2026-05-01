'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { SYMBOLS } from '@/lib/constants';

/**
 * SVG overlay that draws the animated payline path for the currently
 * highlighted winning line.  Sits on top of the reel grid.
 *
 * viewBox "0 0 100 100" — cell centres in percentage space:
 *   Columns (0–4): x = 10, 30, 50, 70, 90
 *   Rows    (0–2): y = 17, 50, 83
 */

const COL_X = [10, 30, 50, 70, 90];
const ROW_Y = [17, 50, 83];

function pt(col: number, row: number): string {
  return `${COL_X[col]},${ROW_Y[row]}`;
}

export function PaylineOverlay() {
  const winLines            = useGameStore(s => s.lastWinLines);
  const highlightedIdx      = useGameStore(s => s.highlightedWinLineIdx);
  const phase               = useGameStore(s => s.phase);

  const show  = phase === 'IDLE' && highlightedIdx !== null && winLines.length > 0;
  const line  = show ? winLines[highlightedIdx!] : null;
  const sym   = line ? SYMBOLS[line.matchedSymbol] : null;
  const color = sym?.color ?? '#FFD700';

  // Build polyline points string from all 5 cell positions (full line across grid)
  const allPoints = line
    ? line.cellPositions.map(([col, row]) => pt(col, row)).join(' ')
    : '';

  // Total path length approximation for stroke-dasharray animation
  // (each segment ≈ 20 units, 4 segments → ~80 units max)
  const pathLen = 300;

  return (
    <AnimatePresence mode="wait">
      {show && line && (
        <motion.div
          key={`${highlightedIdx}-${line.paylineIndex}`}
          className="absolute inset-3 pointer-events-none"
          style={{ zIndex: 26 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="w-full h-full overflow-visible"
          >
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Glow shadow line */}
            <motion.polyline
              points={allPoints}
              fill="none"
              stroke={color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeOpacity={0.35}
              filter="url(#glow)"
              vectorEffect="non-scaling-stroke"
              initial={{ strokeDasharray: pathLen, strokeDashoffset: pathLen }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            />

            {/* Main line */}
            <motion.polyline
              points={allPoints}
              fill="none"
              stroke={color}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              initial={{ strokeDasharray: pathLen, strokeDashoffset: pathLen }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            />

            {/* Circle dots at each winning cell */}
            {line.cellPositions.map(([col, row], i) => (
              <motion.circle
                key={i}
                cx={COL_X[col]}
                cy={ROW_Y[row]}
                r={3.5}
                fill={color}
                strokeWidth="1"
                stroke="#fff"
                vectorEffect="non-scaling-stroke"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.35 + i * 0.05, duration: 0.2, type: 'spring' }}
              />
            ))}
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
