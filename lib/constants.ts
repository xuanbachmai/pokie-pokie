import { GameSymbol, JackpotConfig, JackpotTier, Payline, SymbolId } from '@/types/game';

export const SYMBOLS: Record<SymbolId, GameSymbol> = {
  [SymbolId.DRAGON]: {
    id: SymbolId.DRAGON, label: 'Rồng', emoji: '🐉',
    weight: 1, isWild: false, isScatter: false,
    payouts: { 3: 25, 4: 100, 5: 500 },
    color: '#FF4D6D',
  },
  [SymbolId.TIGER]: {
    id: SymbolId.TIGER, label: 'Phượng', emoji: '🦅',
    weight: 2, isWild: false, isScatter: false,
    payouts: { 3: 15, 4: 50, 5: 200 },
    color: '#FF8C00',
  },
  [SymbolId.PANDA]: {
    id: SymbolId.PANDA, label: 'Hoa Sen', emoji: '🪷',
    weight: 3, isWild: false, isScatter: false,
    payouts: { 3: 10, 4: 35, 5: 100 },
    color: '#FF85A1',
  },
  [SymbolId.KOI]: {
    id: SymbolId.KOI, label: 'Đèn Lồng', emoji: '🏮',
    weight: 4, isWild: false, isScatter: false,
    payouts: { 3: 8, 4: 25, 5: 75 },
    color: '#FF6B00',
  },
  [SymbolId.LOTUS]: {
    id: SymbolId.LOTUS, label: 'Tre Xanh', emoji: '🎋',
    weight: 5, isWild: false, isScatter: false,
    payouts: { 3: 5, 4: 15, 5: 50 },
    color: '#2E7D32',
  },
  [SymbolId.COIN]: {
    id: SymbolId.COIN, label: 'Phở', emoji: '🍜',
    weight: 6, isWild: false, isScatter: false,
    payouts: { 3: 3, 4: 10, 5: 30 },
    color: '#FFD700',
  },
  [SymbolId.JADE]: {
    id: SymbolId.JADE, label: 'Lúa', emoji: '🌾',
    weight: 6, isWild: false, isScatter: false,
    payouts: { 3: 2, 4: 8, 5: 20 },
    color: '#8BC34A',
  },
  [SymbolId.WILD]: {
    id: SymbolId.WILD, label: 'Hổ WILD', emoji: '🐯',
    weight: 2, isWild: true, isScatter: false,
    payouts: { 3: 20, 4: 75, 5: 300 },
    color: '#FF8C00',
  },
  [SymbolId.SCATTER]: {
    id: SymbolId.SCATTER, label: 'Trống Đồng', emoji: '🥁',
    weight: 1, isWild: false, isScatter: true,
    payouts: { 3: 5, 4: 20, 5: 100 },
    color: '#CD7F32',
  },
  [SymbolId.NUGGET]: {
    id: SymbolId.NUGGET, label: 'Trâu', emoji: '🐃',
    weight: 3, isWild: false, isScatter: false,
    payouts: { 3: 5, 4: 15, 5: 50 },
    color: '#8B5E3C',
  },
  [SymbolId.SPECIAL]: {
    id: SymbolId.SPECIAL, label: 'Trâu Kim Cương', emoji: '💎',
    weight: 1, isWild: false, isScatter: true,
    payouts: { 3: 5, 4: 20, 5: 100 },
    color: '#00BFFF',
  },
};

export const NUGGET_THRESHOLDS = { FEATURE: 6, MINI: 8, MINOR: 10, MAJOR: 12, GRAND: 15 };

export const REEL_SIZE = 50;

