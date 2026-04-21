'use client';
import { create } from 'zustand';
import { JackpotTier, SymbolId } from '@/types/game';
import { JACKPOT_CONFIGS } from '@/lib/constants';
import { checkJackpotTrigger, contributeToJackpots, resetJackpot } from '@/lib/jackpotEngine';

interface JackpotState {
  values: Record<JackpotTier, number>;
  lastWonTier: JackpotTier | null;

  contributeFromBet: (totalBet: number) => void;
  checkAndTrigger: (grid: SymbolId[][]) => JackpotTier | null;
  clearLastWon: () => void;
}

function initialValues(): Record<JackpotTier, number> {
  return {
    [JackpotTier.MINI]: JACKPOT_CONFIGS[JackpotTier.MINI].seedAmount,
    [JackpotTier.MINOR]: JACKPOT_CONFIGS[JackpotTier.MINOR].seedAmount,
    [JackpotTier.MAJOR]: JACKPOT_CONFIGS[JackpotTier.MAJOR].seedAmount,
    [JackpotTier.GRAND]: JACKPOT_CONFIGS[JackpotTier.GRAND].seedAmount,
  };
}

export const useJackpotStore = create<JackpotState>((set, get) => ({
  values: initialValues(),
  lastWonTier: null,

  contributeFromBet: (totalBet) => {
    set(state => ({ values: contributeToJackpots(state.values, totalBet) }));
  },

  checkAndTrigger: (grid) => {
    const tier = checkJackpotTrigger(grid);
    if (tier) {
      const wonAmount = get().values[tier];
      set(state => ({
        values: { ...state.values, [tier]: resetJackpot(tier) },
        lastWonTier: tier,
      }));
      return tier;
    }
    return null;
  },

  clearLastWon: () => set({ lastWonTier: null }),
}));
