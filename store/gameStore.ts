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
import { contributeToJackpotsDB, winJackpotDB } from '@/lib/jackpotSync';
import { JACKPOT_CONFIGS } from '@/lib/constants';
import { JackpotTier } from '@/types/game';
import { GRAND_JACKPOT_SEED } from './jackpotStore';

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
  highlightedWinLineIdx: number | null;
  anticipationCols: number[];
  reelStopDelays: number[];

  lastWinLines:      WinLine[];
  lastScatterResult: ScatterResult | null;
  totalWinThisSpin:  number;
  lastWinAmount:     number;
  freeSpinsTotalWin: number;   // accumulates wins across all free spins

  activeBonusType:    BonusGameType | null;
  bonusTriggerBet:    number;
  freeSpinsRemaining: number;
  freeSpinsTotal:     number;   // total spins awarded (for X/6 display)
  freeSpinsPlayed:    number;   // spins completed so far (for N/6 display)
  freeSpinsMultiplier: number;
  isFreeSpinActive:   boolean;

  gambleStreak: number;
  gambleAmount: number;

  autoSpinActive: boolean;
  autoSpinCount:  number;

  nuggetCount:    number;
  nuggetHoldSeeds: boolean[];

  bigWinTier: 'WIN' | 'GREAT' | 'BIG' | 'MEGA' | null;
  reelJustStopped: number | null;

  // ── Diamond Rush state ────────────────────────────────────────────────────
  diamondRushSpins:  number;   // spins awarded for this Diamond Rush session
  diamondRushPrize:  number;   // Buffalo Rush prize to credit when DR ends

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
  startAutoSpin:        (count: number) => void;
  stopAutoSpin:         () => void;
  decrementAutoSpin:    () => void;
  setHighlightedWinLine:(idx: number | null) => void;
  setAnticipation:(cols: number[], delays: number[]) => void;
  clearBigWin: () => void;
  triggerDiamondRush: (spins: number, buffaloPrize: number) => void;
  endDiamondRush:     (drPrize: number) => void;
  /** Dev cheat — instantly enters Buffalo Rush with a Diamond Buffalo seeded */
  forceBuffaloRush:   () => void;
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
  highlightedWinLineIdx: null,
  anticipationCols: [],
  reelStopDelays: [800, 1100, 1400, 1700, 2200],

  lastWinLines:      [],
  lastScatterResult: null,
  totalWinThisSpin:  0,
  lastWinAmount:     0,
  freeSpinsTotalWin: 0,

  activeBonusType:     null,
  bonusTriggerBet:     0,
  freeSpinsRemaining:  0,
  freeSpinsTotal:      0,
  freeSpinsPlayed:     0,
  freeSpinsMultiplier: 1,
  isFreeSpinActive:    false,

  gambleStreak: 0,
  gambleAmount: 0,

  autoSpinActive: false,
  autoSpinCount:  0,

  nuggetCount:     0,
  nuggetHoldSeeds: Array(15).fill(false),

  bigWinTier:      null,
  reelJustStopped: null,

  diamondRushSpins: 0,
  diamondRushPrize: 0,

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
    // Rescale jackpot seeds for the new denomination
    useJackpotStore.getState().setDenom(denom);
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
    const { balance, betPerLine, activeLines, phase, isFreeSpinActive, lastWinAmount } = get();
    if (phase !== 'IDLE' && phase !== 'FREE_SPINS') return;

    // Auto-collect any pending win before the next spin
    const effectiveBalance = lastWinAmount > 0
      ? parseFloat((balance + lastWinAmount).toFixed(2))
      : balance;

    const totalBet = parseFloat((betPerLine * activeLines).toFixed(2));
    if (!isFreeSpinActive && effectiveBalance < totalBet) return;

    // On spins 5 & 6 of the Trống Đồng free games, boost buffalo appearance
    const { isFreeSpinActive: fsActive, freeSpinsRemaining: fsLeft } = get();
    const isLateFree = fsActive && fsLeft <= 2;
    const result = spin(isLateFree ? { lateFreeSpin: true } : undefined);

    set({
      phase:         'SPINNING',
      spinningReels: [true, true, true, true, true],
      lastWinLines:      [],
      lastScatterResult: null,
      totalWinThisSpin:  0,
      lastWinAmount:     0,
      freeSpinsTotalWin: isFreeSpinActive ? get().freeSpinsTotalWin : 0,
      balance: isFreeSpinActive
        ? effectiveBalance
        : parseFloat((effectiveBalance - totalBet).toFixed(2)),
      pendingGrid:   result.visibleGrid,
      stopPositions: result.stopPositions,
      anticipationCols: [],
      reelStopDelays: [800, 1100, 1400, 1700, 2200],
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
      const winLines    = evaluatePaylines(result.visibleGrid, betPerLine, activeLines);
      const scatterResult = evaluateScatters(result.visibleGrid, totalBet);

      const jackpotStore = useJackpotStore.getState();
      jackpotStore.contributeFromBet(totalBet);

      // ── Write EXACT contribution to DB once per spin (fire-and-forget) ──
      // Contribution rates: Mega = 1% of bet, Grand = 0.2% of bet
      const megaContrib  = parseFloat((totalBet * JACKPOT_CONFIGS[JackpotTier.GRAND].contributionRate).toFixed(2));
      const grandContrib = parseFloat((totalBet * 0.002).toFixed(2));
      contributeToJackpotsDB(megaContrib, grandContrib).catch(() => {});

      const jackpotTier = jackpotStore.checkAndTrigger(result.visibleGrid);

      let totalWin = winLines.reduce((s, w) => s + w.payout, 0) + scatterResult.payout;
      if (isFreeSpinActive) totalWin *= freeSpinsMultiplier;
      if (jackpotTier) totalWin += jackpotStore.values[jackpotTier];

      // Big win tier for celebration banner
      const winRatio = totalBet > 0 ? totalWin / totalBet : 0;
      const bigWinTier =
        winRatio >= 50 ? 'MEGA' :
        winRatio >= 20 ? 'BIG'  :
        winRatio >= 10 ? 'GREAT':
        winRatio >= 5  ? 'WIN'  : null;

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
        // 6+ Buffalo → Buffalo Rush; seed count: 50%=1, 30%=2, 15%=3, 5%=4
        // Kept low so filling all 15 (Grand Jackpot) is genuinely rare
        const rng       = Math.random();
        const seedCount = rng < 0.50 ? 1 : rng < 0.80 ? 2 : rng < 0.95 ? 3 : 4;
        const seeds     = Array(15).fill(false).map((_, i) => i < seedCount);
        set({ phase: 'BONUS_ACTIVE', activeBonusType: 'NUGGET_HOLD', nuggetHoldSeeds: seeds });

      } else if (scatterResult.triggerBonus && !isFreeSpinActive) {
        // 3 Trống Đồng on middle reels → trigger Free Games
        // Pre-calculate config so the trigger modal can show the real values
        const freeConfig = buildFreeSpinsConfig();
        set({
          phase:               'BONUS_TRIGGER',
          bonusTriggerBet:     totalBet,
          freeSpinsRemaining:  freeConfig.spinsAwarded,
          freeSpinsTotal:      freeConfig.spinsAwarded,
          freeSpinsPlayed:     0,
          freeSpinsMultiplier: freeConfig.multiplier,
        });

      } else if (isFreeSpinActive) {
        // During free spins — accumulate wins but do NOT credit to balance yet.
        // When the session ends, lastWinAmount holds the total so the player
        // can choose to Take Win or Gamble, exactly like a normal spin.
        const newFSTW = parseFloat((freeSpinsTotalWin + totalWin).toFixed(2));
        const newPlayed = get().freeSpinsPlayed + 1;
        set({ freeSpinsTotalWin: newFSTW, freeSpinsPlayed: newPlayed });

        // Scatter retrigger during free spins — award 6 more spins
        if (scatterResult.triggerBonus) {
          const bonus = 6;
          set({
            freeSpinsRemaining: newFreeSpinsRemaining + bonus,
            freeSpinsTotal:     get().freeSpinsTotal + bonus,
            phase:              'FREE_SPINS',
          });
        } else if (newFreeSpinsRemaining > 0) {
          set({ phase: 'FREE_SPINS' });
        } else {
          set({
            phase:               'IDLE',
            isFreeSpinActive:    false,
            freeSpinsMultiplier: 1,
            lastWinAmount:       newFSTW,
            freeSpinsTotalWin:   0,
            freeSpinsPlayed:     0,
            bigWinTier:          bigWinTier as 'WIN' | 'GREAT' | 'BIG' | 'MEGA' | null,
          });
        }

      } else {
        // Normal spin — hold win as pending; credit only when user clicks Take Win
        set({
          lastWinAmount: parseFloat(totalWin.toFixed(2)),
          phase:         'IDLE',
          bigWinTier:    bigWinTier as 'WIN' | 'GREAT' | 'BIG' | 'MEGA' | null,
        });
      }
    } catch {
      set({ phase: 'IDLE', spinningReels: [false, false, false, false, false] });
    }
  },

  openGamble: () => {
    const { lastWinAmount } = get();
    if (lastWinAmount <= 0) return;
    // Win was never added to balance — just move it into gamble
    set({
      phase:         'GAMBLE_ACTIVE',
      gambleAmount:  lastWinAmount,
      lastWinAmount: 0,
    });
  },

  takeWin: () => {
    // Credit the pending win into balance now
    const { lastWinAmount, balance } = get();
    set({
      balance:          parseFloat((balance + lastWinAmount).toFixed(2)),
      lastWinAmount:    0,
      totalWinThisSpin: 0,
    });
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

  // Config is pre-calculated in completeSpin; just transition to BONUS_ACTIVE
  triggerBonus: () => {
    set({ phase: 'BONUS_ACTIVE', activeBonusType: 'FREE_SPINS' });
  },

  resolveBonus: (prize) => {
    const { balance } = get();
    if (prize.type === 'FREE_SPINS') {
      set({
        phase:               'FREE_SPINS',
        isFreeSpinActive:    true,
        freeSpinsRemaining:  prize.config.spinsAwarded,
        freeSpinsPlayed:     0,
        freeSpinsMultiplier: prize.config.multiplier,
        activeBonusType:     null,
        freeSpinsTotalWin:   0,
      });
    } else if (prize.type === 'NUGGET_HOLD') {
      const amount = parseFloat(prize.totalAmount.toFixed(2));
      if (prize.skipGamble) {
        // Grand / Mega jackpot wins go straight to credit — no gamble offered
        set({
          activeBonusType:  null,
          phase:            'IDLE',
          balance:          parseFloat((balance + amount).toFixed(2)),
          lastWinAmount:    0,
          totalWinThisSpin: amount,
        });
      } else {
        // Regular bonus win — keep as pending so Gamble/Take Win works
        set({
          activeBonusType:  null,
          phase:            'IDLE',
          lastWinAmount:    amount,
          totalWinThisSpin: amount,
        });
      }
    }
  },

  setHighlightedWinLine: (idx) => set({ highlightedWinLineIdx: idx }),
  setAnticipation: (cols, delays) => set({ anticipationCols: cols, reelStopDelays: delays }),
  clearBigWin: () => set({ bigWinTier: null }),

  triggerDiamondRush: (spins, buffaloPrize) => set({
    phase:            'DIAMOND_RUSH',
    activeBonusType:  null,
    diamondRushSpins: spins,
    diamondRushPrize: buffaloPrize,
  }),

  endDiamondRush: (drPrize) => {
    const { diamondRushPrize } = get();
    const total = parseFloat((diamondRushPrize + drPrize).toFixed(2));
    // Keep as pending win — Gamble/Take Win handles crediting to balance
    set({
      phase:            'IDLE',
      lastWinAmount:    total,
      totalWinThisSpin: total,
      activeBonusType:  null,
      diamondRushSpins: 0,
      diamondRushPrize: 0,
    });
  },

  forceBuffaloRush: () => {
    // Grid: 8 buffalo total — 1 SPECIAL (diamond) + 7 NUGGET, spread across all 5 reels
    const forcedGrid: SymbolId[][] = [
      [SymbolId.NUGGET,  SymbolId.DRAGON,  SymbolId.NUGGET ],  // col 0
      [SymbolId.SPECIAL, SymbolId.NUGGET,  SymbolId.LOTUS  ],  // col 1 — DIAMOND BUFFALO
      [SymbolId.NUGGET,  SymbolId.TIGER,   SymbolId.NUGGET ],  // col 2
      [SymbolId.DRAGON,  SymbolId.NUGGET,  SymbolId.JADE   ],  // col 3
      [SymbolId.NUGGET,  SymbolId.COIN,    SymbolId.TIGER  ],  // col 4
    ];
    // nuggetHoldSeeds: 15 booleans, index = row*5 + col
    // Seeds match the NUGGET/SPECIAL positions in forcedGrid:
    // col0-row0 ✓, col1-row0 ✓(diamond), col2-row0 ✓, col4-row0 ✓
    // col1-row1 ✓, col3-row1 ✓
    // col0-row2 ✓, col2-row2 ✓
    const seeds = [
      true,  true,  true,  false, true,   // row 0: col 0,1(SPECIAL),2,4
      false, true,  false, true,  false,  // row 1: col 1,3
      true,  false, true,  false, false,  // row 2: col 0,2
    ];
    set({
      phase:          'BONUS_ACTIVE',
      activeBonusType: 'NUGGET_HOLD',
      visibleGrid:    forcedGrid,
      pendingGrid:    null,
      nuggetCount:    8,
      nuggetHoldSeeds: seeds,
      spinningReels:  [false, false, false, false, false],
      lastWinLines:   [],
      lastWinAmount:  0,
      totalWinThisSpin: 0,
    });
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
