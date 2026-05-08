'use client';
/**
 * useAnalytics
 * Mount once in SlotMachine. Watches Zustand stores and fires analytics events
 * automatically — no changes needed in the core game logic.
 */
import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import {
  getOrCreateSessionId,
  trackBet,
  trackWin,
  trackFeature,
  trackJackpotWin,
  startSessionHeartbeat,
} from '@/lib/analytics';

export function useAnalytics() {
  // Ensure session exists and keep last_seen_at fresh for live count
  useEffect(() => {
    getOrCreateSessionId();
    return startSessionHeartbeat();
  }, []);

  // Track refs to detect changes
  const prevPhaseRef         = useRef<string>('');
  const prevWinRef           = useRef<number>(0);
  const prevBonusTypeRef     = useRef<string | null>(null);
  const prevDiamondRushRef   = useRef<boolean>(false);

  useEffect(() => {
    const unsub = useGameStore.subscribe(state => {
      const {
        phase, lastWinAmount, activeBonusType,
        betPerLine, activeLines, denomination,
        gambleAmount,
      } = state;

      const totalBet = betPerLine * activeLines;

      // ── Bet: new spin started ────────────────────────────────────────
      if (phase === 'SPINNING' && prevPhaseRef.current !== 'SPINNING') {
        trackBet(totalBet, denomination, activeLines);
      }

      // ── Win: lastWinAmount just became non-zero ──────────────────────
      if (lastWinAmount > 0 && prevWinRef.current === 0) {
        trackWin(
          lastWinAmount,
          phase === 'FREE_SPINS' ? 'free_spin' : 'payline',
        );
      }

      // ── Bonus feature triggered ──────────────────────────────────────
      if (activeBonusType !== prevBonusTypeRef.current) {
        if (activeBonusType === 'NUGGET_HOLD') trackFeature('buffalo_rush');
        if (activeBonusType === 'FREE_SPINS')  trackFeature('free_spins');
      }

      prevPhaseRef.current     = phase;
      prevWinRef.current       = lastWinAmount;
      prevBonusTypeRef.current = activeBonusType;
    });

    return unsub;
  }, []);

}
