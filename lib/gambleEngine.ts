import { CardDraw, GambleOutcome } from '@/types/game';
import { randomInt } from './utils';

const SUITS: CardDraw['suit'][] = ['spades', 'hearts', 'diamonds', 'clubs'];

export function drawCard(): CardDraw {
  const suit = SUITS[randomInt(0, 3)];
  const value = randomInt(1, 13);
  const color = suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black';
  return { suit, value, color };
}

export function resolveRedBlack(
  guess: 'red' | 'black',
  currentAmount: number
): GambleOutcome {
  const card = drawCard();
  const won = card.color === guess;
  return { won, card, newAmount: won ? currentAmount * 2 : 0 };
}

export function resolveSuit(
  guess: CardDraw['suit'],
  currentAmount: number
): GambleOutcome {
  const card = drawCard();
  const won = card.suit === guess;
  return { won, card, newAmount: won ? currentAmount * 4 : 0 };
}
