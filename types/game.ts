export enum SymbolId {
  DRAGON = 'DRAGON',
  TIGER = 'TIGER',
  PANDA = 'PANDA',
  KOI = 'KOI',
  LOTUS = 'LOTUS',
  COIN = 'COIN',
  JADE = 'JADE',
  WILD = 'WILD',
  SCATTER = 'SCATTER',
  NUGGET = 'NUGGET',
  SPECIAL = 'SPECIAL',
}

export interface GameSymbol {
  id: SymbolId;
  label: string;
  emoji: string;
  weight: number;
  isWild: boolean;
  isScatter: boolean;
  payouts: Partial<Record<number, number>>;
  color: string;
}

export enum JackpotTier {
  MINI = 'MINI',
  MINOR = 'MINOR',
  MAJOR = 'MAJOR',
  GRAND = 'GRAND',
}

export interface JackpotConfig {
  tier: JackpotTier;
  label: string;
  seedAmount: number;
  contributionRate: number;
  triggerSymbol: SymbolId;
  color: string;
  bgColor: string;
}

export type Payline = [number, number, number, number, number];

export interface WinLine {
  paylineIndex: number;
  symbols: SymbolId[];
  matchedSymbol: SymbolId;
  matchCount: number;
  payout: number;
  cellPositions: [number, number][];
}

export interface ScatterResult {
  count: number;
  payout: number;
  triggerBonus: boolean;
}

export interface SpinResult {
  visibleGrid: SymbolId[][];
  stopPositions: number[];
}

export type BonusGameType = 'FREE_SPINS' | 'NUGGET_HOLD';

export interface FreeSpinsConfig {
  spinsAwarded: number;
  multiplier: number;
}

export type BonusPrize =
  | { type: 'FREE_SPINS'; config: FreeSpinsConfig }
  | { type: 'NUGGET_HOLD'; count: number; totalAmount: number };

export interface NuggetResult {
  count: number;
  jackpotTier: JackpotTier | null;
  triggerFeature: boolean;
}

export interface CardDraw {
  suit: 'spades' | 'hearts' | 'diamonds' | 'clubs';
  value: number;
  color: 'red' | 'black';
}

export interface GambleOutcome {
  won: boolean;
  card: CardDraw;
  newAmount: number;
}

export type GamePhase =
  | 'IDLE'
  | 'SPINNING'
  | 'EVALUATING'
  | 'WIN_DISPLAY'
  | 'BONUS_TRIGGER'
  | 'BONUS_ACTIVE'
  | 'GAMBLE_OFFER'
  | 'GAMBLE_ACTIVE'
  | 'FREE_SPINS';
