import { JACKPOT_CONFIGS, PAYLINES } from './constants';
import { JackpotTier, SymbolId } from '@/types/game';

/**
 * Jackpots (Mini/Major/Maxi/Mega) are awarded ONLY inside Buffalo Rush.
 * This function intentionally always returns null for the main game.
 */
export function checkJackpotTrigger(_grid: SymbolId[][]): JackpotTier | null {
  return null;
}

/**
 * Only MEGA (JackpotTier.GRAND) is a progressive jackpot that grows from bets.
 * MINI, MAJOR (MINOR tier), and MAXI (MAJOR tier) are fixed prize amounts.
 */
export function contributeToJackpots(
  currentValues: Record<JackpotTier, number>,
  totalBet: number
): Record<JackpotTier, number> {
  const next = { ...currentValues };
  // Only GRAND tier (MEGA) accumulates from player bets
  next[JackpotTier.GRAND] = parseFloat(
    (next[JackpotTier.GRAND] + totalBet * JACKPOT_CONFIGS[JackpotTier.GRAND].contributionRate).toFixed(2)
  );
  return next;
}

export function resetJackpot(tier: JackpotTier): number {
  return JACKPOT_CONFIGS[tier].seedAmount;   // base seed; store overrides with scaledSeed
}
