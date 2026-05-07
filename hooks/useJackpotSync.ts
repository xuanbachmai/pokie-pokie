'use client';
/**
 * useJackpotSync
 * Mount this once at the top of the app (SlotMachine component).
 * It:
 *   1. Fetches current Mega & Grand jackpot values from Supabase on load
 *   2. Subscribes to realtime changes (other players' bets / wins)
 *   3. Patches the local jackpotStore with server values
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
  const syncMega     = useJackpotStore(s => s.syncMegaJackpot);
  const syncGrand    = useJackpotStore(s => s.syncGrandJackpot);

  // Track previous values so we can send only the delta
  const prevMegaRef  = useRef<number | null>(null);
  const prevGrandRef = useRef<number | null>(null);

  // ── 1. Fetch initial values and subscribe ─────────────────────────
  useEffect(() => {
    let unsub: (() => void) | null = null;

    fetchJackpotValues().then(vals => {
      if (!vals) return;
      syncMega(vals.mega);
      syncGrand(vals.grand);
      prevMegaRef.current  = vals.mega;
      prevGrandRef.current = vals.grand;
    });

    unsub = subscribeToJackpots((id, value) => {
      if (id === 'mega')  syncMega(value);
      if (id === 'grand') syncGrand(value);
    });

    return () => { unsub?.(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 2. Subscribe to local store changes — push deltas to DB ──────
  useEffect(() => {
    const unsubStore = useJackpotStore.subscribe(state => {
      const megaLocal  = state.values[JackpotTier.GRAND];
      const grandLocal = state.grandJackpotValue;

      // Push mega delta
      if (prevMegaRef.current !== null && megaLocal > prevMegaRef.current) {
        const delta = parseFloat((megaLocal - prevMegaRef.current).toFixed(2));
        prevMegaRef.current = megaLocal;
        contributeToJackpotsDB(delta, 0);
      } else if (prevMegaRef.current !== null && megaLocal < prevMegaRef.current) {
        // Jackpot was won — reset in DB
        prevMegaRef.current = MEGA_SEED;
        winJackpotDB('mega', MEGA_SEED);
      }

      // Push grand delta
      if (prevGrandRef.current !== null && grandLocal > prevGrandRef.current) {
        const delta = parseFloat((grandLocal - prevGrandRef.current).toFixed(2));
        prevGrandRef.current = grandLocal;
        contributeToJackpotsDB(0, delta);
      } else if (prevGrandRef.current !== null && grandLocal < prevGrandRef.current) {
        // Grand jackpot was won — reset in DB
        prevGrandRef.current = GRAND_JACKPOT_SEED;
        winJackpotDB('grand', GRAND_JACKPOT_SEED);
      }
    });

    return unsubStore;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
