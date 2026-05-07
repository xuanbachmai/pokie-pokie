import { FreeSpinsConfig } from '@/types/game';

/**
 * Free Spins config — Trống Đồng feature always awards exactly 6 games
 * with a 2× multiplier on all wins.
 */
export function buildFreeSpinsConfig(): FreeSpinsConfig {
  return { spinsAwarded: 6, multiplier: 2 };
}
