'use client';
import { create } from 'zustand';
import {
  BonusGameType, BonusPrize, GamePhase,
  GambleOutcome, ScatterResult, SymbolId, WinLine,
} from '@/types/game';
import { calcBetPerLine, getDenomConfig, DENOM_CONFIGS } from '@/lib/constants';
import { evaluateNuggets, evaluatePaylines, evaluateScatters, spin } from '@/lib/gameEngine';
import { buildFreeSpinsConfig } from '@/lib/bonusEngine';
import { useJackpotStore } from './jackpotStore';

interface GameState {
  // ── Denomination / bet system ─────────────────────────────────────────────
  denomination: number;
  betMultiple:  number;
  betPerLine:   number;
  activeLines:  number;
  denomSelected: boolean;

  // ── Balance ───────────────────────────────────────────────────────────────
  balance:     number;
  depositDone: boolean;

  // ── Spin state ────────────────────────────────────────────────────────────
  phase:          GamePhase;
  stopPositions:  number[];
  visibleGrid:    SymbolId[][];
  pendingGrid:    SymbolId[][] | null;
  spinningReels:  boolean[];
  buffaloNoteDisplay: { col: number; label: string; key: number } | null;

  lastWinLines:      WinLine[];
  lastScatterResult: ScatterResult | null;
  totalWinThisSpin:  number;
  lastWinAmount:     number;
  freeSpinsTotalWin: number;   // accumulates wins across all free spins

  activeBonusType:    BonusGameType | null;
  bonusTriggerBet:    number;
  freeSpinsRemaining: number;
  freeSpinsMultiplier: number;
  isFreeSpinActive:   boolean;

  gambleStreak: number;
  gambleAmount: number;

  autoSpinActive: boolean;
  autoSpinCount:  number;

  nuggetCount:    number;
  nuggetHoldSeeds: boolean[];

  // ── Actions ───────────────────────────────────────────────────────────────
  selectDenomination: (denom: number) => void;
  setBetMultiple:     (mult: number)  => void;
  setLines:           (lines: number) => void;
  addDeposit:         (amount: number) => void;
  completeDeposit:    () => void;
  /** Legacy compat */
  setBetIndex:        (index: number) => void;

  triggerSpin:       () => void;
  completeSpin:      () => void;
  openGamble:        () => void;
  takeWin:           () => void;
  resolveGamble:     (outcome: GambleOutcome) => void;
  collectGamble:     () => void;
  triggerBonus:      () => void;
  resolveBonus:      (prize: BonusPrize) => void;
  startAutoSpin:     (count: number) => void;
  stopAutoSpin:      () => void;
  decrementAutoSpin: () => void;
}

const INITIAL_GRID: SymbolId[][] = Array.from({ length: 5 }, () =>
  [SymbolId.COIN, SymbolId.LOTUS, SymbolId.JADE]
);

const DEFAULT_DENOM = 0.10;
const DEFAULT_LINES = 10; // matches first line option for default 10¢ denom [10, 25]
const DEFAULT_MULT  = 1;

