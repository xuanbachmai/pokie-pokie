'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { JackpotPanel } from '@/components/Jackpot/JackpotPanel';
import { ReelGrid } from '@/components/Reels/ReelGrid';
import { ControlPanel } from './ControlPanel';
import { WinDisplay } from './WinDisplay';
import { BonusModal } from '@/components/BonusGame/BonusModal';
import { GambleModal } from '@/components/GambleMode/GambleModal';
import { useAutoSpin } from '@/hooks/useAutoSpin';
import { useGameStore } from '@/store/gameStore';
import { useSpinSequence } from '@/hooks/useSpinSequence';
import { useGameAudio } from '@/hooks/useGameAudio';
import { getAudio } from '@/lib/audioEngine';
import { DepositScreen } from '@/components/GameMenu/DepositScreen';
import { DenomSelector } from '@/components/GameMenu/DenomSelector';
import { BuffaloNoteDisplay } from '@/components/Reels/BuffaloNoteDisplay';
import { BuffaloRushEffect } from '@/components/Effects/BuffaloRushEffect';

const SceneCanvas = dynamic(
  () => import('@/components/Effects/SceneCanvas').then(m => m.SceneCanvas),
  { ssr: false }
);

const DeltaBackground = dynamic(
  () => import('@/components/Effects/DeltaBackground').then(m => m.DeltaBackground),
  { ssr: false }
);

function KeyboardControls() {
  const phase = useGameStore(s => s.phase);
  const { startSpin } = useSpinSequence();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.code !== 'Space') return;
      e.preventDefault();
      if (phase === 'IDLE' || phase === 'FREE_SPINS') {
        startSpin();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, startSpin]);

  return null;
}

function AutoSpinRunner() {
  useAutoSpin();
  return null;
}

function AudioRunner() {
  useGameAudio();
  return null;
}

function FreeSpinAutoRunner() {
  const phase = useGameStore(s => s.phase);
  const isFreeSpinActive = useGameStore(s => s.isFreeSpinActive);
  const freeSpinsRemaining = useGameStore(s => s.freeSpinsRemaining);

  useEffect(() => {
    if (phase !== 'FREE_SPINS' || !isFreeSpinActive || freeSpinsRemaining <= 0) return;

    const t = setTimeout(() => {
      const store = useGameStore.getState();
      store.triggerSpin();
      if (useGameStore.getState().phase !== 'SPINNING') return;

      const spinning = [true, true, true, true, true];
      [800, 1100, 1400, 1700, 2200].forEach((delay, i) => {
        setTimeout(() => {
          spinning[i] = false;
          useGameStore.setState({ spinningReels: [...spinning] });
          if (i === 4) setTimeout(() => useGameStore.getState().completeSpin(), 100);
        }, delay);
      });
    }, 600);

    return () => clearTimeout(t);
  }, [phase, isFreeSpinActive, freeSpinsRemaining]);

  return null;
}

