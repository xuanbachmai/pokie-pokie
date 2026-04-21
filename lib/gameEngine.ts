import { PAYLINES, REEL_SIZE, SYMBOLS } from './constants';
import { ScatterResult, SpinResult, SymbolId, WinLine } from '@/types/game';
import { shuffle } from './utils';

function buildReelStrip(): SymbolId[] {
  const strip: SymbolId[] = [];
  for (const sym of Object.values(SYMBOLS)) {
    for (let i = 0; i < sym.weight; i++) strip.push(sym.id);
  }
  const shuffled = shuffle(strip);
  while (shuffled.length < REEL_SIZE) shuffled.push(...shuffle(strip));
  return shuffled.slice(0, REEL_SIZE);
}

// Build 5 independent reel strips once
export const REEL_STRIPS: SymbolId[][] = Array.from({ length: 5 }, () => buildReelStrip());

export function spin(): SpinResult {
  const stopPositions = REEL_STRIPS.map(strip =>
    Math.floor(Math.random() * strip.length)
  );
  const visibleGrid = REEL_STRIPS.map((strip, col) => {
    const stop = stopPositions[col];
    return [0, 1, 2].map(row => strip[(stop + row) % strip.length]);
  });
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

export function evaluateScatters(grid: SymbolId[][], totalBet: number): ScatterResult {
  let count = 0;
  for (let col = 0; col < 5; col++) {
    for (let row = 0; row < 3; row++) {
      if (grid[col][row] === SymbolId.SCATTER) count++;
    }
  }
  const payoutMultiplier = SYMBOLS[SymbolId.SCATTER].payouts[count] ?? 0;
  const payout = payoutMultiplier * totalBet;
  return { count, payout, triggerBonus: count >= 3 };
}
