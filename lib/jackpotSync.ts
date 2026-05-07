/**
 * jackpotSync.ts
 * All Supabase read/write operations for the shared progressive jackpots.
 */
import { supabase, JackpotRow } from './supabase';

// ── Fetch current values on startup ──────────────────────────────────────────
export async function fetchJackpotValues(): Promise<{ mega: number; grand: number } | null> {
  const { data, error } = await supabase
    .from('jackpots')
    .select('id, value');

  if (error || !data) {
    console.warn('[jackpotSync] fetchJackpotValues failed:', error?.message);
    return null;
  }

  const row = (id: string) => (data as JackpotRow[]).find(r => r.id === id)?.value ?? 0;
  return { mega: row('mega'), grand: row('grand') };
}

// ── Atomically add a bet contribution to both jackpots ───────────────────────
// Uses DB-side function so concurrent bets don't overwrite each other.
export async function contributeToJackpotsDB(
  megaDelta: number,
  grandDelta: number,
): Promise<void> {
  // Fire both RPCs in parallel — don't wait for result (optimistic local update already applied)
  await Promise.allSettled([
    supabase.rpc('increment_jackpot', { jackpot_id: 'mega',  delta: megaDelta  }),
    supabase.rpc('increment_jackpot', { jackpot_id: 'grand', delta: grandDelta }),
  ]);
}

// ── Reset jackpot to seed when won ───────────────────────────────────────────
export async function winJackpotDB(
  id: 'mega' | 'grand',
  seedValue: number,
): Promise<void> {
  const { error } = await supabase.rpc('win_jackpot', {
    jackpot_id: id,
    seed_value: seedValue,
  });
  if (error) console.warn('[jackpotSync] winJackpotDB failed:', error.message);
}

// ── Subscribe to realtime changes ────────────────────────────────────────────
export function subscribeToJackpots(
  onUpdate: (id: 'mega' | 'grand', value: number) => void,
) {
  const channel = supabase
    .channel('jackpots-realtime')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'jackpots' },
      (payload) => {
        const row = payload.new as JackpotRow;
        if (row.id === 'mega' || row.id === 'grand') {
          onUpdate(row.id, row.value);
        }
      },
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}
