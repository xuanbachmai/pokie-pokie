'use client';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Overview {
  total_players:    number;
  players_today:    number;
  players_week:     number;
  players_live:     number;
  total_deposited:  number;
  total_wagered:    number;
  total_paid_out:   number;
  total_spins:      number;
  mega_jackpot_wins:  number;
  grand_jackpot_wins: number;
  biggest_win:      number;
  deposited_today:  number;
  wagered_today:    number;
  buffalo_rush_count: number;
  free_spins_count:   number;
  tien_len_count:     number;
  gamble_wins:      number;
  gamble_losses:    number;
}

interface HourlyRow {
  hour:       string;
  spins:      number;
  wagered:    number;
  paid_out:   number;
  deposited:  number;
}

interface RecentEvent {
  id:         number;
  session_id: string;
  type:       string;
  amount:     number;
  meta:       Record<string, string> | null;
  created_at: string;
}

interface JackpotRow { id: string; value: number; }

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(n: number) {
  if (n === undefined || n === null) return '$0.00';
  return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function num(n: number) {
  return Number(n ?? 0).toLocaleString('en-US');
}
function pct(a: number, b: number) {
  if (!b || b === 0) return '—';
  return (a / b * 100).toFixed(1) + '%';
}
function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60)  return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

const TYPE_META: Record<string, { label: string; color: string; emoji: string }> = {
  deposit:      { label: 'Deposit',      color: '#00D187', emoji: '💰' },
  bet:          { label: 'Bet',          color: '#888',    emoji: '🎰' },
  win:          { label: 'Win',          color: '#FFD700', emoji: '🏆' },
  jackpot_win:  { label: 'Jackpot!',     color: '#FF4D6D', emoji: '🎆' },
  feature:      { label: 'Feature',      color: '#00BFFF', emoji: '💎' },
  gamble_win:   { label: 'Gamble Win',   color: '#A855F7', emoji: '♠' },
  gamble_loss:  { label: 'Gamble Loss',  color: '#FF8C00', emoji: '♥' },
};

