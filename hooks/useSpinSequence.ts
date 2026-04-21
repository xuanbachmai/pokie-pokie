'use client';
import { useCallback, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';

export function useSpinSequence() {
  const triggerSpin = useGameStore(s => s.triggerSpin);
  const completeSpin = useGameStore(s => s.completeSpin);
  const setSpinningReels = useRef<((reels: boolean[]) => void) | null>(null);

  const startSpin = useCallback(() => {
    triggerSpin();

    // Stagger reel stops: reel 0 stops first at 800ms, reel 4 last at 2200ms
    const delays = [800, 1100, 1400, 1700, 2200];
    const spinning = [true, true, true, true, true];

    delays.forEach((delay, i) => {
      setTimeout(() => {
        spinning[i] = false;
        useGameStore.setState({ spinningReels: [...spinning] });
        if (i === 4) {
          setTimeout(() => completeSpin(), 100);
        }
      }, delay);
    });
  }, [triggerSpin, completeSpin]);

  return { startSpin };
}
