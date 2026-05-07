'use client';
/**
 * useJackpotSync
 * Syncs Mega & Grand jackpots between local Zustand store and Supabase.
 *
 * Loop prevention:
 *   Local bet → delta sent to DB → Realtime fires back → prevRef updated FIRST
 *   so the store subscriber sees zero delta and does NOT send again.
 */
import { useEffect, useRef } from 'react';
import { useJackpotStore, GRAND_JACKPOT_SEED } from '@/store/jackpotStore';
import {
  fetchJackpotValues,
  subscribeToJackpots,
  contributeToJackpotsDB,
  winJackpotDB,
} from '@/lib/jackpotSync';
import { JACKPOT_CONFIGS } from '@/lib/constants';
import { JackpotTier } from '@/types/game';

const MEGA_SEED = JACKPOT_CONFIGS[JackpotTier.GRAND].seedAmount; // 5000

export function useJackpotSync() {
  const syncMega  = useJackpotStore(s => s.syncMegaJackpot);
  const syncGrand = useJackpotStore(s => s.syncGrandJackpot);

  // Tracks the last value WE sent / received — used to compute deltas
  const prevMegaRef  = useRef<number | null>(null);
  const prevGrandRef = useRef<number | null>(null);

  // ── 1. Fetch initial values on mount ─────────────────────────────
  useEffect(() => {
    fetchJackpotValues().then(vals => {
      if (!vals) return;
      // Set prevRefs BEFORE syncing the store so the store subscriber
      // sees prevRef === local value and sends no spurious delta
      prevMegaRef.current  = vals.mega;
      prevGrandRef.current = vals.grand;
      syncMega(vals.mega);
      syncGrand(vals.grand);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 2. Realtime subscription — other players' changes ────────────
  useEffect(() => {
    const unsub = subscribeToJackpots((id, value) => {
      // KEY: update prevRef BEFORE syncing local store.
      // This means when the store subscriber fires below, it sees
      // megaLocal === prevMegaRef (no delta) and won't write back to DB.
      if (id === 'mega') {
        prevMegaRef.current = value;
        syncMega(value);
      }
      if (id === 'grand') {
        prevGrandRef.current = value;
        syncGrand(value);
      }
    });
    return unsub;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 3. Watch local store — push only real bet-driven deltas to DB ─
  useEffect(() => {
    const unsubStore = useJackpotStore.subscribe(state => {
      const megaLocal  = state.values[JackpotTier.GRAND];
      const grandLocal = state.grandJackpotValue;

      // ── Mega ──────────────────────────────────────────────────────
      if (prevMegaRef.current !== null) {
        if (megaLocal > prevMegaRef.current) {
          // Real increase from a player bet — send the delta
          const delta = parseFloat((megaLocal - prevMegaRef.current).toFixed(2));
          prevMegaRef.current = megaLocal;
          contributeToJackpotsDB(delta, 0);
        } else if (megaLocal < prevMegaRef.current) {
          // Jackpot won — reset to seed in DB
          prevMegaRef.current = MEGA_SEED;
          winJackpotDB('mega', MEGA_SEED);
        }
        // Equal → came from realtime sync (prevRef already updated), do nothing
      }

      // ── Grand ─────────────────────────────────────────────────────
      if (prevGrandRef.current !== null) {
        if (grandLocal > prevGrandRef.current) {
          const delta = parseFloat((grandLocal - prevGrandRef.current).toFixed(2));
          prevGrandRef.current = grandLocal;
          contributeToJackpotsDB(0, delta);
        } else if (grandLocal < prevGrandRef.current) {
          prevGrandRef.current = GRAND_JACKPOT_SEED;
          winJackpotDB('grand', GRAND_JACKPOT_SEED);
        }
      }
    });

    return unsubStore;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
