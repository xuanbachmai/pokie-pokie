import { createClient } from '@supabase/supabase-js';

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? '';
const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Single shared client — safe to call on server and client
export const supabase = createClient(url, key, {
  realtime: { params: { eventsPerSecond: 10 } },
});

// ── Type helpers ──────────────────────────────────────────────────────────────
export interface JackpotRow {
  id:         string;   // 'mega' | 'grand'
  value:      number;
  updated_at: string;
}

export interface GambleHistoryRow {
  id:         number;
  suit:       'spades' | 'hearts' | 'diamonds' | 'clubs';
  value:      number;
  color:      'red' | 'black';
  won:        boolean;
  created_at: string;
}