export function SlotMachine() {
  const [rulesOpen,    setRulesOpen]    = useState(false);
  const [isTopUpMode,  setIsTopUpMode]  = useState(false);
  const [muted,        setMuted]        = useState(false);
  const depositDone   = useGameStore(s => s.depositDone);
  const denomSelected = useGameStore(s => s.denomSelected);

  // ── Lobby state ────────────────────────────────────────────────────────
  const [showDeposit, setShowDeposit] = useState(!depositDone);
  const [showDenom,   setShowDenom]   = useState(false);

  function openTopUp() { setIsTopUpMode(true); setShowDeposit(true); }

  function onDepositComplete() {
    setShowDeposit(false);
    if (!isTopUpMode) setShowDenom(true); // first-time only → go to denom picker
    setIsTopUpMode(false);
  }
  function onDenomComplete() { setShowDenom(false); }

  // Always render DeltaBackground; conditionally show lobby screens on top
  const showGame = !showDeposit && !showDenom && denomSelected;

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      <DeltaBackground />

      {/* ── Lobby screens (z-[400] overlay) ── */}
      {showDeposit && (
        <DepositScreen onComplete={onDepositComplete} isTopUp={isTopUpMode} />
      )}
      {!showDeposit && (showDenom || !denomSelected) && (
        <DenomSelector onComplete={onDenomComplete} />
      )}

      {/* ── Main game ── */}
      {showGame && (
        <>
          <SceneCanvas />
          <AudioRunner />
          <AutoSpinRunner />
          <FreeSpinAutoRunner />
          <KeyboardControls />

          {/* Main game card */}
          <div
            className="relative z-10 w-full max-w-2xl mx-auto px-4 py-4 flex flex-col gap-4"
            style={{ minHeight: '100dvh', justifyContent: 'center' }}
          >
            {/* Title row */}
            <div className="flex items-center justify-between gap-2">
              {/* Add Credits button */}
              <button
                onClick={openTopUp}
                className="flex flex-col items-center justify-center rounded-xl px-3 py-2"
                style={{ background: 'rgba(0,200,80,0.12)', border: '1px solid rgba(0,200,80,0.35)', color: '#00C853', minWidth: 56 }}
              >
                <span className="text-xl leading-none font-black">+</span>
                <span className="text-[9px] font-black tracking-wide leading-none mt-1">CREDITS</span>
              </button>

              <div className="text-center flex-1">
                <h1 className="text-3xl font-black tracking-widest"
                  style={{ background: 'linear-gradient(90deg, #FFD700, #CC0000, #FFD700)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundSize: '200%' }}>
                  🏮 VIETNAM MAZE 🏮
                </h1>
                <p className="text-xs text-gray-500 tracking-widest uppercase mt-0.5">Mekong Treasures</p>
              </div>

              {/* Right buttons: SOUND + RULES */}
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => {
                    const next = !muted;
                    setMuted(next);
                    getAudio().setMuted(next);
                  }}
                  className="flex flex-col items-center justify-center rounded-xl px-3 py-2"
                  style={{
                    background: muted ? 'rgba(255,60,60,0.15)' : 'rgba(255,255,255,0.08)',
                    border: `1px solid ${muted ? 'rgba(255,60,60,0.45)' : 'rgba(255,255,255,0.2)'}`,
                    color: muted ? '#ff6060' : '#aaaaaa',
                    minWidth: 56,
                    transition: 'all 0.2s',
                  }}
                >
                  <span className="text-xl leading-none">{muted ? '🔇' : '🔊'}</span>
                  <span className="text-[9px] font-black tracking-wide leading-none mt-1">
                    {muted ? 'MUTED' : 'SOUND'}
                  </span>
                </button>

                <button
                  onClick={() => setRulesOpen(true)}
                  className="flex flex-col items-center justify-center rounded-xl px-3 py-2"
                  style={{ background: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.3)', color: '#FFD700', minWidth: 56 }}
                >
                  <span className="text-xl leading-none">📖</span>
                  <span className="text-[9px] font-black tracking-wide leading-none mt-1">RULES</span>
                </button>
              </div>
            </div>

            {/* Jackpot panel */}
            <JackpotPanel />

            {/* Reel grid */}
            <div className="relative">
              <ReelGrid />
              <WinDisplay />
              <BuffaloNoteDisplay />
            </div>

            {/* Control panel */}
            <div
              className="rounded-2xl p-5"
              style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,215,0,0.15)' }}
            >
              <ControlPanel onChangeDenom={() => setShowDenom(true)} />
            </div>
          </div>

          <BonusModal />
          <GambleModal />
          <BuffaloRushEffect />

          {/* Game Rules Modal */}
          <AnimatePresence>
            {rulesOpen && <GameRulesModal onClose={() => setRulesOpen(false)} />}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

function GameRulesModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(6px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1a0005, #0a0020)', border: '1px solid rgba(255,215,0,0.35)' }}
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3"
          style={{ background: 'linear-gradient(90deg, rgba(204,0,0,0.4), rgba(255,215,0,0.15), rgba(204,0,0,0.4))' }}>
          <span className="text-base font-black" style={{ color: '#FFD700' }}>📖 GAME RULES</span>
          <button onClick={onClose} className="text-gray-400 text-xl leading-none hover:text-white">×</button>
        </div>

        <div className="px-5 py-4 flex flex-col gap-4 max-h-[75vh] overflow-y-auto text-sm">

          {/* How wins work */}
          <Section title="📏 HOW WINS WORK">
            <div className="text-[12px] text-gray-300 flex flex-col gap-1">
              <div>• Wins pay <span className="text-yellow-400 font-bold">left-to-right on paylines only</span> — 3, 4 or 5 matching symbols from reel 1.</div>
              <div>• 🐯 <span className="text-yellow-400 font-bold">Wild</span> substitutes for any regular symbol on a line.</div>
              <div>• 🥁 <span style={{ color: '#CD7F32' }} className="font-bold">Scatter</span> does <span className="text-white font-bold">not</span> pay a win — it only triggers Free Games.</div>
              <div>• 🐃 <span style={{ color: '#8B5E3C' }} className="font-bold">Buffalo &amp; 💎 Diamond Buffalo</span> count across the whole grid (not on lines).</div>
            </div>
          </Section>

          {/* Symbols */}
          <Section title="🎰 LINE PAYS — multiplier × bet per line">
            <Row icon="🐉" label="Rồng (Dragon)" value="3=25× · 4=100× · 5=500×" color="#CC0000" />
            <Row icon="🦅" label="Phượng (Phoenix)" value="3=15× · 4=50× · 5=200×" color="#FF8C00" />
            <Row icon="🪷" label="Hoa Sen (Lotus)" value="3=10× · 4=35× · 5=100×" color="#FF69B4" />
            <Row icon="🏮" label="Đèn Lồng (Lantern)" value="3=8× · 4=25× · 5=75×" color="#FF4500" />
            <Row icon="🎋" label="Tre Xanh (Bamboo)" value="3=5× · 4=15× · 5=50×" color="#00C853" />
            <Row icon="🍜" label="Phở (Noodles)" value="3=3× · 4=10× · 5=30×" color="#FFA726" />
            <Row icon="🌾" label="Lúa (Rice)" value="3=2× · 4=8× · 5=20×" color="#CDDC39" />
            <Row icon="🐯" label="Hổ — WILD" value="3=20× · 4=75× · 5=300×" color="#FFD700" />
          </Section>

          {/* Special symbols */}
          <Section title="⭐ SPECIAL SYMBOLS">
            <div className="flex flex-col gap-1.5 text-[12px]">
              <div className="flex gap-2"><span>🥁</span><span><span style={{ color: '#CD7F32' }} className="font-bold">Trống Đồng — FREE GAMES trigger</span><br /><span className="text-gray-400">1 on each of the 3 middle reels (cols 2, 3, 4) = 6 Free Games. No line pay.</span></span></div>
              <div className="flex gap-2"><span>🐃</span><span><span style={{ color: '#8B5E3C' }} className="font-bold">Trâu — Buffalo Rush trigger</span><br /><span className="text-gray-400">6+ anywhere on the grid → BUFFALO RUSH hold &amp; collect.</span></span></div>
              <div className="flex gap-2"><span>💎</span><span><span style={{ color: '#00BFFF' }} className="font-bold">Trâu Kim Cương — also counts as Buffalo!</span><br /><span className="text-gray-400">Counts toward the 6 threshold AND can land in Buffalo Rush slots → triggers Tiến Lên (5 prize lines, boosted jackpot odds).</span></span></div>
            </div>
          </Section>

          {/* Buffalo Rush */}
          <Section title="🐃 BUFFALO RUSH">
            <div className="text-[12px] text-gray-300 flex flex-col gap-1">
              <div>• 5×3 grid of 15 slots. Start with 3 re-spins.</div>
              <div>• New buffalo landing = reset to 3 re-spins &amp; fill a prize slot.</div>
              <div>• <span className="text-yellow-400 font-bold">Multiplier:</span> N new buffaloes in one spin → all existing prizes × N.</div>
              <div>• 💎 Diamond Buffalo in a slot → <span style={{ color: '#00BFFF' }} className="font-bold">Tiến Lên</span> sub-feature (5 lines, higher MINI/MAJOR odds).</div>
              <div>• Fill all 15 slots → <span className="text-red-400 font-bold">GRAND JACKPOT!</span></div>
            </div>
          </Section>

          {/* Tiến Lên */}
          <Section title="💎 TIẾN LÊN (Diamond Feature)">
            <div className="text-[12px] text-gray-300 flex flex-col gap-1">
              <div>• Triggered when Diamond Buffalo lands in a Buffalo Rush slot.</div>
              <div>• Reveals 5 prize lines, one by one.</div>
              <div>• Boosted odds: MINI ~30%, MAJOR ~9.5%, MAXI ~2%.</div>
              <div>• All 5 prizes summed and added to that slot — then Rush continues.</div>
            </div>
          </Section>

          {/* Jackpots */}
          <Section title="🏆 JACKPOTS — Buffalo Rush only">
            <div className="text-[11px] text-gray-500 mb-1">All jackpots are awarded inside Buffalo Rush, not on main reels.</div>
            <div className="text-[12px] flex flex-col gap-1">
              <Row label="MINI BONUS" value="random slot in Rush" color="#00D187" />
              <Row label="MAJOR BONUS" value="random slot in Rush" color="#FFD700" />
              <Row label="MAXI BONUS" value="random slot in Rush" color="#FF8C00" />
              <Row label="MEGA BONUS" value="random slot in Rush" color="#FF4D6D" />
              <Row label="GRAND JACKPOT" value="Fill all 15 Rush slots" color="#FFD700" />
            </div>
          </Section>

          {/* Gamble */}
          <Section title="♠️ GAMBLE MODE">
            <div className="text-[12px] text-gray-300 flex flex-col gap-1">
              <div>• After any win, choose to gamble.</div>
              <div>• Red/Black correct → <span className="text-green-400 font-bold">2× win</span>. Wrong → lose all.</div>
              <div>• Suit correct → <span className="text-green-400 font-bold">4× win</span>. Wrong → lose all.</div>
              <div>• Maximum 5 consecutive gambles per win.</div>
            </div>
          </Section>

          <div className="text-center text-[10px] text-gray-600 mt-1">Up to 50 paylines · Left-to-right · Wilds substitute all</div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-[11px] font-black tracking-widest uppercase"
        style={{ color: 'rgba(255,215,0,0.7)', borderBottom: '1px solid rgba(255,215,0,0.15)', paddingBottom: 4 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Row({ icon, label, value, color }: { icon?: string; label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between text-[12px]">
      <span className="flex items-center gap-1.5">
        {icon && <span>{icon}</span>}
        <span style={{ color }}>{label}</span>
      </span>
      <span className="font-black" style={{ color }}>{value}</span>
    </div>
  );
}
