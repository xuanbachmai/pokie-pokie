# 🎰 Vietnam Maze — A Pokies Simulation / Demo

---

## Why I built this

I moved to Australia for university, and one of the first things that caught me off-guard
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
fill all five columns. It also has a live analytics dashboard so you can watch the house
edge do its quiet, remorseless work in real time.

Building it taught me more about why people gamble than any paper I read.

---

## Live demo

🎮 **[pokiespokies.vercel.app](https://pokiespokies.vercel.app)**

📊 Stats dashboard: [pokiespokies.vercel.app/stats](https://pokiespokies.vercel.app/stats)

---

*Built with Next.js · Zustand · Supabase · Three.js · Framer Motion*
