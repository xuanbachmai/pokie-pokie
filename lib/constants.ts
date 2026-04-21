import { GameSymbol, JackpotConfig, JackpotTier, Payline, SymbolId } from '@/types/game';

export const SYMBOLS: Record<SymbolId, GameSymbol> = {
  [SymbolId.DRAGON]: {
    id: SymbolId.DRAGON, label: 'Dragon', emoji: '🐉',
    weight: 1, isWild: false, isScatter: false,
    payouts: { 3: 25, 4: 100, 5: 500 },
    color: '#FF4D6D',
  },
  [SymbolId.TIGER]: {
    id: SymbolId.TIGER, label: 'Tiger', emoji: '🐯',
    weight: 2, isWild: false, isScatter: false,
    payouts: { 3: 15, 4: 50, 5: 200 },
    color: '#FF8C00',
  },
  [SymbolId.PANDA]: {
    id: SymbolId.PANDA, label: 'Panda', emoji: '🐼',
    weight: 3, isWild: false, isScatter: false,
    payouts: { 3: 10, 4: 35, 5: 100 },
    color: '#E0E0E0',
  },
  [SymbolId.KOI]: {
    id: SymbolId.KOI, label: 'Koi Fish', emoji: '🐟',
    weight: 4, isWild: false, isScatter: false,
    payouts: { 3: 8, 4: 25, 5: 75 },
    color: '#FF6B9D',
  },
  [SymbolId.LOTUS]: {
    id: SymbolId.LOTUS, label: 'Lotus', emoji: '🪷',
    weight: 5, isWild: false, isScatter: false,
    payouts: { 3: 5, 4: 15, 5: 50 },
    color: '#FF85A1',
  },
  [SymbolId.COIN]: {
    id: SymbolId.COIN, label: 'Lucky Coin', emoji: '🪙',
    weight: 6, isWild: false, isScatter: false,
    payouts: { 3: 3, 4: 10, 5: 30 },
    color: '#FFD700',
  },
  [SymbolId.JADE]: {
    id: SymbolId.JADE, label: 'Jade Gem', emoji: '💚',
    weight: 6, isWild: false, isScatter: false,
    payouts: { 3: 2, 4: 8, 5: 20 },
    color: '#00D187',
  },
  [SymbolId.WILD]: {
    id: SymbolId.WILD, label: 'Phoenix', emoji: '🔥',
    weight: 2, isWild: true, isScatter: false,
    payouts: { 3: 20, 4: 75, 5: 300 },
    color: '#FF6D00',
  },
  [SymbolId.SCATTER]: {
    id: SymbolId.SCATTER, label: 'Yin-Yang', emoji: '☯️',
    weight: 1, isWild: false, isScatter: true,
    payouts: { 3: 5, 4: 20, 5: 100 },
    color: '#C0C0C0',
  },
};

export const REEL_SIZE = 50;

export const PAYLINES: Payline[] = [
  [1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0],
  [2, 2, 2, 2, 2],
  [0, 1, 2, 1, 0],
  [2, 1, 0, 1, 2],
  [0, 0, 1, 2, 2],
  [2, 2, 1, 0, 0],
  [1, 0, 0, 0, 1],
  [1, 2, 2, 2, 1],
  [0, 1, 1, 1, 0],
  [2, 1, 1, 1, 2],
  [1, 0, 1, 2, 1],
  [1, 2, 1, 0, 1],
  [0, 0, 1, 0, 0],
  [2, 2, 1, 2, 2],
  [1, 1, 0, 1, 1],
  [1, 1, 2, 1, 1],
  [0, 1, 0, 1, 0],
  [2, 1, 2, 1, 2],
  [0, 0, 2, 0, 0],
  [2, 2, 0, 2, 2],
  [1, 0, 2, 0, 1],
  [1, 2, 0, 2, 1],
  [0, 2, 0, 2, 0],
  [2, 0, 2, 0, 2],
];

export const JACKPOT_CONFIGS: Record<JackpotTier, JackpotConfig> = {
  [JackpotTier.MINI]: {
    tier: JackpotTier.MINI, label: 'MINI',
    seedAmount: 50, contributionRate: 0.001,
    triggerSymbol: SymbolId.JADE,
    color: '#00D187', bgColor: 'rgba(0,168,107,0.2)',
  },
  [JackpotTier.MINOR]: {
    tier: JackpotTier.MINOR, label: 'MINOR',
    seedAmount: 250, contributionRate: 0.002,
    triggerSymbol: SymbolId.COIN,
    color: '#FFD700', bgColor: 'rgba(255,215,0,0.2)',
  },
  [JackpotTier.MAJOR]: {
    tier: JackpotTier.MAJOR, label: 'MAJOR',
    seedAmount: 2500, contributionRate: 0.003,
    triggerSymbol: SymbolId.TIGER,
    color: '#FF8C00', bgColor: 'rgba(255,140,0,0.2)',
  },
  [JackpotTier.GRAND]: {
    tier: JackpotTier.GRAND, label: 'GRAND',
    seedAmount: 25000, contributionRate: 0.005,
    triggerSymbol: SymbolId.DRAGON,
    color: '#FF4D6D', bgColor: 'rgba(220,20,60,0.2)',
  },
};

export const BET_OPTIONS = [0.01, 0.05, 0.10, 0.25, 0.50, 1.00, 2.00, 5.00];

export const DRAGON_EGG_MULTIPLIERS = [5, 10, 25, 50, 100];
export const LANTERN_PRIZES = [20, 50, 100, 200, 500, 20, 50, 100];
