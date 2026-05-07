'use client';
import { create } from 'zustand';
import { JackpotTier, SymbolId } from '@/types/game';
import { JACKPOT_CONFIGS } from '@/lib/constants';
import { checkJackpotTrigger, contributeToJackpots } from '@/lib/jackpotEngine';

export const GRAND_JACKPOT_SEED = 30_000;
const GRAND_CONTRIBUTION_RATE  = 0.002; // 0.2% per bet → +$0.01 per $5 wagered

// Step-table: jackpot seeds by denom bracket (user-specified tiers)
// Format: [maxDenom, mini, major, minor]
const JACKPOT_DENOM_STEPS: [number, number, number, number][] = [
  [0.02,  10,   30,    50],   // 1¢ – 2¢
  [0.10,  30,   50,   100],   // 5¢ – 10¢
  [0.20, 100,  200,   500],   // 20¢
  [1.00, 100,  200,   500],   // $1  (same bracket as 20¢ per user)
  [2.00, 200,  500, 1_000],   // $2
];

/** Return [mini, major, minor] seed for a given denom bracket */
function denomSeeds(denom: number): [number, number, number] {
  for (const [maxD, mini, major, minor] of JACKPOT_DENOM_STEPS) {
    if (denom <= maxD) return [mini, major, minor];
  }
  // Above highest bracket — scale from $2 tier
  const [, mini, major, minor] = JACKPOT_DENOM_STEPS[JACKPOT_DENOM_STEPS.length - 1];
  const factor = denom / 2.00;
  return [
    parseFloat((mini  * factor).toFixed(2)),
    parseFloat((major * factor).toFixed(2)),
    parseFloat((minor * factor).toFixed(2)),
  ];
}

/** Compute the reset seed for a given tier at the current denomination.
 *  GRAND (Mega + Grand) never scales — stays fixed/progressive. */
export function scaledSeed(tier: JackpotTier, denom: number): number {
  if (tier === JackpotTier.GRAND) return JACKPOT_CONFIGS[JackpotTier.GRAND].seedAmount;
  const [mini, major, minor] = denomSeeds(denom);
  if (tier === JackpotTier.MINI)  return mini;
  if (tier === JackpotTier.MINOR) return major;   // MINOR tier = "MAJOR JACKPOT" label
  return minor;                                   // MAJOR tier = "MINOR JACKPOT" label
}

interface JackpotState {
  values: Record<JackpotTier, number>;
  lastWonTier: JackpotTier | null;
  currentDenom: number;

  // Separate Grand Jackpot (won only by 15/15 Buffalo Rush fill)
  grandJackpotValue:      number;   // current progressive meter value (shown in panel)
  grandJackpotWon:        boolean;  // true = show celebration overlay
  grandJackpotWonAmount:  number;   // the jackpot value at the moment it was won
  grandJackpotTotalPrize: number;   // jackpot amount + all buffalo rush slot prizes combined

  contributeFromBet:      (totalBet: number) => void;
  checkAndTrigger:        (grid: SymbolId[][]) => JackpotTier | null;
  clearLastWon:           () => void;
  triggerJackpot:         (tier: JackpotTier) => void;
  triggerGrandJackpot:    () => number;   // returns won amount, resets meter to seed
  setGrandJackpotTotal:   (total: number) => void;  // called after buffalo prizes are summed
  clearGrandJackpot:      () => void;
  setDenom:               (denom: number) => void;

  // ── Supabase sync actions (called by useJackpotSync hook) ──────────
  syncMegaJackpot:   (value: number) => void;  // update from DB / realtime
  syncGrandJackpot:  (value: number) => void;  // update from DB / realtime
}

function initialValues(denom = 0.10): Record<JackpotTier, number> {
  return {
    [JackpotTier.MINI]:  scaledSeed(JackpotTier.MINI,  denom),
    [JackpotTier.MINOR]: scaledSeed(JackpotTier.MINOR, denom),
    [JackpotTier.MAJOR]: scaledSeed(JackpotTier.MAJOR, denom),
    [JackpotTier.GRAND]: JACKPOT_CONFIGS[JackpotTier.GRAND].seedAmount,
  };
}

export const useJackpotStore = create<JackpotState>((set, get) => ({
  values: initialValues(0.10),
  lastWonTier: null,
  currentDenom: 0.10,

  grandJackpotValue:      GRAND_JACKPOT_SEED,
  grandJackpotWon:        false,
  grandJackpotWonAmount:  0,
  grandJackpotTotalPrize: 0,

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
      const denom = get().currentDenom;
      set(state => ({
        values: { ...state.values, [tier]: scaledSeed(tier, denom) },
        lastWonTier: tier,
      }));
      return tier;
    }
    return null;
  },

  clearLastWon: () => set({ lastWonTier: null }),

  triggerJackpot: (tier: JackpotTier) => {
    const denom = get().currentDenom;
    set(state => ({
      values: { ...state.values, [tier]: scaledSeed(tier, denom) },
      lastWonTier: tier,
    }));
  },

  triggerGrandJackpot: () => {
    const wonAmount = get().grandJackpotValue;
    // Save the exact won amount; reset meter; mark as won
    // grandJackpotTotalPrize will be updated via setGrandJackpotTotal once slot prizes are added
    set({
      grandJackpotWonAmount:  wonAmount,
      grandJackpotTotalPrize: wonAmount,   // interim — updated below
      grandJackpotValue:      GRAND_JACKPOT_SEED,
      grandJackpotWon:        true,
    });
    return wonAmount;
  },

  // Called from NuggetHoldFeature after computing totalPrize = slots + grandAmount
  setGrandJackpotTotal: (total: number) => {
    set({ grandJackpotTotalPrize: total });
  },

  clearGrandJackpot: () => set({
    grandJackpotWon:        false,
    grandJackpotWonAmount:  0,
    grandJackpotTotalPrize: 0,
  }),

  setDenom: (denom) => {
    set(state => ({
      currentDenom: denom,
      values: {
        [JackpotTier.MINI]:  scaledSeed(JackpotTier.MINI,  denom),
        [JackpotTier.MINOR]: scaledSeed(JackpotTier.MINOR, denom),
        [JackpotTier.MAJOR]: scaledSeed(JackpotTier.MAJOR, denom),
        [JackpotTier.GRAND]: state.values[JackpotTier.GRAND],
      },
    }));
  },

  // ── Supabase sync: always trust the server value (allows jackpot resets to propagate) ──
  syncMegaJackpot: (value) => set(state => ({
    values: {
      ...state.values,
      [JackpotTier.GRAND]: value,
    },
  })),

  syncGrandJackpot: (value) => set(state => ({
    grandJackpotValue: value,
  })),
}));
