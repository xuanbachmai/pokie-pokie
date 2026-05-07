'use client';
import { useGameStore } from '@/store/gameStore';
import { SymbolId } from '@/types/game';
import { getAudio } from '@/lib/audioEngine';

// Base stop times (ms from spin start) for each reel
const BASE_DELAYS = [800, 1100, 1400, 1700, 2200];
const ANTICIPATION_EXTRA = 2000; // extra ms added when anticipation fires

// Solfège note labels (for buffalo note display)
const SOLFEGE = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'];

function colHasScatter(grid: SymbolId[][], col: number) {
  return grid[col].some(s => s === SymbolId.SCATTER);
}
function colBuffaloCount(grid: SymbolId[][], col: number) {
  return grid[col].filter(s => s === SymbolId.NUGGET || s === SymbolId.SPECIAL).length;
}

export function useSpinSequence() {
  function startSpin() {
    const store = useGameStore.getState();
    if (store.phase !== 'IDLE' && store.phase !== 'FREE_SPINS') return;

    store.triggerSpin();
    if (useGameStore.getState().phase !== 'SPINNING') return;

    const grid = useGameStore.getState().pendingGrid;
    if (!grid) return;

    // ── Determine anticipation BEFORE any reel stops ──────────────────────
    // Scatter anticipation: reels 2 & 3 (col 1, 2) both have scatter
    //   AND reel 4 (col 3) also has scatter (so the full trigger will land)
    const scatterAntic =
      colHasScatter(grid, 1) &&
      colHasScatter(grid, 2) &&
      colHasScatter(grid, 3);

    // Buffalo anticipation: cols 0-3 together have 5+ buffalo
    //   AND col 4 has at least 1 buffalo (so it builds toward rush)
    const buffaloOnFirst4 = [0, 1, 2, 3].reduce(
      (sum, c) => sum + colBuffaloCount(grid, c), 0
    );
    const buffaloAntic =
      buffaloOnFirst4 >= 5 &&
      colBuffaloCount(grid, 4) >= 1;

    // Build dynamic stop-delay array
    const delays = [...BASE_DELAYS];
    if (scatterAntic) {
      delays[3] += ANTICIPATION_EXTRA;
      delays[4] += ANTICIPATION_EXTRA; // reel 5 also pushed out after reel 4
    }
    if (buffaloAntic) {
      delays[4] += ANTICIPATION_EXTRA;
    }

    // Commit to store so ReelGrid can pass correct stopDelay to each SpinningReel
    const anticipationCols: number[] = [];
    if (scatterAntic)  anticipationCols.push(3);
    if (buffaloAntic)  anticipationCols.push(4);
    useGameStore.getState().setAnticipation(anticipationCols, delays);

    // ── Schedule anticipation sounds ──────────────────────────────────────
    if (scatterAntic) {
      // Play right when reel 3 (col 2) stops — that's BASE_DELAYS[2]
      setTimeout(() => {
        const audio = getAudio();
        if (audio.ready) audio.playScatterAnticipation();
      }, BASE_DELAYS[2]);
    }
    if (buffaloAntic) {
      // Play right when reel 4 (col 3) stops — that's delays[3]
      setTimeout(() => {
        const audio = getAudio();
        if (audio.ready) audio.playBuffaloAnticipation();
      }, delays[3]);
    }

    // ── Schedule reel stops ───────────────────────────────────────────────
    const spinning = [true, true, true, true, true];
    let noteStep = 0;
    let noteKey  = 0;

    delays.forEach((delay, i) => {
      setTimeout(() => {
        spinning[i] = false;
        useGameStore.setState({ spinningReels: [...spinning] });

        // Clear anticipation for this col once it stops
        const remaining = useGameStore.getState().anticipationCols.filter(c => c !== i);
        useGameStore.setState({ anticipationCols: remaining });

        // ── Buffalo / Diamond Buffalo sound ──────────────────────────────
        const hasSpecial = grid[i].some(s => s === SymbolId.SPECIAL);
        const hasNugget  = grid[i].some(s => s === SymbolId.NUGGET);

        if (hasSpecial || hasNugget) {
          const label = SOLFEGE[Math.min(noteStep, SOLFEGE.length - 1)];
          const audio = getAudio();
          if (hasSpecial) {
            // Diamond Buffalo — ka-boom surprise drop sound only
            if (audio.ready) audio.playDiamondBuffalo();
          } else {
            if (audio.ready) audio.playBuffaloNote(noteStep);
          }
          useGameStore.setState({
            buffaloNoteDisplay: { col: i, label, key: noteKey++ },
          });
          setTimeout(() => useGameStore.setState({ buffaloNoteDisplay: null }), 900);
          noteStep++;
        }
        // ─────────────────────────────────────────────────────────────────

        if (i === delays.length - 1) {
          setTimeout(() => useGameStore.getState().completeSpin(), 100);
        }
      }, delay);
    });
  }

  return { startSpin };
}
