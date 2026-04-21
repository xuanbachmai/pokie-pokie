import { JACKPOT_CONFIGS, PAYLINES } from './constants';
import { JackpotTier, SymbolId } from '@/types/game';

export function checkJackpotTrigger(grid: SymbolId[][]): JackpotTier | null {
  // Check Grand first (highest tier), then downward
  const tiers = [JackpotTier.GRAND, JackpotTier.MAJOR, JackpotTier.MINOR, JackpotTier.MINI];

  for (const tier of tiers) {
    const config = JACKPOT_CONFIGS[tier];
    const target = config.triggerSymbol;

    for (const line of PAYLINES) {
      let count = 0;
      for (let col = 0; col < 5; col++) {
        const sym = grid[col][line[col]];
        if (sym === target || sym === SymbolId.WILD) count++;
        else break;
      }
      if (count === 5) return tier;
    }
  }

  return null;
}

export function contributeToJackpots(
  currentValues: Record<JackpotTier, number>,
  totalBet: number
): Record<JackpotTier, number> {
  const next = { ...currentValues };
  for (const tier of Object.values(JackpotTier)) {
    next[tier] += totalBet * JACKPOT_CONFIGS[tier].contributionRate;
  }
  return next;
}

export function resetJackpot(tier: JackpotTier): number {
  return JACKPOT_CONFIGS[tier].seedAmount;
}
