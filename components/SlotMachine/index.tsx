'use client';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { JackpotPanel } from '@/components/Jackpot/JackpotPanel';
import { ReelGrid } from '@/components/Reels/ReelGrid';
import { ControlPanel } from './ControlPanel';
import { WinDisplay } from './WinDisplay';
import { BonusModal } from '@/components/BonusGame/BonusModal';
import { GambleModal } from '@/components/GambleMode/GambleModal';
import { useAutoSpin } from '@/hooks/useAutoSpin';
import { useGameStore } from '@/store/gameStore';

const SceneCanvas = dynamic(
  () => import('@/components/Effects/SceneCanvas').then(m => m.SceneCanvas),
  { ssr: false }
);

function AutoSpinRunner() {
  useAutoSpin();
  return null;
}

function FreeSpinAutoRunner() {
  const phase = useGameStore(s => s.phase);
  const isFreeSpinActive = useGameStore(s => s.isFreeSpinActive);
  const freeSpinsRemaining = useGameStore(s => s.freeSpinsRemaining);
  const triggerSpin = useGameStore(s => s.triggerSpin);
  const completeSpin = useGameStore(s => s.completeSpin);

  useEffect(() => {
    if (phase === 'FREE_SPINS' && isFreeSpinActive && freeSpinsRemaining > 0) {
      const t = setTimeout(() => {
        triggerSpin();
        const delays = [800, 1100, 1400, 1700, 2200];
        const spinning = [true, true, true, true, true];
        delays.forEach((delay, i) => {
          setTimeout(() => {
            spinning[i] = false;
            useGameStore.setState({ spinningReels: [...spinning] });
            if (i === 4) setTimeout(() => completeSpin(), 100);
          }, delay);
        });
      }, 600);
      return () => clearTimeout(t);
    }
  }, [phase, isFreeSpinActive, freeSpinsRemaining, triggerSpin, completeSpin]);

  return null;
}

export function SlotMachine() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0D0005 0%, #0a0014 40%, #0D0005 100%)' }}
    >
      <SceneCanvas />
      <AutoSpinRunner />
      <FreeSpinAutoRunner />

      {/* Main game card */}
      <div
        className="relative z-10 w-full max-w-md mx-auto px-3 py-4 flex flex-col gap-3"
        style={{ minHeight: '100dvh', justifyContent: 'center' }}
      >
        {/* Title */}
        <div className="text-center">
          <h1 className="text-2xl font-black tracking-widest"
            style={{ background: 'linear-gradient(90deg, #FFD700, #FF4D6D, #FFD700)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundSize: '200%' }}>
            🐉 DRAGON FORTUNE 🐉
          </h1>
          <p className="text-[10px] text-gray-500 tracking-widest uppercase mt-0.5">Asian Treasures</p>
        </div>

        {/* Jackpot panel */}
        <JackpotPanel />

        {/* Reel grid */}
        <div className="relative">
          <ReelGrid />
          <WinDisplay />
        </div>

        {/* Paytable quick reference */}
        <PaytableHint />

        {/* Control panel */}
        <div
          className="rounded-2xl p-4"
          style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,215,0,0.15)' }}
        >
          <ControlPanel />
        </div>
      </div>

      <BonusModal />
      <GambleModal />
    </div>
  );
}

function PaytableHint() {
  return (
    <div className="flex gap-1 text-[9px] text-gray-600 justify-center flex-wrap px-2">
      <span className="text-red-900">🐉 500x</span>
      <span>·</span>
      <span className="text-orange-900">🐯 200x</span>
      <span>·</span>
      <span>🐼 100x</span>
      <span>·</span>
      <span>🔥 WILD</span>
      <span>·</span>
      <span>☯️ BONUS</span>
    </div>
  );
}
