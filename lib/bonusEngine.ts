import { DRAGON_EGG_MULTIPLIERS, LANTERN_PRIZES } from './constants';
import { BonusGameType, FreeSpinsConfig } from '@/types/game';
import { randomInt } from './utils';

export function selectBonusType(): BonusGameType {
  const types: BonusGameType[] = ['DRAGON_EGG', 'LUCKY_LANTERNS', 'FREE_SPINS'];
  return types[randomInt(0, 2)];
}

export function resolveDragonEgg(pickIndex: number, betAmount: number): number {
  const multiplier = DRAGON_EGG_MULTIPLIERS[pickIndex] ?? 5;
  return betAmount * multiplier;
}

export function resolveLanterns(picks: number[]): number {
  return picks.reduce((sum, idx) => sum + (LANTERN_PRIZES[idx] ?? 20), 0);
}

export function buildFreeSpinsConfig(scatterCount: number): FreeSpinsConfig {
  const spinsMap: Record<number, number> = { 3: 8, 4: 12, 5: 20 };
  const spinsAwarded = spinsMap[scatterCount] ?? 8;
  const multiplier = randomInt(2, 5);
  return { spinsAwarded, multiplier };
}
