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
import { useJackpotSync } from '@/hooks/useJackpotSync';
import { useAnalytics } from '@/hooks/useAnalytics';
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
  const phase      = useGameStore(s => s.phase);
  const balance    = useGameStore(s => s.balance);
  const betPerLine = useGameStore(s => s.betPerLine);
  const activeLines = useGameStore(s => s.activeLines);
  const isFreeSpinActive = useGameStore(s => s.isFreeSpinActive);
  const { startSpin } = useSpinSequence();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.code !== 'Space') return;
      e.preventDefault();

      const canSpin = phase === 'IDLE' || phase === 'FREE_SPINS';
      if (!canSpin) return; // not in a spinnable phase — do nothing (no sound, no music stop)

      const totalBet = parseFloat((betPerLine * activeLines).toFixed(2));
      if (!isFreeSpinActive && balance < totalBet) {
        // Out of credit — play error sound, don't spin
        const audio = getAudio();
        if (audio.ready) audio.playInsufficientFunds();
        return;
      }

      startSpin();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, balance, betPerLine, activeLines, isFreeSpinActive, startSpin]);

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
  // ── Supabase: sync shared jackpots + analytics ───────────────────────────
  useJackpotSync();
  useAnalytics();

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
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-x-hidden overflow-y-auto">
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
                  style={{ background: 'linear-gradient(90deg, #00C07A, #FFD700, #00C07A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundSize: '200%' }}>
                  🌾 VIETNAM MAZE 🌾
                </h1>
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
              style={{ background: 'rgba(0,16,7,0.72)', border: '1px solid rgba(0,192,122,0.18)' }}
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
        style={{ background: 'linear-gradient(160deg, #011008, #020e20)', border: '1px solid rgba(0,192,122,0.35)' }}
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3"
          style={{ background: 'linear-gradient(90deg, rgba(0,160,80,0.35), rgba(255,215,0,0.15), rgba(0,160,80,0.35))' }}>
          <span className="text-base font-black" style={{ color: '#00C07A' }}>📖 GAME RULES</span>
          <button onClick={onClose} className="text-gray-400 text-xl leading-none hover:text-white">×</button>
        </div>

        <div className="px-5 py-4 flex flex-col gap-4 max-h-[75vh] overflow-y-auto text-sm">

          {/* Bet structure */}
          <Section title="💰 BET STRUCTURE">
            <div className="text-[12px] text-gray-300 flex flex-col gap-1">
              <div>• Choose a <span className="text-yellow-400 font-bold">Denomination</span> (1¢ – $2), then set your <span className="text-yellow-400 font-bold">Multiple</span> and number of active <span className="text-yellow-400 font-bold">Lines</span>.</div>
              <div>• <span className="text-white font-bold">Total Bet</span> = Denomination × Multiple × Lines</div>
              <div>• Up to <span className="text-yellow-400 font-bold">50 paylines</span> available depending on denomination.</div>
              <div>• All pays shown below are <span className="text-emerald-400 font-bold">multiplied by Bet Per Line</span>.</div>
            </div>
          </Section>

          {/* How wins work */}
          <Section title="📏 HOW WINS WORK">
            <div className="text-[12px] text-gray-300 flex flex-col gap-1">
              <div>• Wins pay <span className="text-yellow-400 font-bold">left-to-right</span> — 3, 4 or 5 matching symbols starting from reel 1.</div>
              <div>• Only <span className="text-yellow-400 font-bold">active paylines</span> can win. Inactive lines are not evaluated.</div>
              <div>• 🐯 <span className="text-yellow-400 font-bold">Wild (Hổ)</span> substitutes for any regular symbol. Boosts wins when mixed with other symbols.</div>
              <div>• 🥁 <span style={{ color: '#CD7F32' }} className="font-bold">Scatter (Trống Đồng)</span>, 🐃 <span style={{ color: '#8B5E3C' }} className="font-bold">Buffalo</span>, and 💎 <span style={{ color: '#00BFFF' }} className="font-bold">Diamond Buffalo</span> do <span className="text-red-400">not</span> pay on lines — they trigger features only.</div>
              <div>• Highest win per payline only (no stacking on same line).</div>
            </div>
          </Section>

          {/* Line pays */}
          <Section title="🎰 LINE PAYS (× Bet Per Line)">
            <div className="flex flex-col gap-0.5">
              <Row icon="🐕" label="Cậu Vàng" value="3=25×  4=100×  5=500×" color="#FFA000" />
              <Row icon="🦅" label="Phượng" value="3=15×  4=50×  5=200×" color="#FF8C00" />
              <Row icon="🪷" label="Hoa Sen" value="3=10×  4=35×  5=100×" color="#FF85A1" />
              <Row icon="🏮" label="Đèn Lồng" value="3=8×  4=25×  5=75×" color="#FF6B00" />
              <Row icon="🎋" label="Tre Xanh" value="3=5×  4=15×  5=50×" color="#4CAF50" />
              <Row icon="🍜" label="Phở" value="3=3×  4=10×  5=30×" color="#FFD700" />
              <Row icon="🌾" label="Lúa" value="3=2×  4=8×  5=20×" color="#8BC34A" />
              <Row icon="🐯" label="Hổ  WILD" value="3=10×  4=35×  5=120×" color="#FFD700" />
            </div>
          </Section>

          {/* Special symbols */}
          <Section title="⭐ SPECIAL SYMBOLS">
            <div className="flex flex-col gap-2 text-[12px]">
              <div className="flex gap-2">
                <span className="text-lg">🥁</span>
                <span>
                  <span style={{ color: '#CD7F32' }} className="font-bold">Trống Đồng — SCATTER</span><br />
                  <span className="text-gray-400">Appears on <span className="text-white">reels 2, 3 & 4 only</span>. Land on all 3 middle reels in one spin → triggers <span className="text-yellow-300 font-bold">Free Games</span>. No line pay.</span>
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-lg">🐃</span>
                <span>
                  <span style={{ color: '#8B5E3C' }} className="font-bold">Trâu — BUFFALO</span><br />
                  <span className="text-gray-400">Can appear anywhere (up to 3 per column). <span className="text-yellow-300 font-bold">6 or more</span> anywhere on the grid triggers <span className="text-yellow-300 font-bold">BUFFALO RUSH</span>. Does not pay on lines.</span>
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-lg">💎</span>
                <span>
                  <span style={{ color: '#00BFFF' }} className="font-bold">Trâu Kim Cương — DIAMOND BUFFALO</span><br />
                  <span className="text-gray-400">Maximum <span className="text-white">1 per spin</span>. Counts toward the 6-buffalo trigger. Very rare — triggers the <span className="text-cyan-400 font-bold">Tiến Lên Feature</span> with 5 extra prize lines inside Buffalo Rush.</span>
                </span>
              </div>
            </div>
          </Section>

          {/* Free Games */}
          <Section title="🥁 FREE GAMES">
            <div className="text-[12px] text-gray-300 flex flex-col gap-1">
              <div>• Triggered when <span className="text-yellow-300 font-bold">🥁 Scatter appears on all 3 middle reels</span> (reels 2, 3 & 4) simultaneously.</div>
              <div>• Awards <span className="text-yellow-300 font-bold">6 Free Games</span> — bet is not deducted during free spins.</div>
              <div>• All wins during Free Games are multiplied by <span className="text-emerald-400 font-bold">2×</span>.</div>
              <div>• Buffalo Rush can still trigger inside Free Games.</div>
              <div>• Free Games counter shown at the <span className="text-white">bottom of the reels</span> during the feature.</div>
            </div>
          </Section>

          {/* Buffalo Rush */}
          <Section title="🐃 BUFFALO RUSH">
            <div className="text-[12px] text-gray-300 flex flex-col gap-1">
              <div>• Triggered when <span className="text-yellow-400 font-bold">6 or more</span> Buffalo (🐃 or 💎) land anywhere on the grid in one spin.</div>
              <div>• Enters a <span className="text-yellow-300 font-bold">hold & re-spin</span> mode — <span className="text-white font-bold">8–12 buffalo slots</span> are pre-seeded with prizes on entry.</div>
              <div>• You get <span className="text-white font-bold">3 re-spins</span>. Each new Buffalo that lands <span className="text-yellow-400">resets the counter to 3</span> and locks in a prize.</div>
              <div>• Each locked slot awards a random prize: <span className="text-yellow-300 font-bold">1–20× bet in credits</span>, MINI, MAJOR, MINOR or MEGA jackpot.</div>
              <div>• <span className="text-emerald-400 font-bold">Fill all 15 slots</span> → <span className="text-red-400 font-bold">🏆 GRAND JACKPOT</span> awarded on top of all prizes!</div>
              <div>• 💎 Diamond Buffalo (rare) unlocks the <span className="text-cyan-400 font-bold">Tiến Lên Feature</span> with 5 extra prize lines.</div>
            </div>
          </Section>

          {/* Tiến Lên Feature */}
          <Section title="💎 TIẾN LÊN FEATURE">
            <div className="text-[12px] text-gray-300 flex flex-col gap-1">
              <div>• Triggered by landing a <span className="text-cyan-400 font-bold">Diamond Buffalo 💎</span> during Buffalo Rush (rare drop).</div>
              <div>• Reveals <span className="text-white font-bold">5 prize columns</span> with their own jackpot prize table.</div>
              <div>• Each column can award credits or a jackpot tier — collected on top of your Buffalo Rush total.</div>
            </div>
          </Section>

          {/* Jackpots */}
          <Section title="🏆 JACKPOTS">
            <div className="text-[11px] text-gray-400 mb-1.5">All jackpots appear as Buffalo Rush / Tiến Lên prizes. Values scale with denomination.</div>
            <div className="text-[12px] flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span style={{ color: '#00D187' }} className="font-black">MINI</span>
                <span className="text-gray-400 text-[11px]">Fixed amount · resets after each hit</span>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ color: '#FFD700' }} className="font-black">MAJOR</span>
                <span className="text-gray-400 text-[11px]">Progressive · grows with every bet</span>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ color: '#FF8C00' }} className="font-black">MINOR</span>
                <span className="text-gray-400 text-[11px]">Progressive · grows with every bet</span>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ color: '#FF4D6D' }} className="font-black">MEGA</span>
                <span className="text-gray-400 text-[11px]">Large progressive · grows each bet</span>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ color: '#FF4D6D' }} className="font-black">🏆 GRAND</span>
                <span className="text-gray-400 text-[11px]">Fill all 15 Buffalo Rush slots · massive progressive jackpot</span>
              </div>
            </div>
          </Section>

          {/* Gamble */}
          <Section title="♠️ GAMBLE FEATURE">
            <div className="text-[12px] text-gray-300 flex flex-col gap-1">
              <div>• Appears after <span className="text-yellow-400 font-bold">any win</span>. Choose <span className="text-purple-400 font-bold">GAMBLE</span> to risk it, or <span className="text-green-400 font-bold">TAKE WIN</span> to keep it.</div>
              <div>• <span className="text-white">Red / Black</span> guess → correct = <span className="text-green-400 font-bold">2× your win</span>, wrong = <span className="text-red-400">lose all</span>.</div>
              <div>• <span className="text-white">Exact suit</span> (♠ ♥ ♦ ♣) → correct = <span className="text-green-400 font-bold">4× your win</span>, wrong = <span className="text-red-400">lose all</span>.</div>
              <div>• Maximum <span className="text-white font-bold">5 gambles in a row</span> per win — then auto-collected.</div>
            </div>
          </Section>

          <div className="rounded-xl px-4 py-2.5 text-[11px] text-gray-400 leading-5"
            style={{ background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.12)' }}>
            <span className="text-yellow-400 font-bold">TIP:</span> Press <span className="text-white font-bold">SPACEBAR</span> to spin. Scatter only appears on reels 2–4. Buffalo Rush starts with 8–12 pre-seeded prizes — fill all 15 for the 🏆 Grand Jackpot ($30,000+). Target RTP: <span className="text-emerald-400 font-bold">70–80%</span>.
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-[11px] font-black tracking-widest uppercase"
        style={{ color: 'rgba(0,192,122,0.8)', borderBottom: '1px solid rgba(0,192,122,0.15)', paddingBottom: 4 }}>
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
      <span className="font-black tabular-nums" style={{ color }}>{value}</span>
    </div>
  );
}
