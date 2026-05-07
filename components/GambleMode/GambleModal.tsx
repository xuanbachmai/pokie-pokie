'use client';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { resolveRedBlack, resolveSuit } from '@/lib/gambleEngine';
import { CardDraw } from '@/types/game';
import { formatCredits } from '@/lib/utils';
import { useGambleAudio } from '@/hooks/useGameAudio';
import { supabase, GambleHistoryRow } from '@/lib/supabase';

/* ── Symbol helpers ─────────────────────────────────────────────────────── */
const SUIT_SYMBOL: Record<CardDraw['suit'], string> = {
  spades: '♠', hearts: '♥', diamonds: '♦', clubs: '♣',
};
const SUIT_COLOR: Record<CardDraw['suit'], string> = {
  spades: '#1a1a1a', hearts: '#C0000A', diamonds: '#C0000A', clubs: '#1a1a1a',
};

/* ── Mini history card ──────────────────────────────────────────────────── */
interface HistoryEntry { card: CardDraw; won: boolean; id: number }

function MiniCard({ card, won }: { card: CardDraw; won: boolean }) {
  const sym   = SUIT_SYMBOL[card.suit];
  const color = SUIT_COLOR[card.suit];
  return (
    <motion.div
      initial={{ scale: 0, x: -8, opacity: 0 }}
      animate={{ scale: 1, x: 0,  opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className="relative flex flex-col items-center justify-between rounded-md select-none"
      style={{
        width: 28, height: 40,
        background: 'linear-gradient(160deg, #FFFEF8, #F5F0E5)',
        border: `1.5px solid ${won ? '#00C853' : '#D32F2F'}`,
        boxShadow: won ? '0 0 6px rgba(0,200,83,0.5)' : '0 0 4px rgba(211,47,47,0.45)',
        padding: '2px 3px',
        color,
      }}
    >
      {/* Top-left: suit only */}
      <div style={{ alignSelf: 'flex-start', fontSize: 8, lineHeight: 1, fontWeight: 900 }}>{sym}</div>
      {/* Center suit */}
      <div style={{ fontSize: 13, lineHeight: 1 }}>{sym}</div>
      {/* Bottom-right: suit only, rotated */}
      <div style={{ alignSelf: 'flex-end', fontSize: 8, lineHeight: 1, fontWeight: 900, transform: 'rotate(180deg)' }}>{sym}</div>
      {/* Win / lose dot */}
      <div style={{
        position: 'absolute', top: -4, right: -4,
        width: 9, height: 9, borderRadius: '50%',
        background: won ? '#00C853' : '#D32F2F',
        border: '1px solid rgba(0,0,0,0.3)',
      }} />
    </motion.div>
  );
}

/* ── Full card face ─────────────────────────────────────────────────────── */
function CardFace({ card }: { card: CardDraw }) {
  const sym   = SUIT_SYMBOL[card.suit];
  const color = SUIT_COLOR[card.suit];
  return (
    <div
      className="w-full h-full rounded-[10px] select-none flex flex-col justify-between"
      style={{
        background: 'linear-gradient(160deg, #FFFEF8 0%, #F8F3E8 100%)',
        padding: '8px 9px',
        color,
        border: '1px solid #d4c9a8',
        boxShadow: 'inset 0 0 0 5px rgba(0,0,0,0.055)',
      }}
    >
      {/* Top-left: suit only */}
      <div style={{ fontSize: 18, lineHeight: 1, fontWeight: 900 }}>{sym}</div>
      {/* Centre: large suit with shadow */}
      <div style={{
        textAlign: 'center',
        fontSize: 72,
        lineHeight: 1,
        filter: `drop-shadow(0 2px 4px ${color === '#1a1a1a' ? 'rgba(0,0,0,0.25)' : 'rgba(180,0,0,0.3)'})`,
      }}>
        {sym}
      </div>
      {/* Bottom-right: suit only, rotated */}
      <div style={{ alignSelf: 'flex-end', fontSize: 18, lineHeight: 1, fontWeight: 900, transform: 'rotate(180deg)' }}>{sym}</div>
    </div>
  );
}

/* ── Card back ──────────────────────────────────────────────────────────── */
function CardBack() {
  return (
    <div
      className="w-full h-full rounded-[10px] overflow-hidden"
      style={{
        backgroundColor: '#7A0010',
        backgroundImage: [
          'linear-gradient(45deg, rgba(255,255,255,0.07) 25%, transparent 25%)',
          'linear-gradient(-45deg, rgba(255,255,255,0.07) 25%, transparent 25%)',
          'linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.07) 75%)',
          'linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.07) 75%)',
        ].join(', '),
        backgroundSize: '14px 14px',
        backgroundPosition: '0 0, 0 7px, 7px -7px, -7px 0px',
        boxShadow: [
          'inset 0 0 0 6px rgba(255,255,255,0.12)',
          'inset 0 0 0 8px rgba(255,255,255,0.05)',
          'inset 0 0 0 9px rgba(180,0,0,0.4)',
        ].join(', '),
        position: 'relative',
      }}
    >
      {/* Inner border frame */}
      <div style={{
        position: 'absolute',
        inset: 7,
        border: '1px solid rgba(255,255,255,0.18)',
        borderRadius: 5,
      }} />
    </div>
  );
}

/* ── GambleModal ────────────────────────────────────────────────────────── */
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

  // ── Load last 5 global draws from Supabase on open ───────────────
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
        const entries: HistoryEntry[] = (data as GambleHistoryRow[])
          .reverse()  // oldest first for display
          .map(row => ({
            id:   historyId.current++,
            won:  row.won,
            card: { suit: row.suit, value: row.value, color: row.color },
          }));
        setHistory(entries);
      });
  }, [show]);

  // ── Realtime: update history when another player draws ───────────
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
          setHistory(prev => [...prev.slice(-4), entry]);
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

    // Persist to Supabase — realtime will update all clients' history panels
    supabase.from('gamble_history').insert({
      suit:  outcome.card.suit,
      value: outcome.card.value,
      color: outcome.card.color,
      won:   outcome.won,
    }).then();   // fire-and-forget

    // Sound: flip immediately, then win/lose after card reveals (~550 ms)
    onFlip();
    setTimeout(() => { outcome.won ? onWin() : onLose(); }, 580);

    setTimeout(() => {
      resolveGamble(outcome);
      setFlipped(false);
      setCard(null);
      setResult(null);
    }, 2200);
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(6px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full mx-4 rounded-2xl overflow-hidden"
            style={{
              maxWidth: 340,
              background: 'radial-gradient(ellipse at 50% 0%, #162B0A 0%, #0A0A0A 65%)',
              border: '2px solid rgba(0,150,60,0.45)',
              boxShadow: '0 0 40px rgba(0,200,83,0.12)',
            }}
            initial={{ scale: 0.85, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.85, y: 30 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          >
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3">
              <div>
                <div className="text-base font-black tracking-wider" style={{ color: '#FFD700' }}>
                  ♠ GAMBLE
                </div>
                <div className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  Streak{' '}
                  <span style={{ color: gambleStreak >= 4 ? '#FF4D6D' : gambleStreak >= 2 ? '#FFD700' : '#88DD88' }}>
                    {gambleStreak} / 5
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-gray-600 uppercase tracking-widest">Current pot</div>
                <div className="text-2xl font-black" style={{ color: '#00D187' }}>
                  {formatCredits(gambleAmount)}
                </div>
              </div>
            </div>

            {/* ── Card history row ── */}
            <div
              className="flex items-center gap-2 mx-4 mb-3 px-3 py-2 rounded-xl"
              style={{ background: 'rgba(0,0,0,0.35)', minHeight: 52 }}
            >
              <span className="text-[9px] text-gray-600 uppercase tracking-widest shrink-0">Last 5</span>
              <div className="flex gap-1.5 items-center flex-wrap">
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

            {/* ── Green felt + 3D card ── */}
            <div
              className="mx-4 mb-4 rounded-xl flex flex-col items-center justify-center gap-3 py-6"
              style={{
                background: 'radial-gradient(ellipse at 50% 35%, #1E5C1E 0%, #0F3010 55%, #081808 100%)',
                border: '1px solid rgba(0,130,50,0.35)',
                minHeight: 200,
              }}
            >
              {/* 3D card flip container */}
              <div style={{ perspective: 700 }}>
                <motion.div
                  style={{
                    width: 100, height: 140,
                    transformStyle: 'preserve-3d' as const,
                    position: 'relative',
                  }}
                  animate={{ rotateY: flipped ? 180 : 0 }}
                  transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
                >
                  {/* Front = card back */}
                  <div style={{ backfaceVisibility: 'hidden' as const, position: 'absolute', inset: 0 }}>
                    <CardBack />
                  </div>
                  {/* Rear = card face (rotated 180° around Y so it faces forward when flipped) */}
                  <div style={{
                    backfaceVisibility: 'hidden' as const,
                    transform: 'rotateY(180deg)',
                    position: 'absolute', inset: 0,
                  }}>
                    {card && <CardFace card={card} />}
                  </div>
                </motion.div>
              </div>

              {/* Win / lose result */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1,   opacity: 1 }}
                    exit={{ scale: 0.5,   opacity: 0 }}
                    className="text-2xl font-black"
                    style={{ color: result === 'win' ? '#00D187' : '#FF4D6D' }}
                  >
                    {result === 'win'
                      ? `✓ WIN! ${formatCredits(gambleAmount * 2)}`
                      : '✗ LOSE '}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Guess buttons (hidden while card is flipping) ── */}
            {!flipped && (
              <div className="px-4 pb-5 flex flex-col gap-2.5">
                {/* Red / Black — 2× */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { type: 'red'   as const, label: '♥ ♦ RED',   color: '#FF5252', bg: 'rgba(170,0,0,0.25)',   border: 'rgba(200,30,30,0.6)' },
                    { type: 'black' as const, label: '♠ ♣ BLACK', color: '#C8C8C8', bg: 'rgba(25,25,25,0.7)',   border: 'rgba(110,110,110,0.5)' },
                  ].map(({ type, label, color, bg, border }) => (
                    <button
                      key={type}
                      onClick={() => handleGuess(type)}
                      className="py-3 rounded-xl font-black text-sm transition-all active:scale-95 flex flex-col items-center leading-tight"
                      style={{ background: bg, border: `1.5px solid ${border}`, color }}
                    >
                      {label}
                      <span className="text-[10px] opacity-55 font-normal mt-0.5">2×</span>
                    </button>
                  ))}
                </div>

                {/* 4 suits — 4× */}
                <div className="grid grid-cols-4 gap-1.5">
                  {(['spades', 'hearts', 'diamonds', 'clubs'] as const).map(suit => {
                    const isRed = suit === 'hearts' || suit === 'diamonds';
                    return (
                      <button
                        key={suit}
                        onClick={() => handleGuess(suit)}
                        className="py-2.5 rounded-xl font-black text-2xl leading-none transition-all active:scale-95 flex flex-col items-center gap-0.5"
                        style={{
                          background: isRed ? 'rgba(140,0,0,0.22)' : 'rgba(18,18,35,0.7)',
                          border:     `1.5px solid ${isRed ? 'rgba(190,0,0,0.4)' : 'rgba(70,70,110,0.5)'}`,
                          color:      isRed ? '#FF5252' : '#A8A8C0',
                        }}
                      >
                        {SUIT_SYMBOL[suit]}
                        <span className="text-[9px] opacity-55 font-normal">4×</span>
                      </button>
                    );
                  })}
                </div>

                {/* Collect */}
                <button
                  onClick={collectGamble}
                  className="w-full py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
                  style={{
                    background: 'rgba(255,215,0,0.07)',
                    border: '1px solid rgba(255,215,0,0.28)',
                    color: '#FFD700',
                  }}
                >
                  COLLECT {formatCredits(gambleAmount)}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
