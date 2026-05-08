/**
 * analytics.ts — fire-and-forget event tracking to Supabase.
 * All functions are safe to call on the client only (no SSR).
 */
import { supabase } from './supabase';

const SESSION_KEY = 'vm_session_id';

// ── Session ───────────────────────────────────────────────────────────────────
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
    // Register in DB — ignored if already exists
    supabase.from('sessions').insert({ id }).then();
  }
  return id;
}

// ── Heartbeat — keeps last_seen_at fresh so "live" count stays accurate ───────
export function startSessionHeartbeat(): () => void {
  const ping = () => {
    const id = getOrCreateSessionId();
    if (!id) return;
    supabase.from('sessions').update({ last_seen_at: new Date().toISOString() }).eq('id', id).then();
  };
  ping(); // immediate first ping
  const interval = setInterval(ping, 2 * 60 * 1000); // every 2 minutes
  return () => clearInterval(interval);
}

// ── Generic event ─────────────────────────────────────────────────────────────
function track(type: string, amount: number, meta?: Record<string, unknown>): void {
  const sessionId = getOrCreateSessionId();
  if (!sessionId) return;
  supabase.from('events').insert({
    session_id: sessionId,
    type,
    amount,
    meta: meta ?? null,
  }).then();   // fire-and-forget — never blocks the game
}

// ── Typed helpers ─────────────────────────────────────────────────────────────

/** Player topped up credits */
export function trackDeposit(amount: number): void {
  track('deposit', amount);
}

/** Spin placed — called once per spin */
export function trackBet(totalBet: number, denom: number, lines: number): void {
  track('bet', totalBet, { denom, lines });
}

/** Any payout credited to the player */
export function trackWin(amount: number, source: 'payline' | 'bonus' | 'free_spin' | 'gamble'): void {
  if (amount <= 0) return;
  track('win', amount, { source });
}

/** Jackpot specifically won (also fires alongside trackWin) */
export function trackJackpotWin(tier: 'mega' | 'grand' | 'mini' | 'minor' | 'major', amount: number): void {
  track('jackpot_win', amount, { tier });
}

/** Bonus feature triggered */
export function trackFeature(feature: 'buffalo_rush' | 'free_spins' | 'tien_len'): void {
  track('feature', 0, { feature });
}

/** Gamble feature outcome */
export function trackGamble(won: boolean, amount: number): void {
  track(won ? 'gamble_win' : 'gamble_loss', amount);
}
