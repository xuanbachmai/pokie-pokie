'use client';
import { create } from 'zustand';
import {
  BonusGameType, BonusPrize, FreeSpinsConfig, GamePhase,
  GambleOutcome, ScatterResult, SymbolId, WinLine,
} from '@/types/game';
import { BET_OPTIONS } from '@/lib/constants';
import { evaluatePaylines, evaluateScatters, spin } from '@/lib/gameEngine';
import { buildFreeSpinsConfig, selectBonusType } from '@/lib/bonusEngine';
import { useJackpotStore } from './jackpotStore';

interface GameState {
  balance: number;
  betPerLine: number;
  activeLines: number;

  phase: GamePhase;
  stopPositions: number[];
  visibleGrid: SymbolId[][];
  spinningReels: boolean[];

  lastWinLines: WinLine[];
  lastScatterResult: ScatterResult | null;
  pendingWin: number;
  totalWinThisSpin: number;

  activeBonusType: BonusGameType | null;
  bonusTriggerBet: number;
  freeSpinsRemaining: number;
  freeSpinsMultiplier: number;
  isFreeSpinActive: boolean;

  gambleStreak: number;
  gambleAmount: number;

  autoSpinActive: boolean;
  autoSpinCount: number;

  setBetIndex: (index: number) => void;
  setLines: (lines: number) => void;
  triggerSpin: () => void;
  completeSpin: () => void;
  creditWin: () => void;
  openGamble: () => void;
  resolveGamble: (outcome: GambleOutcome) => void;
  collectGamble: () => void;
  triggerBonus: () => void;
  resolveBonus: (prize: BonusPrize) => void;
  startAutoSpin: (count: number) => void;
  stopAutoSpin: () => void;
  decrementAutoSpin: () => void;
}

const INITIAL_GRID: SymbolId[][] = Array.from({ length: 5 }, () =>
  [SymbolId.COIN, SymbolId.LOTUS, SymbolId.JADE]
);

