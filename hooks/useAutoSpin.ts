'use client';
import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useSpinSequence } from './useSpinSequence';

export function useAutoSpin() {
  const autoSpinActive = useGameStore(s => s.autoSpinActive);
  const phase = useGameStore(s => s.phase);
  const { startSpin } = useSpinSequence();

  useEffect(() => {
    if (!autoSpinActive || phase !== 'IDLE') return;

    const t = setTimeout(() => {
      useGameStore.getState().decrementAutoSpin();
      startSpin();
    }, 400);

    return () => clearTimeout(t);
  }, [autoSpinActive, phase, startSpin]);
}
