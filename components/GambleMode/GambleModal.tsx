'use client';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { resolveRedBlack, resolveSuit } from '@/lib/gambleEngine';
import { CardDraw } from '@/types/game';
import { formatCredits } from '@/lib/utils';

const SUIT_EMOJI: Record<CardDraw['suit'], string> = {
  spades: '♠️', hearts: '♥️', diamonds: '♦️', clubs: '♣️',
};

const CARD_VALUES: Record<number, string> = {
  1: 'A', 11: 'J', 12: 'Q', 13: 'K',
};

export function GambleModal() {
  const phase = useGameStore(s => s.phase);
  const gambleAmount = useGameStore(s => s.gambleAmount);
  const gambleStreak = useGameStore(s => s.gambleStreak);
  const resolveGamble = useGameStore(s => s.resolveGamble);
  const collectGamble = useGameStore(s => s.collectGamble);

  const [flipped, setFlipped] = useState(false);
  const [card, setCard] = useState<CardDraw | null>(null);
  const [result, setResult] = useState<'win' | 'lose' | null>(null);

  const show = phase === 'GAMBLE_ACTIVE';

  function handleGuess(type: 'red' | 'black' | CardDraw['suit']) {
    if (flipped) return;
    const outcome = type === 'red' || type === 'black'
      ? resolveRedBlack(type, gambleAmount)
      : resolveSuit(type, gambleAmount);

    setCard(outcome.card);
    setFlipped(true);
    setResult(outcome.won ? 'win' : 'lose');

    setTimeout(() => {
      resolveGamble(outcome);
      setFlipped(false);
      setCard(null);
      setResult(null);
    }, 2000);
  }

  const cardDisplay = card
    ? `${CARD_VALUES[card.value] ?? card.value}${SUIT_EMOJI[card.suit]}`
    : '?';

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(4px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative max-w-sm w-full mx-4 rounded-2xl overflow-hidden p-6"
            style={{
              background: 'linear-gradient(135deg, #0a0014, #14001a)',
              border: '2px solid rgba(150,0,220,0.5)',
            }}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
          >
            <div className="text-center mb-4">
              <div className="text-2xl font-black text-purple-400">🃏 GAMBLE MODE</div>
              <div className="text-sm text-gray-400 mt-1">
                Current: <span className="text-gold font-bold">{formatCredits(gambleAmount)}</span>
                {gambleStreak > 0 && <span className="text-purple-400 ml-2">Streak: {gambleStreak}x</span>}
              </div>
            </div>

            {/* Card display */}
            <div className="flex justify-center mb-6">
              <motion.div
                className="w-20 h-28 rounded-xl flex items-center justify-center text-3xl font-black border-2"
                style={{
                  background: flipped
                    ? card?.color === 'red' ? 'rgba(220,20,60,0.2)' : 'rgba(50,50,50,0.8)'
                    : 'linear-gradient(135deg, #1a003d, #2d0057)',
                  borderColor: flipped ? (card?.color === 'red' ? '#DC143C' : '#888') : 'rgba(150,0,220,0.6)',
                  color: card?.color === 'red' ? '#FF4D6D' : '#E0E0E0',
                }}
                animate={flipped ? { rotateY: 0 } : { rotateY: 0 }}
              >
                {flipped ? cardDisplay : '🎴'}
              </motion.div>
            </div>

            {/* Result overlay */}
            <AnimatePresence>
              {result && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center rounded-2xl"
                  style={{
                    background: result === 'win' ? 'rgba(0,200,100,0.15)' : 'rgba(220,20,60,0.15)',
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="text-4xl font-black" style={{ color: result === 'win' ? '#00D187' : '#FF4D6D' }}>
                    {result === 'win' ? `WIN! ${formatCredits(gambleAmount * 2)}` : 'LOSE! 💸'}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Guess buttons */}
            {!flipped && (
              <>
                <div className="text-center text-xs text-gray-500 mb-3 uppercase tracking-widest">
                  2× — Pick Red or Black
                </div>
                <div className="flex gap-3 mb-4">
                  <button
                    onClick={() => handleGuess('red')}
                    className="flex-1 py-2.5 rounded-xl font-black text-sm border-2 border-red-700 text-red-400 hover:bg-red-900/30 transition-colors"
                  >
                    RED ♥♦
                  </button>
                  <button
                    onClick={() => handleGuess('black')}
                    className="flex-1 py-2.5 rounded-xl font-black text-sm border-2 border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors"
                  >
                    BLACK ♠♣
                  </button>
                </div>

                <div className="text-center text-xs text-gray-500 mb-3 uppercase tracking-widest">
                  4× — Pick Exact Suit
                </div>
                <div className="grid grid-cols-4 gap-2 mb-5">
                  {(['spades', 'hearts', 'diamonds', 'clubs'] as const).map(suit => (
                    <button
                      key={suit}
                      onClick={() => handleGuess(suit)}
                      className="py-2 rounded-xl font-black text-lg border-2 hover:scale-105 transition-transform"
                      style={{
                        borderColor: 'rgba(150,0,220,0.4)',
                        background: 'rgba(80,0,140,0.2)',
                        color: suit === 'hearts' || suit === 'diamonds' ? '#FF4D6D' : '#C0C0C0',
                      }}
                    >
                      {SUIT_EMOJI[suit]}
                    </button>
                  ))}
                </div>

                <button
                  onClick={collectGamble}
                  className="w-full py-2 rounded-xl text-sm font-bold border border-gold/30 text-gold hover:bg-gold/10 transition-colors"
                >
                  COLLECT {formatCredits(gambleAmount)}
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
