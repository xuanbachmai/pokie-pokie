# 🎰 Vietnam Maze — Pokies Simulator

> **⚠️ Disclaimer:** This is a free educational demo. No real money, no real prizes, no withdrawals. Built in Australia for demonstration and research purposes only. Online gambling simulators of this kind may be restricted or prohibited in certain jurisdictions — see [Legal Notice](#legal-notice) below.

---

## Why I built this

I moved to Australia for university, and after 3 years, one of the first things that caught me off-guard
wasn't the weather or the accent — it was the pokies.

Walk into any pub, any RSL club, any corner of a shopping strip, and there they are:
rows of glowing slot machines, completely legal, completely normal, humming quietly while
people feed them money. It felt like part of the furniture. Nobody seemed to think it was
strange.

So I started asking questions.

Australia has the highest gambling losses per capita of any country on Earth — roughly
**$1,000 per adult per year**, significantly more than the United States despite having
a fraction of the population. The US casino industry is built around destinations like
Las Vegas; Australia put the machines in the pub down the street. Accessibility turned
out to be the key variable.

But the more interesting question to me was psychological: **why are these machines so
hard to walk away from?** I'd taken enough behavioural economics to recognise the
vocabulary — variable-ratio reinforcement schedules, near-miss effects, the way a losing
spin is animated to *feel* like almost-winning — but I wanted to understand it from the
inside. Not by losing money, but by building the thing myself.

So I did.

**Vietnam Maze** is a full-featured pokies simulation inspired by the Buffalo-style
machines popular in Australian venues. It has a proper RTP model, a shared progressive
jackpot across all players (backed by a real database), a gamble feature, free spins, a
Buffalo Rush bonus round, and a Tiến Lên bonus that pays out the Grand Jackpot if you
fill all five columns.

Building it taught me more about why people gamble than any paper I read.

---

## Live demo

🎮 **[pokiespokies.vercel.app](https://pokiespokies.vercel.app)**

---

## How the game works

### Basic spin
Select your **denomination** (0.01¢ – $1.00), **bet per line**, and **active lines** (up to 50), then press **SPIN**. Wins are paid left-to-right on active paylines. The **🐯 Wild** substitutes for all regular symbols.

### Symbols & payouts
| Symbol | Name | 3× | 4× | 5× |
|---|---|---|---|---|
| 🐕 | Cậu Vàng | 15× | 60× | 250× |
| 🦅 | Phượng | 10× | 30× | 100× |
| 🪷 | Hoa Sen | 6× | 20× | 60× |
| 🏮 | Đèn Lồng | 4× | 12× | 40× |
| 🎋 | Tre Xanh | 3× | 8× | 25× |
| 🍜 | Phở | 2× | 6× | 15× |
| 🌾 | Lúa | 1× | 3× | 10× |
| 🐯 | Wild | 6× | 20× | 70× |

*(Payouts are multiples of bet-per-line)*

### 🥁 Trống Đồng — Free Spins
Landing the **Trống Đồng scatter** on all 3 middle reels (cols 2–4) triggers **6 free spins** with a win multiplier. Landing 3 scatters again during free spins awards **+6 more spins** (retrigger). Free spins winnings are accumulated and credited at the end of the session — you can then gamble or collect.

### 🐃 Buffalo Rush — Hold & Spin Bonus
Landing **6 or more Buffalo (🐃)** symbols in a single spin triggers the **Buffalo Rush** bonus. The exact grid positions where buffaloes appeared are pre-filled as starting prizes. You get **3 re-spins** (reset to 3 each time a new slot lands). Each new slot reveals a credit prize, a jackpot tier, or a 💎 Diamond Buffalo.

- **Fill all 15 slots → 🏆 Grand Jackpot** (shared progressive, resets to seed after win)
- Near misses (4–5 buffalo) are common by design — that's the near-miss effect in action

### 💎 Tiến Lên — Diamond Feature
Landing a **Diamond Buffalo** during Buffalo Rush triggers the **Tiến Lên** feature — a separate 5-column re-spin game with boosted multipliers. Fill all 5 columns → **Grand Jackpot**.

### ♠ Gamble Feature
After any win you may **gamble** your prize:
- **Red / Black** — 2× payout on correct guess (50% chance)
- **Suit (♥ ♦ ♠ ♣)** — 4× payout on correct guess (25% chance)
- Streak of 5 consecutive wins = danger zone. Gamble is unavailable after jackpot wins.

### 🏆 Progressive Jackpots
| Tier | Label | Seed |
|---|---|---|
| Grand | Grand Jackpot | $30,000 |
| Major | Mega Jackpot | $5,000 |
| Minor | Major Bonus | varies |
| Mini | Mini Bonus | varies |

Jackpots accumulate contributions from every bet placed across all players in real time via Supabase.

---

## Setup & self-hosting

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier is fine)

### 1. Clone & install
```bash
git clone https://github.com/xuanbachmai/pokie-pokie.git
cd pokie-pokie

npm install
```

### 2. Environment variables
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Database schema
Run the SQL in `supabase/schema.sql` via the Supabase SQL Editor. This creates:
- `sessions` — player session tracking
- `events` — spin, win, deposit, feature, gamble events
- `jackpots` — live Grand and Mega jackpot values
- `gamble_history` — realtime card draw feed
- `stats_overview` view — aggregated analytics
- `hourly_activity` view — wagered/paid-out by hour

### 4. Run locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

### 5. Deploy
The project is pre-configured for [Vercel](https://vercel.com). Push to your GitHub repo, import into Vercel, add the two environment variables, and deploy.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| State | Zustand |
| Animations | Framer Motion |
| Database / Realtime | Supabase (Postgres + Realtime) |
| Styling | Tailwind CSS |
| Deployment | Vercel |

---

## Legal Notice

**This project is a free, non-commercial educational simulator. No real money is involved at any point. No deposits, withdrawals, or financial transactions of any kind occur.**

Online gambling simulators, social casino games, or gambling-themed applications may be subject to legal restrictions depending on your jurisdiction. By accessing or using this project, you confirm that doing so is lawful in your location.

**Countries/regions where access may be restricted or prohibited include (but are not limited to):**

- 🇦🇪 United Arab Emirates
- 🇸🇦 Saudi Arabia
- 🇶🇦 Qatar
- 🇰🇼 Kuwait
- 🇮🇷 Iran
- 🇵🇰 Pakistan
- 🇦🇫 Afghanistan
- 🇨🇳 China (mainland)
- 🇸🇬 Singapore (certain gambling-related content)
- 🇺🇸 United States (varies by state — check local laws)
- 🇻🇳 Vietnam (gambling is heavily restricted by law)
- 🇧🇷 Brazil (regulations evolving)
- 🇵🇱 Poland
- 🇨🇾 Cyprus

*This list is not exhaustive. If you are unsure whether accessing this content is legal in your jurisdiction, please consult local laws before proceeding.*

The author makes no representations or warranties about the legality of accessing this content in any specific jurisdiction and accepts no liability for any use of this project outside of its intended educational purpose.

---

*🇦🇺 Built in Australia · Next.js · Zustand · Supabase · Framer Motion*