export const useGameStore = create<GameState>((set, get) => ({
  denomination:  DEFAULT_DENOM,
  betMultiple:   DEFAULT_MULT,
  betPerLine:    calcBetPerLine(DEFAULT_DENOM, DEFAULT_MULT),
  activeLines:   DEFAULT_LINES,
  denomSelected: false,

  balance:     0,
  depositDone: false,

  phase:         'IDLE',
  stopPositions: [0, 0, 0, 0, 0],
  visibleGrid:   INITIAL_GRID,
  pendingGrid:          null,
  spinningReels:        [false, false, false, false, false],
  buffaloNoteDisplay:   null,

  lastWinLines:      [],
  lastScatterResult: null,
  totalWinThisSpin:  0,
  lastWinAmount:     0,
  freeSpinsTotalWin: 0,

  activeBonusType:     null,
  bonusTriggerBet:     0,
  freeSpinsRemaining:  0,
  freeSpinsMultiplier: 1,
  isFreeSpinActive:    false,

  gambleStreak: 0,
  gambleAmount: 0,

  autoSpinActive: false,
  autoSpinCount:  0,

  nuggetCount:     0,
  nuggetHoldSeeds: Array(15).fill(false),

  // ── Denomination selection ────────────────────────────────────────────────
  selectDenomination: (denom) => {
    const cfg  = getDenomConfig(denom);
    const mult = cfg.multiples[0];
    const lines = cfg.lines[0];          // start at lowest line count
    set({
      denomination: denom,
      betMultiple:  mult,
      betPerLine:   calcBetPerLine(denom, mult),
      activeLines:  lines,
      denomSelected: true,
    });
  },

  setBetMultiple: (mult) => {
    const { denomination } = get();
    set({ betMultiple: mult, betPerLine: calcBetPerLine(denomination, mult) });
  },

  setLines: (lines) => {
    const cfg   = getDenomConfig(get().denomination);
    const valid = cfg.lines.includes(lines) ? lines : cfg.lines[0];
    set({ activeLines: valid });
  },

  addDeposit:    (amount) => set(s => ({ balance: parseFloat((s.balance + amount).toFixed(2)) })),
  completeDeposit: ()    => set({ depositDone: true }),

  setBetIndex: (index) => {
    const denom = DENOM_CONFIGS[index]?.denomination ?? DEFAULT_DENOM;
    get().selectDenomination(denom);
  },

  // ── Spin ─────────────────────────────────────────────────────────────────
  triggerSpin: () => {
    const { balance, betPerLine, activeLines, phase, isFreeSpinActive } = get();
    if (phase !== 'IDLE' && phase !== 'FREE_SPINS') return;
    const totalBet = parseFloat((betPerLine * activeLines).toFixed(2));
    if (!isFreeSpinActive && balance < totalBet) return;

    const result = spin();

    set({
      phase:         'SPINNING',
      spinningReels: [true, true, true, true, true],
      lastWinLines:      [],
      lastScatterResult: null,
      totalWinThisSpin:  0,
      lastWinAmount:     0,
      freeSpinsTotalWin: isFreeSpinActive ? get().freeSpinsTotalWin : 0,
      balance: isFreeSpinActive
        ? balance
        : parseFloat((balance - totalBet).toFixed(2)),
      pendingGrid:   result.visibleGrid,
      stopPositions: result.stopPositions,
    });
  },

  completeSpin: () => {
    const {
      betPerLine, activeLines, freeSpinsMultiplier, isFreeSpinActive,
      freeSpinsRemaining, pendingGrid, stopPositions, freeSpinsTotalWin,
    } = get();

    if (!pendingGrid) {
      set({ phase: 'IDLE', spinningReels: [false, false, false, false, false] });
      return;
    }

    try {
      const totalBet    = parseFloat((betPerLine * activeLines).toFixed(2));
      const result      = { visibleGrid: pendingGrid, stopPositions };
      const winLines    = evaluatePaylines(result.visibleGrid, betPerLine);
      const scatterResult = evaluateScatters(result.visibleGrid, totalBet);

      const jackpotStore = useJackpotStore.getState();
      jackpotStore.contributeFromBet(totalBet);
      const jackpotTier = jackpotStore.checkAndTrigger(result.visibleGrid);

      let totalWin = winLines.reduce((s, w) => s + w.payout, 0) + scatterResult.payout;
      if (isFreeSpinActive) totalWin *= freeSpinsMultiplier;
      if (jackpotTier) totalWin += jackpotStore.values[jackpotTier];

      const nuggetResult          = evaluateNuggets(result.visibleGrid);
      const newFreeSpinsRemaining = isFreeSpinActive ? freeSpinsRemaining - 1 : freeSpinsRemaining;

      set({
        phase:         'EVALUATING',
        visibleGrid:   result.visibleGrid,
        stopPositions: result.stopPositions,
        spinningReels: [false, false, false, false, false],
        lastWinLines:      winLines,
        lastScatterResult: scatterResult,
        totalWinThisSpin:  parseFloat(totalWin.toFixed(2)),
        freeSpinsRemaining: newFreeSpinsRemaining,
        nuggetCount:       nuggetResult.count,
      });

      // ── Priority: Buffalo Rush > Scatter Free Spins > Free Spin continue > Normal ──

      if (nuggetResult.triggerFeature) {
        // 6+ Buffalo (or Diamond Buffalo) → Buffalo Rush
        const nugCount = Math.min(nuggetResult.count, 6);
        const seeds    = Array(15).fill(false).map((_, i) => i < nugCount);
        set({ phase: 'BONUS_ACTIVE', activeBonusType: 'NUGGET_HOLD', nuggetHoldSeeds: seeds });

      } else if (scatterResult.triggerBonus && !isFreeSpinActive) {
        // 3 Trống Đồng on middle reels → trigger Free Games
        set({ phase: 'BONUS_TRIGGER', bonusTriggerBet: totalBet });

      } else if (isFreeSpinActive) {
        // During free spins — credit win and check if session is done
        const newFSTW = parseFloat((freeSpinsTotalWin + totalWin).toFixed(2));
        set({ balance: parseFloat((get().balance + totalWin).toFixed(2)), freeSpinsTotalWin: newFSTW });

        if (newFreeSpinsRemaining > 0) {
          set({ phase: 'FREE_SPINS' });
        } else {
          set({
            phase:               'IDLE',
            isFreeSpinActive:    false,
            freeSpinsMultiplier: 1,
            lastWinAmount:       newFSTW,
            freeSpinsTotalWin:   0,
          });
        }

      } else {
        // Normal spin — credit win
        set({
          balance:      parseFloat((get().balance + totalWin).toFixed(2)),
          lastWinAmount: parseFloat(totalWin.toFixed(2)),
          phase:        'IDLE',
        });
      }
    } catch {
      set({ phase: 'IDLE', spinningReels: [false, false, false, false, false] });
    }
  },

  openGamble: () => {
    const { lastWinAmount, balance } = get();
    if (lastWinAmount <= 0) return;
    set({
      phase:        'GAMBLE_ACTIVE',
      gambleAmount: lastWinAmount,
      balance:      parseFloat((balance - lastWinAmount).toFixed(2)),
      lastWinAmount: 0,
    });
  },

  takeWin: () => {
    // Win is already in balance — just dismiss the offer
    set({ lastWinAmount: 0, totalWinThisSpin: 0 });
  },

  resolveGamble: (outcome) => {
    const { gambleStreak, balance } = get();
    if (outcome.won) {
      const maxed = gambleStreak + 1 >= 5;
      set({
        gambleAmount:  outcome.newAmount,
        gambleStreak:  gambleStreak + 1,
        phase:         maxed ? 'IDLE' : 'GAMBLE_ACTIVE',
        balance:       maxed ? parseFloat((balance + outcome.newAmount).toFixed(2)) : balance,
        lastWinAmount: maxed ? 0 : outcome.newAmount,
      });
    } else {
      set({ gambleAmount: 0, gambleStreak: 0, lastWinAmount: 0, phase: 'IDLE' });
    }
  },

  collectGamble: () => {
    const { gambleAmount, balance } = get();
    set({
      balance:      parseFloat((balance + gambleAmount).toFixed(2)),
      gambleAmount: 0, gambleStreak: 0, lastWinAmount: 0, phase: 'IDLE',
    });
  },

  // Scatter triggered → always FREE_SPINS with 6 games
  triggerBonus: () => {
    const config = buildFreeSpinsConfig();
    set({
      phase:               'BONUS_ACTIVE',
      activeBonusType:     'FREE_SPINS',
      freeSpinsRemaining:  config.spinsAwarded,
      freeSpinsMultiplier: config.multiplier,
    });
  },

  resolveBonus: (prize) => {
    const { balance } = get();
    if (prize.type === 'FREE_SPINS') {
      set({
        phase:               'FREE_SPINS',
        isFreeSpinActive:    true,
        freeSpinsRemaining:  prize.config.spinsAwarded,
        freeSpinsMultiplier: prize.config.multiplier,
        activeBonusType:     null,
        freeSpinsTotalWin:   0,
      });
    } else if (prize.type === 'NUGGET_HOLD') {
      set({
        balance:         parseFloat((balance + prize.totalAmount).toFixed(2)),
        activeBonusType: null,
        phase:           'IDLE',
        lastWinAmount:   prize.totalAmount,
      });
    }
  },

  startAutoSpin:     (count) => set({ autoSpinActive: true,  autoSpinCount: count }),
  stopAutoSpin:      ()      => set({ autoSpinActive: false, autoSpinCount: 0 }),
  decrementAutoSpin: ()      => {
    const { autoSpinCount } = get();
    if (autoSpinCount > 0) {
      const n = autoSpinCount - 1;
      set(n === 0 ? { autoSpinActive: false, autoSpinCount: 0 } : { autoSpinCount: n });
    }
  },
}));