export const PAYLINES: Payline[] = [
  // ── Lines 1-3: straight rows ──────────────────────────────────────────────
  [1, 1, 1, 1, 1],  // 1  mid row
  [0, 0, 0, 0, 0],  // 2  top row
  [2, 2, 2, 2, 2],  // 3  bottom row

  // ── Lines 4-7: classic V shapes ───────────────────────────────────────────
  [0, 1, 2, 1, 0],  // 4  V down
  [2, 1, 0, 1, 2],  // 5  V up

  // ── Lines 6-9: staircase shapes ───────────────────────────────────────────
  [0, 0, 1, 2, 2],  // 6  stair down-right
  [2, 2, 1, 0, 0],  // 7  stair up-right
  [1, 0, 0, 0, 1],  // 8  U top
  [1, 2, 2, 2, 1],  // 9  U bottom

  // ── Lines 10-15: hat / bowl variations ───────────────────────────────────
  [0, 1, 1, 1, 0],  // 10 top hat
  [2, 1, 1, 1, 2],  // 11 bottom bowl
  [1, 0, 1, 2, 1],  // 12 left dip
  [1, 2, 1, 0, 1],  // 13 right dip
  [0, 0, 1, 0, 0],  // 14 top centre dip
  [2, 2, 1, 2, 2],  // 15 bottom centre dip

  // ── Lines 16-21: mid variations ───────────────────────────────────────────
  [1, 1, 0, 1, 1],  // 16 mid-top peak
  [1, 1, 2, 1, 1],  // 17 mid-bottom valley
  [0, 1, 0, 1, 0],  // 18 top zigzag
  [2, 1, 2, 1, 2],  // 19 bottom zigzag
  [0, 0, 2, 0, 0],  // 20 top dip centre
  [2, 2, 0, 2, 2],  // 21 bottom peak centre

  // ── Lines 22-25: crossing shapes ─────────────────────────────────────────
  [1, 0, 2, 0, 1],  // 22 cross left
  [1, 2, 0, 2, 1],  // 23 cross right
  [0, 2, 0, 2, 0],  // 24 wide V down
  [2, 0, 2, 0, 2],  // 25 wide V up

  // ══ Lines 26-50: extended patterns ══════════════════════════════════════

  // ── Lines 26-30: sharp zigzags ────────────────────────────────────────────
  [0, 2, 0, 2, 0],  // 26 alt top-bottom-top (same as 24, kept for line count)
  [2, 0, 2, 0, 2],  // 27 alt bot-top-bot
  [0, 1, 2, 1, 2],  // 28 descending right
  [2, 1, 0, 1, 0],  // 29 ascending right
  [0, 2, 1, 2, 0],  // 30 deep V

  // ── Lines 31-35: left-lean heavy ─────────────────────────────────────────
  [0, 0, 0, 1, 2],  // 31 top-left to bottom-right diagonal
  [2, 2, 2, 1, 0],  // 32 bottom-left to top-right diagonal
  [0, 0, 0, 2, 2],  // 33 step down right
  [2, 2, 2, 0, 0],  // 34 step up right
  [1, 0, 0, 1, 2],  // 35 dip start

  // ── Lines 36-40: right-lean heavy ────────────────────────────────────────
  [0, 1, 2, 2, 2],  // 36 curve down right
  [2, 1, 0, 0, 0],  // 37 curve up right
  [0, 1, 1, 2, 2],  // 38 gentle slope down
  [2, 1, 1, 0, 0],  // 39 gentle slope up
  [1, 2, 2, 1, 0],  // 40 arc-right

  // ── Lines 41-45: centre-heavy ────────────────────────────────────────────
  [0, 1, 0, 1, 2],  // 41 wavy top
  [2, 1, 2, 1, 0],  // 42 wavy bottom
  [0, 0, 1, 1, 2],  // 43 step middle
  [2, 2, 1, 1, 0],  // 44 step middle reverse
  [1, 0, 2, 2, 1],  // 45 dip right

  // ── Lines 46-50: extreme corners ─────────────────────────────────────────
  [0, 2, 2, 2, 0],  // 46 bottom channel
  [2, 0, 0, 0, 2],  // 47 top channel
  [0, 2, 1, 0, 2],  // 48 cross-over
  [2, 0, 1, 2, 0],  // 49 cross-over reverse
  [1, 2, 0, 0, 1],  // 50 diamond bottom
];

