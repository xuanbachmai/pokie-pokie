'use client';
/**
 * useGameAudio.ts
 * Wires game phase/events → GameAudio singleton.
 * AudioContext is created on first user interaction (browser autoplay rule).
 */
import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { getAudio } from '@/lib/audioEngine';
import { SymbolId } from '@/types/game';

export function useGameAudio() {
  const phase            = useGameStore(s => s.phase);
  const totalWinThisSpin = useGameStore(s => s.totalWinThisSpin);
  const activeBonusType  = useGameStore(s => s.activeBonusType);
  const lastWinAmount    = useGameStore(s => s.lastWinAmount);
  const visibleGrid      = useGameStore(s => s.visibleGrid);

  // Track previous values so we only fire on transitions
  const prevPhase     = useRef<string | null>(null);
  const prevWin       = useRef(0);
  const prevBonus     = useRef<string | null>(null);
  const prevHadDiamond = useRef(false);
  const initialised   = useRef(false);

  // ── Bootstrap AudioContext on first user gesture ───────────────────────
  useEffect(() => {
    function onGesture() {
      if (initialised.current) return;
      initialised.current = true;
      getAudio().init();
      // Remove listeners after first touch
      window.removeEventListener('pointerdown', onGesture);
      window.removeEventListener('keydown', onGesture);
    }
    window.addEventListener('pointerdown', onGesture, { passive: true });
    window.addEventListener('keydown', onGesture, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', onGesture);
      window.removeEventListener('keydown', onGesture);
    };
  }, []);

  // ── Phase transitions ──────────────────────────────────────────────────
  useEffect(() => {
    const audio = getAudio();
    if (!audio.ready) return;

    const prev = prevPhase.current;
    prevPhase.current = phase;

    // SPINNING start → begin loop (covers both normal and free spins)
    if (phase === 'SPINNING' && prev !== 'SPINNING') {
      audio.startSpinLoop();
      return;
    }

    // SPINNING end → stop loop
    if (prev === 'SPINNING' && phase !== 'SPINNING') {
      audio.stopSpinLoop();
    }

    // BONUS_TRIGGER (Trống Đồng scatter → Free Games fanfare)
    if (phase === 'BONUS_TRIGGER' && prev !== 'BONUS_TRIGGER') {
      audio.stopSpinLoop();
      audio.playFreeSpin();
      return;
    }

    // BONUS_ACTIVE → Buffalo Rush fanfare (once, on entry)
    if (phase === 'BONUS_ACTIVE' && prev !== 'BONUS_ACTIVE') {
      audio.playBuffaloRush();
      return;
    }
  }, [phase]);

  // ── Win detection ──────────────────────────────────────────────────────
  useEffect(() => {
    const audio = getAudio();
    if (!audio.ready) return;

    // Fire on any non-zero win that just changed
    if (totalWinThisSpin > 0 && totalWinThisSpin !== prevWin.current) {
      prevWin.current = totalWinThisSpin;
      // Don't fire during SPINNING — only on evaluation result
      if (phase !== 'SPINNING') {
        audio.playWin(totalWinThisSpin);
      }
    }
    if (totalWinThisSpin === 0) prevWin.current = 0;
  }, [totalWinThisSpin, phase]);

  // ── Jackpot fanfare ────────────────────────────────────────────────────
  // lastWinAmount spikes very high when jackpot is won inside Buffalo Rush
  useEffect(() => {
    const audio = getAudio();
    if (!audio.ready) return;
    if (lastWinAmount > 500) {
      audio.playJackpot();
    }
  }, [lastWinAmount]);

  // ── Diamond Buffalo appearance ─────────────────────────────────────────
  // Fire once when grid settles (EVALUATING/WIN_DISPLAY/IDLE) and contains SPECIAL
  useEffect(() => {
    const audio = getAudio();
    if (!audio.ready) return;
    if (phase === 'SPINNING') { prevHadDiamond.current = false; return; }

    const hasDiamond = visibleGrid.some(col =>
      col.some(sym => sym === SymbolId.SPECIAL)
    );

    if (hasDiamond && !prevHadDiamond.current) {
      // Slight delay so it plays after the reel-stop sound settles
      setTimeout(() => audio.playDiamondBuffalo(), 300);
    }
    prevHadDiamond.current = hasDiamond;
  }, [phase, visibleGrid]);
}

// ── Gamble-specific hook (used inside GambleModal) ─────────────────────────
export function useGambleAudio() {
  const audio = getAudio();

  function onFlip() {
    if (audio.ready) audio.playGambleFlip();
  }
  function onWin() {
    if (audio.ready) audio.playGambleWin();
  }
  function onLose() {
    if (audio.ready) audio.playGambleLose();
  }

  return { onFlip, onWin, onLose };
}
