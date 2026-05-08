'use client';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { resolveRedBlack, resolveSuit } from '@/lib/gambleEngine';
import { CardDraw } from '@/types/game';
import { formatCredits } from '@/lib/utils';
import { useGambleAudio } from '@/hooks/useGameAudio';
import { supabase, GambleHistoryRow } from '@/lib/supabase';
import { trackGamble } from '@/lib/analytics';

/* ── Rank label ─────────────────────────────────────────────────────────── */
function rankLabel(value: number): string {
  if (value === 1)  return 'A';
  if (value === 11) return 'J';
  if (value === 12) return 'Q';
  if (value === 13) return 'K';
  return String(value);
}

/* ── Suit helpers ────────────────────────────────────────────────────────── */
const SUIT_SYMBOL: Record<CardDraw['suit'], string> = {
  spades: '♠', hearts: '♥', diamonds: '♦', clubs: '♣',
};
const SUIT_COLOR: Record<CardDraw['suit'], string> = {
  spades: '#111', hearts: '#C0000A', diamonds: '#C0000A', clubs: '#111',
};

/* ── Mini history card (newest on LEFT) ─────────────────────────────────── */
interface HistoryEntry { card: CardDraw; won: boolean; id: number }

function MiniCard({ card, won }: { card: CardDraw; won: boolean }) {
  const sym   = SUIT_SYMBOL[card.suit];
  const color = SUIT_COLOR[card.suit];
  const rank  = rankLabel(card.value);
  return (
    <motion.div
      initial={{ scale: 0, x: 12, opacity: 0 }}
      animate={{ scale: 1, x: 0,  opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className="relative flex flex-col items-center justify-between rounded-lg select-none shrink-0"
      style={{
        width: 32, height: 46,
        background: 'linear-gradient(160deg, #FFFEF8, #F5F0E5)',
        border: `2px solid ${won ? '#00C853' : '#D32F2F'}`,
        boxShadow: won
          ? '0 0 8px rgba(0,200,83,0.55), 0 2px 6px rgba(0,0,0,0.35)'
          : '0 0 6px rgba(211,47,47,0.5), 0 2px 6px rgba(0,0,0,0.35)',
        padding: '3px 3px',
        color,
      }}
    >
      <div style={{ fontSize: 18, lineHeight: 1 }}>{sym}</div>
    </motion.div>
  );
}

/* ── Full card face ──────────────────────────────────────────────────────── */
function CardFace({ card }: { card: CardDraw }) {
  const sym   = SUIT_SYMBOL[card.suit];
  const color = SUIT_COLOR[card.suit];
  const rank  = rankLabel(card.value);
  const isRed = card.color === 'red';
  return (
    <div
      className="w-full h-full rounded-xl select-none flex flex-col justify-between"
      style={{
        background: 'linear-gradient(160deg, #FFFEF8 0%, #F5EDD8 100%)',
        padding: '10px 12px',
        color,
        border: '1px solid #d4c9a8',
        boxShadow: `inset 0 0 0 6px rgba(0,0,0,0.04), 0 4px 20px ${isRed ? 'rgba(180,0,0,0.25)' : 'rgba(0,0,0,0.3)'}`,
      }}
    >
      {/* Top-left corner */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1 }}>
        <span style={{ fontSize: 22, fontWeight: 900 }}>{rank}</span>
        <span style={{ fontSize: 18, marginTop: -2 }}>{sym}</span>
      </div>
      {/* Centre suit */}
      <div style={{
        textAlign: 'center',
        fontSize: 80,
        lineHeight: 1,
        filter: `drop-shadow(0 3px 6px ${isRed ? 'rgba(180,0,0,0.35)' : 'rgba(0,0,0,0.3)'})`,
      }}>
        {sym}
      </div>
      {/* Bottom-right corner (rotated) */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1, transform: 'rotate(180deg)' }}>
        <span style={{ fontSize: 22, fontWeight: 900 }}>{rank}</span>
        <span style={{ fontSize: 18, marginTop: -2 }}>{sym}</span>
      </div>
    </div>
  );
}

