'use client';
import { useGameStore } from '@/store/gameStore';
import { SymbolId } from '@/types/game';
import { getAudio } from '@/lib/audioEngine';

const STOP_DELAYS = [800, 1100, 1400, 1700, 2200];

// Do Re Mi Fa Sol La Si labels
const SOLFEGE = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'];

export function useSpinSequence() {
  function startSpin() {
    const store = useGameStore.getState();

    if (store.phase !== 'IDLE' && store.phase !== 'FREE_SPINS') return;

    store.triggerSpin();

    if (useGameStore.getState().phase !== 'SPINNING') return;

    const spinning = [true, true, true, true, true];
    let noteStep   = 0;   // counts how many buffalo notes have played this spin
    let noteKey    = 0;   // unique key for each visual bubble

    STOP_DELAYS.forEach((delay, i) => {
      setTimeout(() => {
        spinning[i] = false;
        useGameStore.setState({ spinningReels: [...spinning] });

        // ── Check this reel for buffalo symbols ──────────────────────────
        const grid = useGameStore.getState().pendingGrid;
        if (grid) {
          const colHasBuffalo = grid[i].some(
            sym => sym === SymbolId.NUGGET || sym === SymbolId.SPECIAL
          );

          if (colHasBuffalo) {
            const label = SOLFEGE[Math.min(noteStep, SOLFEGE.length - 1)];

            // Play the marimba note
            const audio = getAudio();
            if (audio.ready) audio.playBuffaloNote(noteStep);

            // Show floating visual label on this reel column
            useGameStore.setState({
              buffaloNoteDisplay: { col: i, label, key: noteKey++ },
            });

            // Auto-clear after 900 ms
            setTimeout(() => {
              useGameStore.setState({ buffaloNoteDisplay: null });
            }, 900);

            noteStep++;
          }
        }
        // ─────────────────────────────────────────────────────────────────

        if (i === STOP_DELAYS.length - 1) {
          setTimeout(() => useGameStore.getState().completeSpin(), 100);
        }
      }, delay);
    });
  }

  return { startSpin };
}
