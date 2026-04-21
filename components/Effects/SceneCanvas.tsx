'use client';
import { Canvas } from '@react-three/fiber';
import { FloatingCoins } from './FloatingCoins';
import { ReelParticles } from './ReelParticles';
import { FireworksEffect } from './FireworksEffect';
import { DragonFire } from './DragonFire';
import { useGameStore } from '@/store/gameStore';
import { useJackpotStore } from '@/store/jackpotStore';

export function SceneCanvas() {
  const phase = useGameStore(s => s.phase);
  const totalWin = useGameStore(s => s.totalWinThisSpin);
  const betPerLine = useGameStore(s => s.betPerLine);
  const activeLines = useGameStore(s => s.activeLines);
  const lastWonTier = useJackpotStore(s => s.lastWonTier);

  const totalBet = betPerLine * activeLines;
  const isBigWin = totalWin >= totalBet * 50;

  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 60 }}
      gl={{ alpha: true, antialias: false }}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <FloatingCoins />
      {phase === 'SPINNING' && <ReelParticles />}
      {lastWonTier && <FireworksEffect />}
      {isBigWin && phase === 'WIN_DISPLAY' && <DragonFire />}
    </Canvas>
  );
}