export const JACKPOT_CONFIGS: Record<JackpotTier, JackpotConfig> = {
  [JackpotTier.MINI]: {
    tier: JackpotTier.MINI, label: 'MINI BONUS',
    seedAmount: 50, contributionRate: 0.001,
    triggerSymbol: SymbolId.JADE,
    color: '#00D187', bgColor: 'rgba(0,168,107,0.2)',
  },
  [JackpotTier.MINOR]: {
    tier: JackpotTier.MINOR, label: 'MAJOR BONUS',
    seedAmount: 250, contributionRate: 0.002,
    triggerSymbol: SymbolId.COIN,
    color: '#FFD700', bgColor: 'rgba(255,215,0,0.2)',
  },
  [JackpotTier.MAJOR]: {
    tier: JackpotTier.MAJOR, label: 'MAXI BONUS',
    seedAmount: 2500, contributionRate: 0.003,
    triggerSymbol: SymbolId.TIGER,
    color: '#FF8C00', bgColor: 'rgba(255,140,0,0.2)',
  },
  [JackpotTier.GRAND]: {
    tier: JackpotTier.GRAND, label: 'MEGA BONUS',
    seedAmount: 5000, contributionRate: 0.01,   // progressive — grows 1% per total bet
    triggerSymbol: SymbolId.DRAGON,
    color: '#FF4D6D', bgColor: 'rgba(220,20,60,0.2)',
  },
};

// ── Denomination config table (from game spec) ─────────────────────────────
export interface DenomConfig {
  denomination: number;
  label: string;
  color: string;        // chip colour
  lines: number[];
  multiples: number[];
}

export const DENOM_CONFIGS: DenomConfig[] = [
  { denomination: 0.01, label: '1¢',  color: '#B87333', lines: [1, 5, 10, 25, 50], multiples: [1, 2, 3, 5, 10] },
  { denomination: 0.02, label: '2¢',  color: '#A8A9AD', lines: [1, 5, 10, 25, 50], multiples: [1, 2, 3, 5, 10] },
  { denomination: 0.05, label: '5¢',  color: '#4CAF50', lines: [10, 25],           multiples: [1, 2, 3, 4, 8]  },
  { denomination: 0.10, label: '10¢', color: '#2196F3', lines: [10, 25],           multiples: [1, 2, 3]        },
  { denomination: 0.20, label: '20¢', color: '#9C27B0', lines: [1, 5, 10, 20, 25], multiples: [1, 2]          },
  { denomination: 1.00, label: '$1',  color: '#FFD700', lines: [1, 2, 3, 4, 5],   multiples: [1, 2]           },
  { denomination: 2.00, label: '$2',  color: '#FF4D6D', lines: [1, 3, 5],         multiples: [1]             },
];

export function getDenomConfig(denomination: number): DenomConfig {
  return DENOM_CONFIGS.find(c => c.denomination === denomination) ?? DENOM_CONFIGS[3];
}

/** betPerLine computed as denom × multiple; total bet = betPerLine × lines */
export function calcBetPerLine(denomination: number, multiple: number): number {
  return parseFloat((denomination * multiple).toFixed(4));
}

/** Max total bet for a given denomination (top line option × top multiple) */
export function maxTotalBet(denom: DenomConfig): number {
  const lines = denom.lines[denom.lines.length - 1];
  const mult  = denom.multiples[denom.multiples.length - 1];
  return parseFloat((denom.denomination * mult * lines).toFixed(2));
}

/** Min total bet for a given denomination (first line option × first multiple) */
export function minTotalBet(denom: DenomConfig): number {
  return parseFloat((denom.denomination * denom.multiples[0] * denom.lines[0]).toFixed(2));
}

// Legacy exports kept for any remaining callers
export const BET_OPTIONS = [0.01, 0.02, 0.05, 0.10, 0.20, 1.00, 2.00];
export const MAX_TOTAL_BET = 20;
export const MIN_TOTAL_BET = 0.01;
export function minLines(betPerLine: number): number { return 1; }
export function maxLines(betPerLine: number): number { return 25; }

export const DRAGON_EGG_MULTIPLIERS = [5, 10, 25, 50, 100];
export const LANTERN_PRIZES = [20, 50, 100, 200, 500, 20, 50, 100];
