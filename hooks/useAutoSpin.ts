'use client';
import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useSpinSequence } from './useSpinSequence';

export function useAutoSpin() {
  const autoSpinActive = useGameStore(s => s.autoSpinActive);
  const phase = useGameStore(s => s.phase);
  const decrementAutoSpin = useGameStore(s => s.decrementAutoSpin);
  const { startSpin } = useSpinSequence();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (autoSpinActive && phase === 'IDLE') {
      timerRef.current = setTimeout(() => {
        decrementAutoSpin();
        startSpin();
      }, 400);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [autoSpinActive, phase, startSpin, decrementAutoSpin]);
}
