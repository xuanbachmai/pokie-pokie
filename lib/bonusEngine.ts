import { FreeSpinsConfig } from '@/types/game';

/** Scatter always triggers Free Spins — 6 games, no multiplier. */
export function buildFreeSpinsConfig(): FreeSpinsConfig {
  return { spinsAwarded: 6, multiplier: 1 };
}
