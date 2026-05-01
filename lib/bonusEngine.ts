import { FreeSpinsConfig } from '@/types/game';

/**
 * Free Spins config — per real pokies the number of spins and multiplier
 * vary randomly. Higher multipliers are rarer.
 *
 *  Spins:      8 (50%) | 12 (35%) | 15 (15%)
 *  Multiplier: 2× (50%) | 3× (35%) | 5× (15%)
 */
export function buildFreeSpinsConfig(): FreeSpinsConfig {
  const r1 = Math.random();
  const spinsAwarded = r1 < 0.50 ? 8 : r1 < 0.85 ? 12 : 15;

  const r2 = Math.random();
  const multiplier = r2 < 0.50 ? 2 : r2 < 0.85 ? 3 : 5;

  return { spinsAwarded, multiplier };
}
