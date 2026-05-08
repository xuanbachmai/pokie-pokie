import { PAYLINES, REEL_SIZE, SYMBOLS } from './constants';
import { NuggetResult, ScatterResult, SpinResult, SymbolId, WinLine } from '@/types/game';
import { shuffle } from './utils';

/**
 * Build a reel strip.
 * @param includeScatter  false for outer reels (0 and 4) — scatter never appears there
 *
 * Scatter gap rule: no two scatter symbols may be within 2 positions of each other.
 * The visible window is 3 rows, so this guarantees at most 1 scatter shows per reel.
 */
function buildReelStrip(includeScatter: boolean): SymbolId[] {
  const strip: SymbolId[] = [];
  for (const sym of Object.values(SYMBOLS)) {
    if (sym.isScatter && sym.id === SymbolId.SCATTER && !includeScatter) continue;
    for (let i = 0; i < sym.weight; i++) strip.push(sym.id);
  }
  const shuffled = shuffle(strip);
  while (shuffled.length < REEL_SIZE) shuffled.push(...shuffle(strip));
  const result = shuffled.slice(0, REEL_SIZE);

  if (includeScatter) {
    // Find a low-value non-scatter fallback symbol (use JADE / rice)
    const fallback = SymbolId.JADE;
    // Enforce minimum gap of 3 between consecutive scatter positions
    // (visible window = 3, so gap ≥ 3 ensures at most 1 scatter visible at a time)
    let lastScatterIdx = -99;
    for (let i = 0; i < result.length; i++) {
      if (result[i] === SymbolId.SCATTER) {
        if (i - lastScatterIdx < 3) {
          result[i] = fallback; // too close — replace with a filler symbol
        } else {
          lastScatterIdx = i;
        }
      }
    }
    // Also check wrap-around (last scatter vs first scatter on the circular strip)
    const firstIdx = result.indexOf(SymbolId.SCATTER);
    const lastIdx  = result.lastIndexOf(SymbolId.SCATTER);
    if (firstIdx !== -1 && lastIdx !== firstIdx) {
      const wrapGap = (result.length - lastIdx) + firstIdx;
      if (wrapGap < 3) result[firstIdx] = fallback;
    }
  }

  return result;
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
 *   - Total buffalo (NUGGET + SPECIAL) is capped below 6 in 85% of spins
 *     so the Buffalo Rush feature trigger stays rare while 2-3 per column
 *     can still appear regularly for visual excitement.
 */
function enforceBuffaloLimits(grid: SymbolId[][]): void {
  // 1. SPECIAL limit — at most 1 per spin, only 25% chance it survives
  const specialPositions: Array<[number, number]> = [];
  for (let col = 0; col < grid.length; col++)
    for (let row = 0; row < grid[col].length; row++)
      if (grid[col][row] === SymbolId.SPECIAL) specialPositions.push([col, row]);

  if (specialPositions.length > 0) {
    const keepOne = Math.random() < 0.25; // 75% → all become NUGGET
    const keepIdx = keepOne
      ? Math.floor(Math.random() * specialPositions.length)
      : -1;
    for (let i = 0; i < specialPositions.length; i++) {
      if (i === keepIdx) continue;
      const [col, row] = specialPositions[i];
      grid[col][row] = SymbolId.NUGGET;
    }
  }

  // 2. Cap total buffalo — if 6+ would appear, 85% chance to reduce to 3-5
  //    so the feature trigger is genuinely rare but 2-3 per column are common
  const allBuffaloPos: Array<[number, number]> = [];
  for (let col = 0; col < grid.length; col++)
    for (let row = 0; row < grid[col].length; row++)
      if (grid[col][row] === SymbolId.NUGGET || grid[col][row] === SymbolId.SPECIAL)
        allBuffaloPos.push([col, row]);

  if (allBuffaloPos.length >= 6 && Math.random() < 0.85) {
    // Keep 3, 4, or 5 buffalos; convert the rest to low-value symbol
    const keepCount = 3 + Math.floor(Math.random() * 3);
    // Shuffle in place to randomise which positions are kept
    const shuffled = allBuffaloPos.sort(() => Math.random() - 0.5);
    for (let i = keepCount; i < shuffled.length; i++) {
      const [col, row] = shuffled[i];
      grid[col][row] = SymbolId.JADE; // replace with rice (low-value, common)
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

  // Hard guard: at most 1 scatter per reel in the visible window.
  // Replace any extras with JADE (rice) — lowest-value symbol.
  for (let col = 0; col < visibleGrid.length; col++) {
    let scatterSeen = false;
    for (let row = 0; row < visibleGrid[col].length; row++) {
      if (visibleGrid[col][row] === SymbolId.SCATTER) {
        if (scatterSeen) {
          visibleGrid[col][row] = SymbolId.JADE; // remove duplicate
        } else {
          scatterSeen = true;
        }
      }
    }
  }

  return { visibleGrid, stopPositions };
}

export function evaluatePaylines(grid: SymbolId[][], betPerLine: number, activeLines = 50): WinLine[] {
  const wins: WinLine[] = [];
  const lineCount = Math.min(activeLines, PAYLINES.length);

  for (let p = 0; p < lineCount; p++) {
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
      // SCATTER, NUGGET, and SPECIAL all break paylines — they are feature-only symbols
      if (sym === SymbolId.SCATTER || sym === SymbolId.NUGGET || sym === SymbolId.SPECIAL) break;
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