export const useGameStore = create<GameState>((set, get) => ({
  balance: 1000,
  betPerLine: 0.10,
  activeLines: 25,

  phase: 'IDLE',
  stopPositions: [0, 0, 0, 0, 0],
  visibleGrid: INITIAL_GRID,
  spinningReels: [false, false, false, false, false],

  lastWinLines: [],
  lastScatterResult: null,
  pendingWin: 0,
  totalWinThisSpin: 0,

  activeBonusType: null,
  bonusTriggerBet: 0,
  freeSpinsRemaining: 0,
  freeSpinsMultiplier: 1,
  isFreeSpinActive: false,

  gambleStreak: 0,
  gambleAmount: 0,

  autoSpinActive: false,
  autoSpinCount: 0,

  setBetIndex: (index) => {
    set({ betPerLine: BET_OPTIONS[index] ?? 0.10 });
  },

  setLines: (lines) => {
    set({ activeLines: Math.max(1, Math.min(25, lines)) });
  },

  triggerSpin: () => {
    const { balance, betPerLine, activeLines, phase, isFreeSpinActive } = get();
    if (phase !== 'IDLE' && phase !== 'FREE_SPINS') return;
    const totalBet = betPerLine * activeLines;
    if (!isFreeSpinActive && balance < totalBet) return;

    set({
      phase: 'SPINNING',
      spinningReels: [true, true, true, true, true],
      lastWinLines: [],
      lastScatterResult: null,
      totalWinThisSpin: 0,
      pendingWin: 0,
      balance: isFreeSpinActive ? balance : balance - totalBet,
    });
  },

  completeSpin: () => {
    const { betPerLine, activeLines, freeSpinsMultiplier, isFreeSpinActive, freeSpinsRemaining } = get();
    const totalBet = betPerLine * activeLines;

    const result = spin();
    const winLines = evaluatePaylines(result.visibleGrid, betPerLine);
    const scatterResult = evaluateScatters(result.visibleGrid, totalBet);

    const jackpotStore = useJackpotStore.getState();
    jackpotStore.contributeFromBet(totalBet);
    const jackpotTier = jackpotStore.checkAndTrigger(result.visibleGrid);

    let totalWin = winLines.reduce((s, w) => s + w.payout, 0) + scatterResult.payout;
    if (isFreeSpinActive) totalWin *= freeSpinsMultiplier;

    if (jackpotTier) {
      totalWin += jackpotStore.values[jackpotTier];
    }

    const newFreeSpinsRemaining = isFreeSpinActive ? freeSpinsRemaining - 1 : freeSpinsRemaining;

    set({
      phase: 'EVALUATING',
      visibleGrid: result.visibleGrid,
      stopPositions: result.stopPositions,
      spinningReels: [false, false, false, false, false],
      lastWinLines: winLines,
      lastScatterResult: scatterResult,
      totalWinThisSpin: totalWin,
      pendingWin: totalWin,
      freeSpinsRemaining: newFreeSpinsRemaining,
    });

    if (scatterResult.triggerBonus && !isFreeSpinActive) {
      set({ phase: 'BONUS_TRIGGER', bonusTriggerBet: totalBet });
    } else if (totalWin > 0 && !isFreeSpinActive) {
      // Normal win: show win display and let player decide to collect or gamble
      set({ phase: 'WIN_DISPLAY' });
    } else if (isFreeSpinActive) {
      // During free spins: auto-credit wins, continue or end
      const newBalance = get().balance + totalWin;
      set({ balance: newBalance, pendingWin: 0 });
      if (newFreeSpinsRemaining > 0) {
        set({ phase: 'FREE_SPINS' });
      } else {
        set({ phase: 'IDLE', isFreeSpinActive: false, freeSpinsMultiplier: 1 });
      }
    } else {
      set({ phase: 'IDLE' });
    }
  },

  creditWin: () => {
    const { pendingWin, balance, freeSpinsRemaining, isFreeSpinActive } = get();
    set({ balance: balance + pendingWin, pendingWin: 0 });
    if (isFreeSpinActive && freeSpinsRemaining > 0) {
      set({ phase: 'FREE_SPINS' });
    } else if (isFreeSpinActive && freeSpinsRemaining <= 0) {
      set({ phase: 'IDLE', isFreeSpinActive: false, freeSpinsMultiplier: 1 });
    } else {
      set({ phase: 'IDLE' });
    }
  },

  openGamble: () => {
    const { pendingWin } = get();
    if (pendingWin <= 0) return;
    set({ phase: 'GAMBLE_ACTIVE', gambleAmount: pendingWin });
  },

  resolveGamble: (outcome) => {
    const { gambleStreak, balance } = get();
    if (outcome.won) {
      set({
        gambleAmount: outcome.newAmount,
        gambleStreak: gambleStreak + 1,
        phase: gambleStreak + 1 >= 5 ? 'IDLE' : 'GAMBLE_ACTIVE',
        balance: gambleStreak + 1 >= 5 ? balance + outcome.newAmount : balance,
        pendingWin: gambleStreak + 1 >= 5 ? 0 : outcome.newAmount,
      });
    } else {
      set({ gambleAmount: 0, pendingWin: 0, gambleStreak: 0, phase: 'IDLE' });
    }
  },

  collectGamble: () => {
    const { gambleAmount, balance } = get();
    set({ balance: balance + gambleAmount, gambleAmount: 0, pendingWin: 0, gambleStreak: 0, phase: 'IDLE' });
  },

  triggerBonus: () => {
    const { lastScatterResult, bonusTriggerBet } = get();
    const bonusType = selectBonusType();
    if (bonusType === 'FREE_SPINS') {
      const config = buildFreeSpinsConfig(lastScatterResult?.count ?? 3);
      set({
        phase: 'BONUS_ACTIVE',
        activeBonusType: bonusType,
        freeSpinsRemaining: config.spinsAwarded,
        freeSpinsMultiplier: config.multiplier,
      });
    } else {
      set({ phase: 'BONUS_ACTIVE', activeBonusType: bonusType });
    }
  },

  resolveBonus: (prize) => {
    const { balance } = get();
    if (prize.type === 'FREE_SPINS') {
      set({
        phase: 'FREE_SPINS',
        isFreeSpinActive: true,
        freeSpinsRemaining: prize.config.spinsAwarded,
        freeSpinsMultiplier: prize.config.multiplier,
        activeBonusType: null,
        balance: balance + (get().pendingWin),
        pendingWin: 0,
      });
    } else {
      const amount = prize.type === 'DRAGON_EGG' ? prize.amount : prize.amount;
      set({
        balance: balance + amount,
        pendingWin: 0,
        activeBonusType: null,
        phase: 'IDLE',
      });
    }
  },

  startAutoSpin: (count) => {
    set({ autoSpinActive: true, autoSpinCount: count });
  },

  stopAutoSpin: () => {
    set({ autoSpinActive: false, autoSpinCount: 0 });
  },

  decrementAutoSpin: () => {
    const { autoSpinCount } = get();
    if (autoSpinCount > 0) {
      const newCount = autoSpinCount - 1;
      if (newCount === 0) {
        set({ autoSpinActive: false, autoSpinCount: 0 });
      } else {
        set({ autoSpinCount: newCount });
      }
    }
  },
}));
