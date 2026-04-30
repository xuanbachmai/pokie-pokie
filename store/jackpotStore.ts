'use client';
import { create } from 'zustand';
import { JackpotTier, SymbolId } from '@/types/game';
import { JACKPOT_CONFIGS } from '@/lib/constants';
import { checkJackpotTrigger, contributeToJackpots, resetJackpot } from '@/lib/jackpotEngine';

export const GRAND_JACKPOT_SEED = 100_000;
const GRAND_CONTRIBUTION_RATE  = 0.001; // 0.1% per bet → ~$0.01 for every $10 wagered

interface JackpotState {
  values: Record<JackpotTier, number>;
  lastWonTier: JackpotTier | null;

  // Separate Grand Jackpot (won only by 15/15 Buffalo Rush fill)
  grandJackpotValue: number;
  grandJackpotWon: boolean;

  contributeFromBet: (totalBet: number) => void;
  checkAndTrigger: (grid: SymbolId[][]) => JackpotTier | null;
  clearLastWon: () => void;
  triggerJackpot: (tier: JackpotTier) => void;
  triggerGrandJackpot: () => number;   // returns won amount, resets to seed
  clearGrandJackpot: () => void;
}

function initialValues(): Record<JackpotTier, number> {
  return {
    [JackpotTier.MINI]:  JACKPOT_CONFIGS[JackpotTier.MINI].seedAmount,
    [JackpotTier.MINOR]: JACKPOT_CONFIGS[JackpotTier.MINOR].seedAmount,
    [JackpotTier.MAJOR]: JACKPOT_CONFIGS[JackpotTier.MAJOR].seedAmount,
    [JackpotTier.GRAND]: JACKPOT_CONFIGS[JackpotTier.GRAND].seedAmount,
  };
}

export const useJackpotStore = create<JackpotState>((set, get) => ({
  values: initialValues(),
  lastWonTier: null,

  grandJackpotValue: GRAND_JACKPOT_SEED,
  grandJackpotWon: false,

  contributeFromBet: (totalBet) => {
    set(state => ({
      values: contributeToJackpots(state.values, totalBet),
      grandJackpotValue: parseFloat(
        (state.grandJackpotValue + totalBet * GRAND_CONTRIBUTION_RATE).toFixed(2)
      ),
    }));
  },

  checkAndTrigger: (grid) => {
    const tier = checkJackpotTrigger(grid);
    if (tier) {
      set(state => ({
        values: { ...state.values, [tier]: resetJackpot(tier) },
        lastWonTier: tier,
      }));
      return tier;
    }
    return null;
  },

  clearLastWon: () => set({ lastWonTier: null }),

  triggerJackpot: (tier: JackpotTier) => {
    set(state => ({
      values: { ...state.values, [tier]: resetJackpot(tier) },
      lastWonTier: tier,
    }));
  },

  triggerGrandJackpot: () => {
    const wonAmount = get().grandJackpotValue;
    set({ grandJackpotValue: GRAND_JACKPOT_SEED, grandJackpotWon: true });
    return wonAmount;
  },

  clearGrandJackpot: () => set({ grandJackpotWon: false }),
}));