// ── Bar chart (inline SVG) ────────────────────────────────────────────────────
function HourlyChart({ data }: { data: HourlyRow[] }) {
  const rows = [...data].reverse().slice(-24);
  if (rows.length === 0) return (
    <div className="flex items-center justify-center h-32 text-gray-600 text-sm">No activity yet</div>
  );

  const maxW = Math.max(...rows.map(r => Number(r.wagered)), 1);
  const maxP = Math.max(...rows.map(r => Number(r.paid_out)), 1);
  const maxVal = Math.max(maxW, maxP, 1);
  const barH = 80;
  const barW = 16;
  const gap   = 4;
  const total = rows.length;
  const svgW  = total * (barW + gap);

  return (
    <div className="overflow-x-auto">
      <svg width={svgW} height={barH + 28} style={{ display: 'block' }}>
        {rows.map((r, i) => {
          const x    = i * (barW + gap);
          const wH   = Math.max(2, (Number(r.wagered)  / maxVal) * barH);
          const pH   = Math.max(2, (Number(r.paid_out) / maxVal) * barH);
          const hour = new Date(r.hour).getHours();
          return (
            <g key={r.hour}>
              {/* Wagered bar */}
              <rect x={x} y={barH - wH} width={barW * 0.55} height={wH}
                fill="rgba(0,200,122,0.55)" rx={2} />
              {/* Paid out bar */}
              <rect x={x + barW * 0.45} y={barH - pH} width={barW * 0.55} height={pH}
                fill="rgba(255,77,109,0.5)" rx={2} />
              {/* Hour label */}
              <text x={x + barW / 2} y={barH + 16} textAnchor="middle"
                fontSize={8} fill="rgba(255,255,255,0.3)">
                {hour}h
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flex gap-4 mt-1 text-[10px]">
        <span style={{ color: 'rgba(0,200,122,0.8)' }}>■ Wagered</span>
        <span style={{ color: 'rgba(255,77,109,0.8)' }}>■ Paid out</span>
      </div>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function Card({
  label, value, sub, color = '#FFD700', emoji,
}: { label: string; value: string; sub?: string; color?: string; emoji: string }) {
  return (
    <div
      className="rounded-2xl flex flex-col gap-1 p-4"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div className="text-[11px] text-gray-500 tracking-widest uppercase flex items-center gap-1">
        <span>{emoji}</span> {label}
      </div>
      <div className="text-2xl font-black" style={{ color }}>{value}</div>
      {sub && <div className="text-[11px] text-gray-600">{sub}</div>}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function StatsPage() {
  const [ov,      setOv]      = useState<Overview | null>(null);
  const [hourly,  setHourly]  = useState<HourlyRow[]>([]);
  const [recent,  setRecent]  = useState<RecentEvent[]>([]);
  const [jackpots, setJackpots] = useState<{ mega: number; grand: number }>({ mega: 0, grand: 0 });
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [resetMsg,  setResetMsg]  = useState<string | null>(null);

  const resetJackpots = useCallback(async () => {
    const confirmed = window.confirm(
      'Reset both jackpots?\n\nGrand → $30,000\nMega  → $5,000\n\nThis affects all players immediately.'
    );
    if (!confirmed) return;
    setResetting(true);
    setResetMsg(null);
    const [a, b] = await Promise.all([
      supabase.from('jackpots').update({ value: 30000 }).eq('id', 'grand'),
      supabase.from('jackpots').update({ value: 5000  }).eq('id', 'mega'),
    ]);
    setResetting(false);
    if (a.error || b.error) {
      setResetMsg('❌ Reset failed: ' + (a.error?.message ?? b.error?.message));
    } else {
      setResetMsg('✅ Jackpots reset! Grand → $30,000 · Mega → $5,000');
      setTimeout(() => setResetMsg(null), 5000);
    }
  }, []);

  const load = useCallback(async () => {
    const [ovRes, hrRes, evRes, jpRes] = await Promise.all([
      supabase.from('stats_overview').select('*').single(),
      supabase.from('hourly_activity').select('*').limit(48),
      supabase.from('events').select('id,session_id,type,amount,meta,created_at')
        .order('created_at', { ascending: false }).limit(30),
      supabase.from('jackpots').select('id,value'),
    ]);

    if (ovRes.data) setOv(ovRes.data as Overview);
    if (hrRes.data) setHourly(hrRes.data as HourlyRow[]);
    if (evRes.data) setRecent(evRes.data as RecentEvent[]);
    if (jpRes.data) {
      const rows = jpRes.data as JackpotRow[];
      setJackpots({
        mega:  rows.find(r => r.id === 'mega')?.value  ?? 0,
        grand: rows.find(r => r.id === 'grand')?.value ?? 0,
      });
    }
    setLastRefresh(new Date());
    setLoading(false);
  }, []);

  // Initial load + 30s polling
  useEffect(() => { load(); const t = setInterval(load, 30_000); return () => clearInterval(t); }, [load]);

  // Live events feed via realtime
  useEffect(() => {
    const ch = supabase.channel('stats-events')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'events' }, payload => {
        setRecent(prev => [payload.new as RecentEvent, ...prev].slice(0, 30));
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'jackpots' }, payload => {
        const row = payload.new as JackpotRow;
        setJackpots(prev => ({ ...prev, [row.id]: row.value }));
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const houseProfit = ov ? Number(ov.total_wagered) - Number(ov.total_paid_out) : 0;
  const rtp         = ov ? Number(ov.total_paid_out) / Math.max(Number(ov.total_wagered), 1) * 100 : 0;
  const gambleTotal = ov ? Number(ov.gamble_wins) + Number(ov.gamble_losses) : 0;

  return (
    <div
      className="min-h-screen text-white"
      style={{ background: 'linear-gradient(160deg, #010e05 0%, #020c06 100%)', fontFamily: 'system-ui, sans-serif' }}
    >
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-black tracking-widest"
              style={{ background: 'linear-gradient(90deg,#00C07A,#FFD700)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              🎰 Vietnam Maze
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">Live Analytics Dashboard</p>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-gray-600">Last updated</div>
            <div className="text-sm text-gray-400">{lastRefresh.toLocaleTimeString()}</div>
            <button onClick={load}
              className="mt-1 text-[10px] text-emerald-600 hover:text-emerald-400 transition-colors">
              ↻ Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64 text-gray-600">Loading…</div>
        ) : (
          <>
            {/* ── Live jackpot meters ── */}
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="rounded-2xl p-4 text-center"
                style={{ background: 'linear-gradient(135deg,#1a0008,#300010)', border: '1px solid rgba(255,77,109,0.3)' }}>
                <div className="text-[10px] tracking-widest text-gray-500 uppercase mb-1">🐉 Grand Jackpot (live)</div>
                <div className="text-3xl font-black" style={{ color: '#FF4D6D' }}>{fmt(jackpots.grand)}</div>
              </div>
              <div className="rounded-2xl p-4 text-center"
                style={{ background: 'linear-gradient(135deg,#120800,#251500)', border: '1px solid rgba(255,215,0,0.3)' }}>
                <div className="text-[10px] tracking-widest text-gray-500 uppercase mb-1">⚡ Mega Jackpot (live)</div>
                <div className="text-3xl font-black" style={{ color: '#FFD700' }}>{fmt(jackpots.mega)}</div>
              </div>
            </div>

            {/* ── Jackpot reset button ── */}
            <div className="flex flex-col items-end gap-2 mb-6">
              <button
                onClick={resetJackpots}
                disabled={resetting}
                className="px-4 py-2 rounded-xl text-xs font-bold tracking-widest uppercase transition-all"
                style={{
                  background: resetting ? 'rgba(255,255,255,0.05)' : 'rgba(255,77,109,0.15)',
                  border: '1px solid rgba(255,77,109,0.4)',
                  color: resetting ? '#555' : '#FF4D6D',
                  cursor: resetting ? 'not-allowed' : 'pointer',
                }}
              >
                {resetting ? '⏳ Resetting…' : '🔄 Reset Jackpots to Seed'}
              </button>
              {resetMsg && (
                <div className="text-xs px-3 py-1.5 rounded-lg"
                  style={{
                    background: resetMsg.startsWith('✅') ? 'rgba(0,209,135,0.1)' : 'rgba(255,77,109,0.1)',
                    border: `1px solid ${resetMsg.startsWith('✅') ? 'rgba(0,209,135,0.3)' : 'rgba(255,77,109,0.3)'}`,
                    color: resetMsg.startsWith('✅') ? '#00D187' : '#FF4D6D',
                  }}>
                  {resetMsg}
                </div>
              )}
            </div>

            {/* ── Players ── */}
            <h2 className="text-[11px] tracking-widest text-gray-600 uppercase mb-3">Players</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <Card emoji="👥" label="Total Players"   value={num(ov?.total_players ?? 0)}  color="#00D187" />
              <Card emoji="🟢" label="Live (30 min)"   value={num(ov?.players_live ?? 0)}   color="#00FF99"
                sub="currently active" />
              <Card emoji="📅" label="Today"           value={num(ov?.players_today ?? 0)}  color="#00BFFF" />
              <Card emoji="📆" label="This Week"       value={num(ov?.players_week ?? 0)}   color="#A855F7" />
            </div>

            {/* ── Volume ── */}
            <h2 className="text-[11px] tracking-widest text-gray-600 uppercase mb-3">Volume</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              <Card emoji="💰" label="Total Deposited"  value={fmt(ov?.total_deposited ?? 0)} color="#00D187"
                sub={`${fmt(ov?.deposited_today ?? 0)} today`} />
              <Card emoji="🎰" label="Total Wagered"    value={fmt(ov?.total_wagered ?? 0)}   color="#FFD700"
                sub={`${num(ov?.total_spins ?? 0)} spins`} />
              <Card emoji="🏆" label="Total Paid Out"   value={fmt(ov?.total_paid_out ?? 0)}  color="#FF8C00"
                sub={`Biggest: ${fmt(ov?.biggest_win ?? 0)}`} />
            </div>

            {/* ── House ── */}
            <h2 className="text-[11px] tracking-widest text-gray-600 uppercase mb-3">House Performance</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <Card emoji="🏦" label="House Profit"
                value={fmt(houseProfit)}
                color={houseProfit >= 0 ? '#00D187' : '#FF4D6D'}
                sub="wagered − paid out" />
              <Card emoji="📊" label="RTP (all-time)"
                value={`${rtp.toFixed(1)}%`}
                color={rtp > 90 ? '#FF4D6D' : rtp > 70 ? '#FFD700' : '#00D187'}
                sub="target: 70-80%" />
              <Card emoji="📈" label="Today Wagered"   value={fmt(ov?.wagered_today ?? 0)}   color="#FFD700" />
              <Card emoji="🎯" label="Avg Win / Spin"
                value={fmt((ov?.total_paid_out ?? 0) / Math.max(ov?.total_spins ?? 1, 1))}
                color="#A855F7" />
            </div>

            {/* ── Features ── */}
            <h2 className="text-[11px] tracking-widest text-gray-600 uppercase mb-3">Feature Triggers</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              <Card emoji="🐃" label="Buffalo Rush"   value={num(ov?.buffalo_rush_count ?? 0)} color="#FF8C00" />
              <Card emoji="💎" label="Tiến Lên"       value={num(ov?.tien_len_count ?? 0)}     color="#00BFFF" />
              <Card emoji="🥁" label="Free Spins"     value={num(ov?.free_spins_count ?? 0)}   color="#A855F7" />
            </div>

            {/* ── Jackpots ── */}
            <h2 className="text-[11px] tracking-widest text-gray-600 uppercase mb-3">Jackpot History</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <Card emoji="🎆" label="Grand Wins"   value={num(ov?.grand_jackpot_wins ?? 0)}  color="#FF4D6D" />
              <Card emoji="⚡" label="Mega Wins"    value={num(ov?.mega_jackpot_wins ?? 0)}   color="#FFD700" />
              <Card emoji="♠" label="Gamble Win %"
                value={pct(ov?.gamble_wins ?? 0, gambleTotal)}
                color="#A855F7"
                sub={`${num(ov?.gamble_wins ?? 0)} W / ${num(ov?.gamble_losses ?? 0)} L`} />
              <Card emoji="🎰" label="Gamble Volume" value={num(gambleTotal)} color="#888"
                sub="total attempts" />
            </div>

            {/* ── Hourly chart ── */}
            <div className="rounded-2xl p-5 mb-6"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h2 className="text-[11px] tracking-widest text-gray-600 uppercase mb-4">
                📊 Hourly Activity (last 24h)
              </h2>
              <HourlyChart data={hourly} />
            </div>

            {/* ── Live activity feed ── */}
            <div className="rounded-2xl overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="px-5 py-3 flex items-center justify-between"
                style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <h2 className="text-[11px] tracking-widest text-gray-500 uppercase">
                  ⚡ Live Activity Feed
                </h2>
                <span className="text-[10px] text-gray-700">last 30 events</span>
              </div>
              <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                {recent.length === 0 ? (
                  <div className="px-5 py-8 text-center text-gray-600 text-sm">No events yet</div>
                ) : recent.map(ev => {
                  const meta = TYPE_META[ev.type] ?? { label: ev.type, color: '#888', emoji: '•' };
                  const shortId = ev.session_id.slice(0, 8);
                  const metaStr = ev.meta
                    ? Object.entries(ev.meta).map(([k, v]) => `${k}:${v}`).join(' ')
                    : '';
                  return (
                    <div key={ev.id} className="flex items-center gap-3 px-5 py-2.5 hover:bg-white/[0.02] transition-colors">
                      <span className="text-base w-5 text-center">{meta.emoji}</span>
                      <span className="text-[11px] font-black w-20 shrink-0" style={{ color: meta.color }}>
                        {meta.label}
                      </span>
                      <span className="font-black text-sm flex-1" style={{ color: ev.amount > 0 ? '#FFD700' : '#555' }}>
                        {ev.amount > 0 ? fmt(ev.amount) : '—'}
                      </span>
                      {metaStr && (
                        <span className="text-[10px] text-gray-600 hidden sm:block flex-1 truncate">
                          {metaStr}
                        </span>
                      )}
                      <span className="text-[10px] text-gray-700 font-mono shrink-0">{shortId}…</span>
                      <span className="text-[10px] text-gray-600 shrink-0 w-16 text-right">
                        {timeAgo(ev.created_at)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Footer ── */}
            <div className="text-center text-[10px] text-gray-700 mt-8">
              Vietnam Maze Analytics · Data refreshes every 30s · Realtime events via Supabase
            </div>
          </>
        )}
      </div>
    </div>
  );
}