/* ── Card back ───────────────────────────────────────────────────────────── */
function CardBack() {
  return (
    <div
      className="w-full h-full rounded-xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #8B0000 0%, #6B0010 50%, #8B0000 100%)',
        boxShadow: [
          'inset 0 0 0 5px rgba(255,255,255,0.1)',
          'inset 0 0 0 7px rgba(255,255,255,0.04)',
          'inset 0 0 0 9px rgba(120,0,0,0.5)',
        ].join(', '),
        position: 'relative',
      }}
    >
      {/* Diamond pattern */}
      <div style={{
        position: 'absolute', inset: 8,
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: 6,
        backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 12px), repeating-linear-gradient(-45deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 12px)',
      }} />
      {/* Centre logo */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 28, opacity: 0.35,
      }}>
        🌾
      </div>
    </div>
  );
}

/* ── Streak pip row ──────────────────────────────────────────────────────── */
function StreakPips({ streak }: { streak: number }) {
  return (
    <div className="flex gap-1.5 items-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          style={{
            width: 10, height: 10, borderRadius: '50%',
            background: i < streak
              ? (streak >= 4 ? '#FF4D6D' : streak >= 2 ? '#FFD700' : '#00C853')
              : 'rgba(255,255,255,0.1)',
            border: `1.5px solid ${i < streak ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.07)'}`,
          }}
          animate={i < streak ? { scale: [1, 1.25, 1] } : { scale: 1 }}
          transition={{ duration: 0.4, delay: i * 0.08 }}
        />
      ))}
    </div>
  );
}

