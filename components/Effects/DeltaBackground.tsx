'use client';

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';

/* ══════════════════════════════════════════════════════════════════════════════
   Trẻ Chăn Trâu — Vietnamese rice field, children herding buffalo
   Daytime countryside scene: blue sky, paddy terraces, grazing buffalo,
   silhouetted children, palm trees, rolling hills, dragonflies.
   ══════════════════════════════════════════════════════════════════════════════ */

// Firefly/dragonfly positions: [cx, cy, r, dur, begin]
const DRAGONFLIES: [number, number, number, number, number][] = [
  [210, 340, 1.3, 3.2, 0.0],
  [460, 280, 1.0, 2.8, 0.8],
  [690, 310, 1.4, 3.6, 0.4],
  [920, 260, 1.1, 2.5, 1.2],
  [1180,320, 1.3, 3.0, 0.6],
  [350, 420, 1.0, 2.9, 1.5],
  [780, 390, 1.2, 3.4, 0.3],
  [1050,350, 1.0, 2.7, 1.0],
];

// Ambient overlay per game phase
const AMBIENT: Record<string, { color: string; opacity: number }> = {
  IDLE:          { color: '#000000', opacity: 0 },
  SPINNING:      { color: '#FFFFFF', opacity: 0.03 },
  EVALUATING:    { color: '#FFFFFF', opacity: 0.02 },
  WIN_DISPLAY:   { color: '#FFD700', opacity: 0.06 },
  BONUS_TRIGGER: { color: '#FF8800', opacity: 0.08 },
  BONUS_ACTIVE:  { color: '#FF6600', opacity: 0.06 },
  FREE_SPINS:    { color: '#88FFCC', opacity: 0.05 },
  GAMBLE_OFFER:  { color: '#AA44FF', opacity: 0.05 },
  GAMBLE_ACTIVE: { color: '#AA44FF', opacity: 0.07 },
  DIAMOND_RUSH:  { color: '#00BFFF', opacity: 0.06 },
};

