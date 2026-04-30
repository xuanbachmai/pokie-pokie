import { PAYLINES, REEL_SIZE, SYMBOLS } from './constants';
import { NuggetResult, ScatterResult, SpinResult, SymbolId, WinLine } from '@/types/game';
import { shuffle } from './utils';

/**
 * Build a reel strip.
 * @param includeScatter  false for outer reels (0 and 4) — scatter never appears there
 */
function buildReelStrip(includeScatter: boolean): SymbolId[] {
  const strip: SymbolId[] = [];
  for (const sym of Object.values(SYMBOLS)) {
    // Skip scatter on outer reels; keep it (weight 1) on middle reels
    if (sym.isScatter && sym.id === SymbolId.SCATTER && !includeScatter) continue;
    for (let i = 0; i < sym.weight; i++) strip.push(sym.id);
  }
  const shuffled = shuffle(strip);
  while (shuffled.length < REEL_SIZE) shuffled.push(...shuffle(strip));
  return shuffled.slice(0, REEL_SIZE);
}

// Reels 0 and 4 have no scatter; reels 1, 2, 3 do
export const REEL_STRIPS: SymbolId[][] = [
  buildReelStrip(false), // reel 1 — no scatter
  buildReelStrip(true),  // reel 2 — scatter allowed
  buildReelStrip(true),  // reel 3 — scatter allowed
  buildReelStrip(true),  // reel 4 — scatter allowed
  buildReelStrip(false), // reel 5 — no scatter
];

/**
 * Enforce buffalo constraints on the visible grid (mutates in place):
 *   - At most 1 Diamond Buffalo (SPECIAL) per spin — extras become NUGGET.
 *   - Regular Buffalo (NUGGET) are unlimited; a single column can show 1, 2 or 3.
 */
function enforceBuffaloLimits(grid: SymbolId[][]): void {
  // Collect all SPECIAL positions
  const specialPositions: Array<[number, number]> = [];
  for (let col = 0; col < grid.length; col++)
    for (let row = 0; row < grid[col].length; row++)
      if (grid[col][row] === SymbolId.SPECIAL) specialPositions.push([col, row]);

  // Keep one random SPECIAL, downgrade the rest to regular NUGGET
  if (specialPositions.length > 1) {
    const keepIdx = Math.floor(Math.random() * specialPositions.length);
    for (let i = 0; i < specialPositions.length; i++) {
      if (i === keepIdx) continue;
      const [col, row] = specialPositions[i];
      grid[col][row] = SymbolId.NUGGET;
    }
  }
}

export function spin(): SpinResult {
  const stopPositions = REEL_STRIPS.map(strip =>
    Math.floor(Math.random() * strip.length)
  );
  const visibleGrid = REEL_STRIPS.map((strip, col) => {
    const stop = stopPositions[col];
    return [0, 1, 2].map(row => strip[(stop + row) % strip.length]);
  });
  enforceBuffaloLimits(visibleGrid);
  return { visibleGrid, stopPositions };
}

export function evaluatePaylines(grid: SymbolId[][], betPerLine: number): WinLine[] {
  const wins: WinLine[] = [];

  for (let p = 0; p < PAYLINES.length; p++) {
    const line = PAYLINES[p];
    const lineSymbols = line.map((row, col) => grid[col][row]);

    let anchorSymbol: SymbolId | null = null;
    let count = 0;

    for (let col = 0; col < 5; col++) {
      const sym = lineSymbols[col];
      if (sym === SymbolId.WILD) {
        count++;
        continue;
      }
      if (sym === SymbolId.SCATTER) break;
      if (anchorSymbol === null) {
        anchorSymbol = sym;
        count++;
      } else if (sym === anchorSymbol) {
        count++;
      } else {
        break;
      }
    }

    if (anchorSymbol === null && count > 0) anchorSymbol = SymbolId.WILD;

    if (count >= 3 && anchorSymbol) {
      const payoutMultiplier = SYMBOLS[anchorSymbol].payouts[count] ?? 0;
      if (payoutMultiplier > 0) {
        wins.push({
          paylineIndex: p,
          symbols: lineSymbols,
          matchedSymbol: anchorSymbol,
          matchCount: count,
          payout: payoutMultiplier * betPerLine,
          cellPositions: Array.from({ length: count }, (_, i) => [i, line[i]] as [number, number]),
        });
      }
    }
  }

  return wins;
}

export function evaluateScatters(grid: SymbolId[][], _totalBet: number): ScatterResult {
  // Scatter (Trống Đồng) only appears on the 3 middle reels (cols 1, 2, 3).
  // Trigger = all 3 middle reels each show at least 1 scatter in their visible rows.
  // No payout — scatter only triggers Free Games.
  const MIDDLE_COLS = [1, 2, 3];
  const colHasScatter = MIDDLE_COLS.map(col =>
    [0, 1, 2].some(row => grid[col][row] === SymbolId.SCATTER)
  );
  const count = colHasScatter.filter(Boolean).length;
  const triggerBonus = colHasScatter.every(Boolean); // all 3 middle reels lit
  return { count, payout: 0, triggerBonus };
}

export function evaluateNuggets(grid: SymbolId[][]): NuggetResult {
  let count = 0;
  for (let col = 0; col < 5; col++)
    for (let row = 0; row < 3; row++) {
      const s = grid[col][row];
      // Both regular Buffalo (NUGGET) and Diamond Buffalo (SPECIAL) count
      if (s === SymbolId.NUGGET || s === SymbolId.SPECIAL) count++;
    }

  // Jackpot tiers are awarded only inside Buffalo Rush — never on the main reels
  return { count, jackpotTier: null, triggerFeature: count >= 6 };
}