/* ── GambleModal ─────────────────────────────────────────────────────────── */
export function GambleModal() {
  const phase         = useGameStore(s => s.phase);
  const gambleAmount  = useGameStore(s => s.gambleAmount);
  const gambleStreak  = useGameStore(s => s.gambleStreak);
  const resolveGamble = useGameStore(s => s.resolveGamble);
  const collectGamble = useGameStore(s => s.collectGamble);

  const [flipped, setFlipped] = useState(false);
  const [card,    setCard]    = useState<CardDraw | null>(null);
  const [result,  setResult]  = useState<'win' | 'lose' | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const historyId = useRef(0);
  const { onFlip, onWin, onLose } = useGambleAudio();

  const show = phase === 'GAMBLE_ACTIVE';

  // Load last 5 global draws on open — newest on LEFT
  useEffect(() => {
    if (!show) return;
    setFlipped(false);
    setCard(null);
    setResult(null);

    supabase
      .from('gamble_history')
      .select('id, suit, value, color, won')
      .order('id', { ascending: false })
      .limit(5)
      .then(({ data }) => {
        if (!data) return;
        // ascending: false means newest first → keep that order (newest on LEFT)
        const entries: HistoryEntry[] = (data as GambleHistoryRow[]).map(row => ({
          id:   historyId.current++,
          won:  row.won,
          card: { suit: row.suit, value: row.value, color: row.color },
        }));
        setHistory(entries);
      });
  }, [show]);

  // Realtime: prepend newest to LEFT
  useEffect(() => {
    const channel = supabase
      .channel('gamble-history-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'gamble_history' },
        (payload) => {
          const row = payload.new as GambleHistoryRow;
          const entry: HistoryEntry = {
            id:   historyId.current++,
            won:  row.won,
            card: { suit: row.suit, value: row.value, color: row.color },
          };
          setHistory(prev => [entry, ...prev.slice(0, 4)]);
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  function handleGuess(type: 'red' | 'black' | CardDraw['suit']) {
    if (flipped) return;
    const outcome = type === 'red' || type === 'black'
      ? resolveRedBlack(type, gambleAmount)
      : resolveSuit(type, gambleAmount);

    setCard(outcome.card);
    setFlipped(true);
    setResult(outcome.won ? 'win' : 'lose');

    trackGamble(outcome.won, gambleAmount);

    supabase.from('gamble_history').insert({
      suit:  outcome.card.suit,
      value: outcome.card.value,
      color: outcome.card.color,
      won:   outcome.won,
    }).then();

    onFlip();
    setTimeout(() => { outcome.won ? onWin() : onLose(); }, 580);

    setTimeout(() => {
      resolveGamble(outcome);
      setFlipped(false);
      setCard(null);
      setResult(null);
    }, 2200);
  }

  const dangerStreak  = gambleStreak >= 4;
  const warningStreak = gambleStreak >= 2;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 flex items-end justify-center z-50 pb-0"
          style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full rounded-t-3xl overflow-hidden"
            style={{
              maxWidth: 420,
              background: 'linear-gradient(180deg, #0D1F0D 0%, #080F08 100%)',
              border: '1.5px solid rgba(0,180,60,0.3)',
              borderBottom: 'none',
              boxShadow: '0 -8px 60px rgba(0,200,83,0.15)',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Pull handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.12)' }} />
            </div>

            {/* ── Header ── */}
            <div className="flex items-center justify-between px-5 pt-2 pb-3">
              <div>
                <div className="text-lg font-black tracking-widest" style={{ color: '#FFD700' }}>
                  ♠ GAMBLE
                </div>
                <StreakPips streak={gambleStreak} />
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {dangerStreak ? '⚠️ DANGER ZONE' : `Streak ${gambleStreak}/5`}
                </div>
                <motion.div
                  className="text-3xl font-black"
                  style={{ color: '#00D187', fontFamily: 'var(--font-jackpot)' }}
                  animate={result === 'win' ? { scale: [1, 1.2, 1], color: ['#00D187', '#FFD700', '#00D187'] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  {formatCredits(gambleAmount)}
                </motion.div>
              </div>
            </div>

            {/* ── History row — newest LEFT ── */}
            <div className="mx-4 mb-3 px-3 py-2 rounded-2xl flex items-center gap-2"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="text-[9px] text-gray-600 uppercase tracking-widest shrink-0">Recent</span>
              <div className="flex gap-2 items-center">
                <AnimatePresence mode="popLayout" initial={false}>
                  {history.map(entry => (
                    <MiniCard key={entry.id} card={entry.card} won={entry.won} />
                  ))}
                </AnimatePresence>
                {history.length === 0 && (
                  <span className="text-[11px] text-gray-700 italic">— no cards yet —</span>
                )}
              </div>
            </div>

            {/* ── Felt table + card ── */}
            <div
              className="mx-4 mb-4 rounded-2xl flex items-center justify-center gap-6 py-5 px-4"
              style={{
                background: 'radial-gradient(ellipse at 50% 30%, #1A5C1A 0%, #0C380C 55%, #071507 100%)',
                border: '1px solid rgba(0,140,50,0.3)',
                boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5)',
                minHeight: 200,
                position: 'relative',
              }}
            >
              {/* Subtle felt grain */}
              <div style={{
                position: 'absolute', inset: 0, borderRadius: 16, opacity: 0.04,
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'4\' height=\'4\' viewBox=\'0 0 4 4\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 3h1v1H1V3zm2-2h1v1H3V1z\' fill=\'%23fff\' fill-opacity=\'1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
              }} />

              {/* 3D card */}
              <div style={{ perspective: 800 }}>
                <motion.div
                  style={{
                    width: 110, height: 155,
                    transformStyle: 'preserve-3d' as const,
                    position: 'relative',
                  }}
                  animate={{ rotateY: flipped ? 180 : 0 }}
                  transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
                >
                  <div style={{ backfaceVisibility: 'hidden' as const, position: 'absolute', inset: 0 }}>
                    <CardBack />
                  </div>
                  <div style={{
                    backfaceVisibility: 'hidden' as const,
                    transform: 'rotateY(180deg)',
                    position: 'absolute', inset: 0,
                  }}>
                    {card && <CardFace card={card} />}
                  </div>
                </motion.div>
              </div>

              {/* Result badge */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ scale: 0.4, opacity: 0, y: 10 }}
                    animate={{ scale: 1,   opacity: 1, y: 0 }}
                    exit={{ scale: 0.4,   opacity: 0 }}
                    className="flex flex-col items-center gap-1"
                  >
                    <div
                      className="text-4xl font-black"
                      style={{
                        color: result === 'win' ? '#00D187' : '#FF4D6D',
                        textShadow: result === 'win'
                          ? '0 0 20px rgba(0,209,135,0.7)'
                          : '0 0 20px rgba(255,77,109,0.7)',
                        fontFamily: 'var(--font-jackpot)',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {result === 'win' ? 'WIN!' : 'BUST'}
                    </div>
                    {result === 'win' && (
                      <div className="text-xl font-black" style={{ color: '#FFD700' }}>
                        {formatCredits(gambleAmount * 2)}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Guess buttons ── */}
            {!flipped && (
              <div className="px-4 pb-6 flex flex-col gap-2.5">
                {/* Red / Black */}
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { type: 'red'   as const, label: 'RED',   suits: '♥ ♦', color: '#FF5252', bg: 'rgba(160,0,0,0.3)',   border: 'rgba(220,30,30,0.6)' },
                    { type: 'black' as const, label: 'BLACK', suits: '♠ ♣', color: '#D0D0D0', bg: 'rgba(20,20,20,0.75)', border: 'rgba(120,120,120,0.45)' },
                  ]).map(({ type, label, suits, color, bg, border }) => (
                    <motion.button
                      key={type}
                      onClick={() => handleGuess(type)}
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ scale: 1.02 }}
                      className="py-4 rounded-2xl font-black text-sm flex flex-col items-center gap-0.5"
                      style={{ background: bg, border: `2px solid ${border}`, color }}
                    >
                      <span className="text-xl leading-none tracking-widest">{suits}</span>
                      <span className="text-xs font-black tracking-widest mt-1">{label}</span>
                      <span className="text-[10px] opacity-50 font-normal">
                        win {formatCredits(gambleAmount * 2)}
                      </span>
                    </motion.button>
                  ))}
                </div>

                {/* 4 suits */}
                <div className="grid grid-cols-4 gap-1.5">
                  {(['hearts', 'diamonds', 'spades', 'clubs'] as const).map(suit => {
                    const isRed = suit === 'hearts' || suit === 'diamonds';
                    return (
                      <motion.button
                        key={suit}
                        onClick={() => handleGuess(suit)}
                        whileTap={{ scale: 0.94 }}
                        whileHover={{ scale: 1.04 }}
                        className="py-3 rounded-xl font-black text-2xl leading-none flex flex-col items-center gap-0.5"
                        style={{
                          background: isRed ? 'rgba(130,0,0,0.28)' : 'rgba(15,15,30,0.75)',
                          border:     `1.5px solid ${isRed ? 'rgba(200,0,0,0.45)' : 'rgba(80,80,120,0.45)'}`,
                          color:      isRed ? '#FF5252' : '#A0A0C8',
                        }}
                      >
                        {SUIT_SYMBOL[suit]}
                        <span className="text-[9px] opacity-50 font-normal">4×</span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Collect */}
                <motion.button
                  onClick={collectGamble}
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ scale: 1.01 }}
                  className="w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2"
                  style={{
                    background: 'rgba(255,215,0,0.08)',
                    border: '1.5px solid rgba(255,215,0,0.3)',
                    color: '#FFD700',
                  }}
                >
                  <span>💰</span>
                  <span>COLLECT {formatCredits(gambleAmount)}</span>
                </motion.button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