export function DeltaBackground() {
  const phase = useGameStore(s => s.phase);
  const bgGRef  = useRef<SVGGElement>(null);
  const fgGRef  = useRef<SVGGElement>(null);
  const rafRef  = useRef<number | null>(null);

  /* ── Mouse parallax ── */
  useEffect(() => {
    let ticking = false;
    const onMove = (e: MouseEvent) => {
      if (!ticking) {
        ticking = true;
        rafRef.current = requestAnimationFrame(() => {
          const nx = (e.clientX / window.innerWidth)  - 0.5;
          const ny = (e.clientY / window.innerHeight) - 0.5;
          if (bgGRef.current)
            bgGRef.current.style.transform = `translate(${nx * -12}px, ${ny * -5}px)`;
          if (fgGRef.current)
            fgGRef.current.style.transform = `translate(${nx * -28}px, ${ny * -10}px)`;
          ticking = false;
        });
      }
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const ambient = AMBIENT[phase] ?? AMBIENT['IDLE'];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        style={{ width: '100%', height: '100%', display: 'block' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Sky gradient — bright blue at top, pale haze at horizon */}
          <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#1A6ECC" />
            <stop offset="30%"  stopColor="#3D9FE8" />
            <stop offset="65%"  stopColor="#7EC8F4" />
            <stop offset="88%"  stopColor="#C8E8F8" />
            <stop offset="100%" stopColor="#E4F4FF" />
          </linearGradient>

          {/* Distant hill layers */}
          <linearGradient id="hill1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4A8C5C" /><stop offset="100%" stopColor="#2A6040" />
          </linearGradient>
          <linearGradient id="hill2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5DA870" /><stop offset="100%" stopColor="#357850" />
          </linearGradient>
          <linearGradient id="hill3" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6EC882" /><stop offset="100%" stopColor="#3A9060" />
          </linearGradient>

          {/* Bright rice paddy green */}
          <linearGradient id="paddy1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7FCC5A" /><stop offset="100%" stopColor="#4A9830" />
          </linearGradient>
          <linearGradient id="paddy2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#96DC60" /><stop offset="100%" stopColor="#5AAA38" />
          </linearGradient>
          <linearGradient id="paddy3" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5CB848" /><stop offset="100%" stopColor="#388830" />
          </linearGradient>

          {/* Water-filled paddy (reflective) */}
          <linearGradient id="water" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#A8DCF8" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#68B8E8" stopOpacity="0.70" />
          </linearGradient>

          {/* Foreground earth berm */}
          <linearGradient id="berm" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8B7355" /><stop offset="100%" stopColor="#5C4A2A" />
          </linearGradient>

          {/* Path/road dirt */}
          <linearGradient id="dirt" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#C8A87A" /><stop offset="100%" stopColor="#9C7848" />
          </linearGradient>

          {/* Blurs */}
          <filter id="b2"  x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2"  /></filter>
          <filter id="b5"  x="-25%" y="-25%" width="150%" height="150%"><feGaussianBlur stdDeviation="5"  /></filter>
          <filter id="b10" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="10" /></filter>
          <filter id="b20" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="20" /></filter>

          {/* Dragonfly glow */}
          <filter id="dfGlow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Sun halo */}
          <radialGradient id="sunHalo" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#FFFBE0" stopOpacity="0.95" />
            <stop offset="40%"  stopColor="#FFE840" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#FFD700" stopOpacity="0"    />
          </radialGradient>

          {/* Lantern glow (for swaying lanterns in background village) */}
          <radialGradient id="lanternGlow2" cx="50%" cy="40%" r="60%">
            <stop offset="0%"   stopColor="#FF6B00" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#880000" stopOpacity="0.7" />
          </radialGradient>

          {/* Vignette */}
          <radialGradient id="vig" cx="50%" cy="50%" r="70%">
            <stop offset="0%"   stopColor="#000000" stopOpacity="0" />
            <stop offset="60%"  stopColor="#000000" stopOpacity="0.08" />
            <stop offset="85%"  stopColor="#000000" stopOpacity="0.38" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.60" />
          </radialGradient>
        </defs>

        {/* ══ BACKGROUND GROUP (parallax ×0.5) ════════════════════════════════ */}
        <g ref={bgGRef} style={{ transformOrigin: '720px 450px', willChange: 'transform' }}>

          {/* 1 · SKY */}
          <rect width="1440" height="900" fill="url(#sky)" />

          {/* 2 · SUN */}
          <circle cx="1180" cy="90" r="140" fill="url(#sunHalo)" filter="url(#b20)" />
          <circle cx="1180" cy="90" r="60"  fill="#FFFBE0" opacity="0.5"  filter="url(#b10)" />
          <circle cx="1180" cy="90" r="36"  fill="#FFF8D0" opacity="0.95" filter="url(#b2)"  />
          <circle cx="1180" cy="90" r="28"  fill="#FFFAE8" opacity="0.99" />
          {/* Sun rays */}
          {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg, i) => {
            const r = (deg * Math.PI) / 180;
            return (
              <line key={i}
                x1={1180 + 38 * Math.cos(r)} y1={90 + 38 * Math.sin(r)}
                x2={1180 + 58 * Math.cos(r)} y2={90 + 58 * Math.sin(r)}
                stroke="#FFE840" strokeWidth={i % 3 === 0 ? 2 : 1} opacity="0.5"
              />
            );
          })}

          {/* 3 · CLOUDS */}
          {/* Large fluffy white clouds */}
          <g filter="url(#b5)" opacity="0.88">
            <ellipse cx="280"  cy="100" rx="145" ry="52" fill="#FFFFFF" />
            <ellipse cx="220"  cy="115" rx="88"  ry="40" fill="#FFFFFF" />
            <ellipse cx="345"  cy="118" rx="92"  ry="38" fill="#FFFFFF" />
            <ellipse cx="280"  cy="125" rx="130" ry="32" fill="#F0F8FF" />
          </g>
          <g filter="url(#b5)" opacity="0.82">
            <ellipse cx="780"  cy="75"  rx="165" ry="55" fill="#FFFFFF" />
            <ellipse cx="710"  cy="90"  rx="96"  ry="42" fill="#FFFFFF" />
            <ellipse cx="855"  cy="92"  rx="100" ry="40" fill="#FFFFFF" />
            <ellipse cx="780"  cy="100" rx="148" ry="30" fill="#EEF6FF" />
          </g>
          <g filter="url(#b2)" opacity="0.70">
            <ellipse cx="1320" cy="60"  rx="98"  ry="36" fill="#FFFFFF" />
            <ellipse cx="1270" cy="72"  rx="62"  ry="28" fill="#FFFFFF" />
            <ellipse cx="1370" cy="74"  rx="68"  ry="26" fill="#FFFFFF" />
          </g>
          {/* Small drifting clouds */}
          {([
            [520, 140, 52, 20], [980, 120, 68, 24], [1100, 160, 44, 18],
            [60,  130, 40, 16], [1420, 100, 50, 19],
          ] as [number,number,number,number][]).map(([cx, cy, rx, ry], i) => (
            <g key={i} filter="url(#b2)" opacity="0.65">
              <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#FFFFFF" />
              <ellipse cx={cx-rx*0.3} cy={cy+ry*0.4} rx={rx*0.65} ry={ry*0.65} fill="#FFFFFF" />
            </g>
          ))}

          {/* 4 · DISTANT MOUNTAINS (3 layers, haze) */}
          <path
            d="M0,380 Q120,310 240,325 Q360,340 480,295 Q580,260 680,280 Q780,300 880,268 Q980,238 1080,255 Q1180,272 1280,248 Q1360,235 1440,252 L1440,420 L0,420 Z"
            fill="#6E9EA8" opacity="0.45" filter="url(#b10)"
          />
          <path
            d="M0,400 Q100,345 220,358 Q340,370 460,332 Q560,305 660,318 Q760,332 860,300 Q960,270 1060,288 Q1160,306 1260,282 Q1350,265 1440,278 L1440,435 L0,435 Z"
            fill="url(#hill1)" opacity="0.55" filter="url(#b5)"
          />
          <path
            d="M0,430 Q120,388 240,395 Q360,402 480,368 Q580,345 680,358 Q780,370 880,342 Q980,318 1080,332 Q1180,346 1280,320 Q1360,304 1440,312 L1440,460 L0,460 Z"
            fill="url(#hill2)" opacity="0.70" filter="url(#b5)"
          />
          <path
            d="M0,455 Q100,420 220,430 Q340,440 460,412 Q560,392 660,404 Q760,416 860,390 Q960,368 1060,380 Q1160,392 1260,370 Q1360,355 1440,362 L1440,480 L0,480 Z"
            fill="url(#hill3)" opacity="0.85"
          />

          {/* 5 · VILLAGE / BACKGROUND TREES on hilltop */}
          {([
            [420, 460, 0.55], [480, 455, 0.60], [540, 450, 0.58],
            [860, 442, 0.55], [920, 438, 0.60], [980, 444, 0.57],
          ] as [number,number,number][]).map(([bx, by, sc], i) => (
            <g key={i} filter="url(#b2)" opacity="0.75">
              <path d={`M${bx},${by} Q${bx+3*sc},${by-30*sc} ${bx+5*sc},${by-50*sc}`}
                stroke="#2A5C1A" strokeWidth={5*sc} fill="none" strokeLinecap="round" />
              <ellipse cx={bx+5*sc} cy={by-50*sc} rx={18*sc} ry={15*sc} fill="#3A7C28" />
              <ellipse cx={bx+5*sc} cy={by-55*sc} rx={14*sc} ry={12*sc} fill="#4A9C30" />
            </g>
          ))}

          {/* 6 · SWAYING LANTERNS hanging from background tree */}
          {([
            [380, 448, 2.8], [720, 436, 3.4], [1060, 444, 3.0],
          ] as [number,number,number][]).map(([x, y, dur], i) => (
            <g key={i}>
              <line x1={x} y1={y} x2={x} y2={y+12} stroke="#8B6914" strokeWidth="0.7" opacity="0.5" />
              <g>
                <animateTransform attributeName="transform" type="rotate"
                  values={`0 ${x} ${y}; ${i%2===0?4:-4} ${x} ${y}; 0 ${x} ${y}; ${i%2===0?-4:4} ${x} ${y}; 0 ${x} ${y}`}
                  dur={`${dur}s`} repeatCount="indefinite"
                  calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1;0.45 0 0.55 1;0.45 0 0.55 1" />
                <ellipse cx={x} cy={y+18} rx="5" ry="8" fill="url(#lanternGlow2)" filter="url(#b2)" opacity="0.85" />
                <ellipse cx={x} cy={y+18} rx="3" ry="5" fill="#FFAA00" opacity="0.3">
                  <animate attributeName="opacity" values="0.3;0.55;0.3" dur="1.8s" repeatCount="indefinite" />
                </ellipse>
                <line x1={x} y1={y+26} x2={x} y2={y+32} stroke="#CC6600" strokeWidth="0.8" opacity="0.6" />
                <circle cx={x} cy={y+32} r="1.2" fill="#FFD700" opacity="0.8" />
              </g>
            </g>
          ))}

        </g>{/* end bgG */}

        {/* ══ MID-GROUND — rice paddies + water reflections ════════════════════ */}

        {/* Paddy terrace 1 (upper) */}
        <path d="M0,472 Q360,462 720,468 Q1080,474 1440,464 L1440,520 L0,520 Z"
          fill="url(#paddy1)" />
        {/* Paddy row lines */}
        {[480,490,500,510].map((y, i) => (
          <path key={i} d={`M0,${y} Q360,${y-3} 720,${y} Q1080,${y+3} 1440,${y}`}
            stroke="#5A9840" strokeWidth="0.8" fill="none" opacity="0.4" />
        ))}

        {/* Water-filled terrace (reflective) */}
        <path d="M0,520 Q360,512 720,518 Q1080,524 1440,514 L1440,568 L0,568 Z"
          fill="url(#water)" />
        {/* Water shimmer lines */}
        {[530, 545, 558].map((y, i) => (
          <path key={i} d={`M80,${y} Q360,${y-4} 720,${y} Q1080,${y+4} 1360,${y}`}
            stroke="#FFFFFF" strokeWidth="1.2" fill="none" opacity="0">
            <animate attributeName="opacity"
              values="0;0.35;0" dur={`${3.5+i*1.2}s`} begin={`${i*1.8}s`} repeatCount="indefinite" />
          </path>
        ))}
        {/* Sky/sun reflection in water */}
        <ellipse cx="1180" cy="545" rx="80" ry="18" fill="#FFF8D0" opacity="0.28" filter="url(#b5)" />

        {/* Paddy terrace 2 */}
        <path d="M0,568 Q360,560 720,566 Q1080,572 1440,562 L1440,620 L0,620 Z"
          fill="url(#paddy2)" />
        {[578,590,602,614].map((y, i) => (
          <path key={i} d={`M0,${y} Q360,${y-3} 720,${y} Q1080,${y+3} 1440,${y}`}
            stroke="#68B040" strokeWidth="0.8" fill="none" opacity="0.38" />
        ))}

        {/* Paddy terrace 3 (lower) */}
        <path d="M0,620 Q360,612 720,618 Q1080,624 1440,614 L1440,680 L0,680 Z"
          fill="url(#paddy3)" />

        {/* Dirt berm paths between paddies */}
        <path d="M0,518 Q360,510 720,516 Q1080,522 1440,512 L1440,524 L0,524 Z"
          fill="url(#berm)" opacity="0.8" />
        <path d="M0,566 Q360,558 720,564 Q1080,570 1440,560 L1440,572 L0,572 Z"
          fill="url(#berm)" opacity="0.75" />
        <path d="M0,618 Q360,610 720,616 Q1080,622 1440,612 L1440,624 L0,624 Z"
          fill="url(#berm)" opacity="0.72" />

        {/* ══ BUFFALO + CHILDREN (mid-ground) ══════════════════════════════════ */}

        {/* Buffalo 1 — large, centre-left */}
        <g transform="translate(340, 540)" opacity="0.92">
          {/* Body */}
          <ellipse cx="0" cy="0" rx="40" ry="22" fill="#2A1A08" />
          {/* Head */}
          <ellipse cx="36" cy="-12" rx="18" ry="14" fill="#2A1A08" />
          {/* Horns */}
          <path d="M42,-22 Q48,-35 36,-30" stroke="#5A4020" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M30,-22 Q22,-35 32,-30" stroke="#5A4020" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Eye */}
          <circle cx="42" cy="-14" r="2.5" fill="#FFFFFF" />
          <circle cx="42" cy="-14" r="1.5" fill="#1A0A00" />
          {/* Legs */}
          {([-20, -8, 8, 20] as number[]).map((x, i) => (
            <rect key={i} x={x-3} y={14} width={6} height={16} rx={2} fill="#1A0E04" />
          ))}
          {/* Tail */}
          <path d="M-40,0 Q-52,4 -46,10" stroke="#2A1A08" strokeWidth="4" fill="none" strokeLinecap="round" />
          {/* Hump shadow */}
          <ellipse cx="-8" cy="-16" rx="12" ry="8" fill="#1A0E04" opacity="0.6" />
        </g>

        {/* Buffalo 2 — right side, smaller/farther */}
        <g transform="translate(1020, 548) scale(0.78)" opacity="0.85">
          <ellipse cx="0" cy="0" rx="40" ry="22" fill="#241608" />
          <ellipse cx="36" cy="-12" rx="18" ry="14" fill="#241608" />
          <path d="M42,-22 Q48,-35 36,-30" stroke="#5A4020" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M30,-22 Q22,-35 32,-30" stroke="#5A4020" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <circle cx="42" cy="-14" r="2.5" fill="#FFFFFF" />
          <circle cx="42" cy="-14" r="1.5" fill="#1A0A00" />
          {([-20, -8, 8, 20] as number[]).map((x, i) => (
            <rect key={i} x={x-3} y={14} width={6} height={16} rx={2} fill="#18080A" />
          ))}
          <path d="M-40,0 Q-52,4 -46,10" stroke="#241608" strokeWidth="4" fill="none" strokeLinecap="round" />
        </g>

        {/* Child 1 — riding buffalo #1, conical hat */}
        <g transform="translate(340, 504)">
          {/* Body */}
          <ellipse cx="0" cy="0" rx="7" ry="10" fill="#C07840" />
          {/* Head */}
          <circle cx="0" cy="-14" r="7" fill="#D08848" />
          {/* Conical nón lá hat */}
          <path d="M-14,-17 L0,-36 L14,-17 Q0,-13 -14,-17 Z" fill="#E8D088" opacity="0.95" />
          <path d="M-14,-17 Q0,-20 14,-17" stroke="#C8A858" strokeWidth="0.8" fill="none" />
          {/* Arm holding rope */}
          <path d="M7,-4 Q20,2 30,0" stroke="#C07840" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          {/* Rope going to buffalo's nose */}
          <path d="M30,0 Q60,8 70,12" stroke="#8B6914" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          {/* Legs dangling */}
          <path d="M-4,8 L-6,22" stroke="#C07840" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M4,8  L6,22"  stroke="#C07840" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>

        {/* Child 2 — walking behind buffalo #2, carrying stick */}
        <g transform="translate(980, 514) scale(0.82)">
          <ellipse cx="0" cy="0" rx="6" ry="9" fill="#B06830" />
          <circle cx="0" cy="-12" r="6.5" fill="#C07840" />
          <path d="M-12,-15 L0,-32 L12,-15 Q0,-11 -12,-15 Z" fill="#DCC878" opacity="0.9" />
          <path d="M-12,-15 Q0,-18 12,-15" stroke="#B8983A" strokeWidth="0.7" fill="none" />
          {/* Stick/walking cane */}
          <path d="M8,-2 L22,16" stroke="#5C3810" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M-4,6 L-5,20"  stroke="#B06830" strokeWidth="2.8" fill="none" strokeLinecap="round" />
          <path d="M4,6  L5,20"   stroke="#B06830" strokeWidth="2.8" fill="none" strokeLinecap="round" />
        </g>

        {/* Child 3 — standing far right, playing flute */}
        <g transform="translate(1250, 556) scale(0.70)">
          <ellipse cx="0" cy="0" rx="6" ry="9" fill="#B87040" />
          <circle cx="0" cy="-12" r="6" fill="#C88048" />
          <path d="M-11,-14 L0,-30 L11,-14 Q0,-10 -11,-14 Z" fill="#E0C870" opacity="0.88" />
          {/* Flute held up */}
          <path d="M8,-8 L26,-16" stroke="#7A5020" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M-4,6 L-4,20" stroke="#B87040" strokeWidth="2.8" fill="none" strokeLinecap="round" />
          <path d="M4,6  L4,20"  stroke="#B87040" strokeWidth="2.8" fill="none" strokeLinecap="round" />
        </g>

        {/* Child 4 — far left, near water's edge, skipping */}
        <g transform="translate(148, 524) scale(0.68)">
          <ellipse cx="0" cy="0" rx="6" ry="9" fill="#B86840" />
          <circle cx="0" cy="-12" r="6" fill="#C87848" />
          <path d="M-11,-14 L0,-30 L11,-14 Q0,-10 -11,-14 Z" fill="#DEC870" opacity="0.85" />
          <path d="M-8,0 L-18,8"  stroke="#B86840" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M8,0  L18,8"   stroke="#B86840" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M-3,8 L-8,22"  stroke="#B86840" strokeWidth="2.8" fill="none" strokeLinecap="round" />
          <path d="M3,8  L10,18"  stroke="#B86840" strokeWidth="2.8" fill="none" strokeLinecap="round" />
        </g>

        {/* Rope from child 1 to buffalo 1 */}
        <path d="M370,508 Q390,520 400,538" stroke="#8B6914" strokeWidth="1.2" fill="none"
          strokeLinecap="round" strokeDasharray="3,2" opacity="0.7" />

        {/* ══ FOREGROUND GROUP (stronger parallax) ══════════════════════════ */}
        <g ref={fgGRef} style={{ transformOrigin: '720px 750px', willChange: 'transform' }}>

          {/* Foreground earth / low embankment */}
          <path d="M0,680 Q360,670 720,676 Q1080,682 1440,672 L1440,900 L0,900 Z"
            fill="#4A7A28" />

          {/* Foreground paddy rows (closest — visible stalks) */}
          {[690, 705, 720, 735, 750, 768, 788, 810].map((y, i) => (
            <path key={i} d={`M0,${y} Q360,${y-4} 720,${y} Q1080,${y+4} 1440,${y}`}
              stroke={i < 4 ? "#6CC040" : "#50A028"} strokeWidth={i < 4 ? "1.2" : "1.0"}
              fill="none" opacity={0.55 - i * 0.04} />
          ))}

          {/* Foreground palm trees — LEFT */}
          <g filter="url(#b2)" opacity="0.97">
            <path d="M20,900 Q38,790 56,678 Q65,624 74,588"
              stroke="#3A2510" strokeWidth="16" strokeLinecap="round" fill="none" />
            <path d="M20,900 Q38,790 56,678 Q65,624 74,588"
              stroke="#5A3C18" strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.5" />
            {/* Fronds */}
            {([[-80,38],[-54,42],[-24,46],[8,50],[40,46],[68,40],[92,32]] as [number,number][]).map(([ang,len],fi) => {
              const rad = (ang-90)*Math.PI/180;
              const ex = 74+len*Math.cos(rad), ey = 588+len*Math.sin(rad);
              const qx = 74+len*0.52*Math.cos(rad)+5*Math.sin(rad);
              const qy = 588+len*0.52*Math.sin(rad)+8;
              return <path key={fi}
                d={`M74,588 Q${qx.toFixed(1)},${qy.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}`}
                stroke="#2A5A10" strokeWidth={fi<2||fi>5?2:2.5} fill="none" strokeLinecap="round" />;
            })}
            {/* Green frond fill */}
            {([[-80,38],[-54,42],[-24,46],[8,50],[40,46],[68,40],[92,32]] as [number,number][]).map(([ang,len],fi) => {
              const rad = (ang-90)*Math.PI/180;
              const ex = 74+len*Math.cos(rad), ey = 588+len*Math.sin(rad);
              return <ellipse key={fi} cx={(74+ex)/2} cy={(588+ey)/2} rx={len*0.18} ry={len*0.08}
                fill="#3A8020" opacity="0.4"
                transform={`rotate(${ang}, ${(74+ex)/2}, ${(588+ey)/2})`} />;
            })}
          </g>

          <g filter="url(#b2)" opacity="0.93">
            <path d="M165,900 Q175,806 172,710 Q168,650 164,610"
              stroke="#3A2510" strokeWidth="12" strokeLinecap="round" fill="none" />
            {([[-86,34],[-58,38],[-26,42],[8,46],[38,42],[66,36],[90,28]] as [number,number][]).map(([ang,len],fi) => {
              const rad = (ang-90)*Math.PI/180;
              const ex = 164+len*Math.cos(rad), ey = 610+len*Math.sin(rad);
              const qx = 164+len*0.52*Math.cos(rad)+4.5*Math.sin(rad);
              const qy = 610+len*0.52*Math.sin(rad)+7;
              return <path key={fi}
                d={`M164,610 Q${qx.toFixed(1)},${qy.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}`}
                stroke="#2A5A10" strokeWidth={1.8} fill="none" strokeLinecap="round" />;
            })}
          </g>

          {/* Foreground palm trees — RIGHT */}
          <g filter="url(#b2)" opacity="0.97">
            <path d="M1420,900 Q1402,790 1384,678 Q1375,624 1366,588"
              stroke="#3A2510" strokeWidth="16" strokeLinecap="round" fill="none" />
            <path d="M1420,900 Q1402,790 1384,678 Q1375,624 1366,588"
              stroke="#5A3C18" strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.5" />
            {([[-92,38],[-66,42],[-34,46],[-4,50],[28,46],[58,40],[84,32]] as [number,number][]).map(([ang,len],fi) => {
              const rad = (ang-90)*Math.PI/180;
              const ex = 1366+len*Math.cos(rad), ey = 588+len*Math.sin(rad);
              const qx = 1366+len*0.52*Math.cos(rad)+5*Math.sin(rad);
              const qy = 588+len*0.52*Math.sin(rad)+8;
              return <path key={fi}
                d={`M1366,588 Q${qx.toFixed(1)},${qy.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}`}
                stroke="#2A5A10" strokeWidth={fi<2||fi>5?2:2.5} fill="none" strokeLinecap="round" />;
            })}
          </g>

          <g filter="url(#b2)" opacity="0.93">
            <path d="M1275,900 Q1265,806 1268,710 Q1271,650 1275,610"
              stroke="#3A2510" strokeWidth="12" strokeLinecap="round" fill="none" />
            {([[-90,34],[-62,38],[-28,42],[4,46],[36,42],[64,36],[88,28]] as [number,number][]).map(([ang,len],fi) => {
              const rad = (ang-90)*Math.PI/180;
              const ex = 1275+len*Math.cos(rad), ey = 610+len*Math.sin(rad);
              const qx = 1275+len*0.52*Math.cos(rad)+4.5*Math.sin(rad);
              const qy = 610+len*0.52*Math.sin(rad)+7;
              return <path key={fi}
                d={`M1275,610 Q${qx.toFixed(1)},${qy.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}`}
                stroke="#2A5A10" strokeWidth={1.8} fill="none" strokeLinecap="round" />;
            })}
          </g>

          {/* Banana trees / low bushes foreground edge */}
          {([
            [290, 672, 0.55], [580, 668, 0.60], [870, 670, 0.52], [1150, 666, 0.58],
          ] as [number,number,number][]).map(([bx,by,sc], i) => (
            <g key={i} opacity="0.82">
              <path d={`M${bx},${by} Q${bx+4*sc},${by-28*sc} ${bx+6*sc},${by-46*sc}`}
                stroke="#3A5C18" strokeWidth={7*sc} fill="none" strokeLinecap="round" />
              <ellipse cx={bx+6*sc} cy={by-48*sc} rx={22*sc} ry={14*sc}
                fill="#4A8C20" transform={`rotate(-20,${bx+6*sc},${by-48*sc})`} />
              <ellipse cx={bx+6*sc} cy={by-46*sc} rx={18*sc} ry={11*sc}
                fill="#5AAC28" transform={`rotate(15,${bx+6*sc},${by-46*sc})`} />
            </g>
          ))}

        </g>{/* end fgG */}

        {/* ══ DRAGONFLIES ═══════════════════════════════════════════════════ */}
        {DRAGONFLIES.map(([cx, cy, r, dur, begin], i) => (
          <g key={`df-${i}`} filter="url(#dfGlow)">
            <g>
              <animateTransform attributeName="transform" type="translate"
                values={`0,0; ${(i%2===0?1:-1)*4},${(i%3===0?1:-1)*3}; 0,0`}
                dur={`${(dur*1.6).toFixed(1)}s`}
                begin={`${begin.toFixed(1)}s`}
                repeatCount="indefinite" />
              {/* Body */}
              <ellipse cx={cx} cy={cy} rx={r*3.5} ry={r*0.9} fill="#00AA88">
                <animate attributeName="opacity" values="0;0;0.85;0.65;0;0"
                  dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" />
              </ellipse>
              {/* Wings */}
              <ellipse cx={cx-r*2} cy={cy-r*2} rx={r*4} ry={r*2} fill="#88DDFF" opacity="0">
                <animate attributeName="opacity" values="0;0;0.55;0.35;0;0"
                  dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" />
              </ellipse>
              <ellipse cx={cx+r*2} cy={cy-r*2} rx={r*4} ry={r*2} fill="#88DDFF" opacity="0">
                <animate attributeName="opacity" values="0;0;0.55;0.35;0;0"
                  dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" />
              </ellipse>
            </g>
          </g>
        ))}

        {/* ══ BIRDS flying in sky ═══════════════════════════════════════════ */}
        {([
          [200, 160, 8, 0], [320, 145, 6, 0.5], [340, 152, 6, 0.2],
          [900, 130, 7, 1], [920, 122, 5, 1.3], [940, 132, 6, 0.8],
        ] as [number,number,number,number][]).map(([bx, by, size, begin], i) => (
          <g key={`bird-${i}`} opacity="0.65">
            <path d={`M${bx-size},${by} Q${bx},${by-size*0.5} ${bx+size},${by}`}
              stroke="#2A3A4A" strokeWidth="1.2" fill="none" strokeLinecap="round">
              <animateTransform attributeName="transform" type="translate"
                values={`0,0; 30,${i%2===0?-8:8}; 0,0`}
                dur={`${6+i*1.5}s`} begin={`${begin}s`} repeatCount="indefinite" />
            </path>
          </g>
        ))}

        {/* ══ ATMOSPHERIC HAZE over horizon ═══════════════════════════════ */}
        <rect x="0" y="455" width="1440" height="55"
          fill="#C8E8F0" opacity="0.18" filter="url(#b20)" />

        {/* ══ CINEMATIC VIGNETTE ══════════════════════════════════════════ */}
        <rect width="1440" height="900" fill="url(#vig)" />

        {/* ══ UI READABILITY OVERLAY ══════════════════════════════════════ */}
        <rect width="1440" height="900" fill="#000000" opacity="0.38" />

        {/* ══ DYNAMIC AMBIENT TINT ════════════════════════════════════════ */}
        <rect width="1440" height="900"
          fill={ambient.color}
          opacity={ambient.opacity}
          style={{ transition: 'opacity 0.8s ease, fill 0.8s ease' }}
        />
      </svg>
    </div>
  );
}
