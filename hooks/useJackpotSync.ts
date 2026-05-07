'use client';
/**
 * useJackpotSync  —  READ-ONLY sync from Supabase to local store.
 *
 * This hook NEVER writes to the database. DB writes happen in two places only:
 *   1. gameStore.ts  — contributeToJackpotsDB() once per spin (exact amount)
 *   2. NuggetHoldFeature.tsx — winJackpotDB() when a jackpot is won
 *
 * This eliminates any possibility of a feedback loop.
 */
import { useEffect } from 'react';
import { useJackpotStore } from '@/store/jackpotStore';
import { fetchJackpotValues, subscribeToJackpots } from '@/lib/jackpotSync';

export function useJackpotSync() {
  const syncMega  = useJackpotStore(s => s.syncMegaJackpot);
  const syncGrand = useJackpotStore(s => s.syncGrandJackpot);

  // ── 1. Fetch initial values on mount ─────────────────────────────
  useEffect(() => {
    fetchJackpotValues().then(vals => {
      if (!vals) return;
      syncMega(vals.mega);
      syncGrand(vals.grand);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 2. Realtime — push DB changes to local store (display only) ──
  useEffect(() => {
    const unsub = subscribeToJackpots((id, value) => {
      if (id === 'mega')  syncMega(value);
      if (id === 'grand') syncGrand(value);
    });
    return unsub;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
