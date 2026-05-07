'use client';
import { useId } from 'react';
import { SymbolId } from '@/types/game';

type P = { s: number; u: string };

/* ── CẬU VÀNG — Vietnamese golden dog (side profile) ── */
/* ── CẬU VÀNG — Vietnamese golden dog, friendly front portrait ── */
function DogIcon({ s, u }: P) {
  return (
    <svg width={s} height={s} viewBox="-3 -3 106 106" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`${u}bg`} cx="50%" cy="54%" r="52%">
          <stop offset="0%"   stopColor="#FFA000" stopOpacity="0.5"/>
          <stop offset="100%" stopColor="#2A0800" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id={`${u}fc`} cx="36%" cy="26%" r="72%">
          <stop offset="0%"  stopColor="#FFD070"/>
          <stop offset="42%" stopColor="#C87838"/>
          <stop offset="100%" stopColor="#7B3A10"/>
        </radialGradient>
        <radialGradient id={`${u}ei`} cx="35%" cy="28%" r="68%">
          <stop offset="0%"  stopColor="#F5A868"/>
          <stop offset="60%" stopColor="#C05030"/>
          <stop offset="100%" stopColor="#6B1808"/>
        </radialGradient>
        <radialGradient id={`${u}mz`} cx="35%" cy="28%" r="65%">
          <stop offset="0%"  stopColor="#FFF8E0"/>
          <stop offset="50%" stopColor="#F0D888"/>
          <stop offset="100%" stopColor="#C09050"/>
        </radialGradient>
        <radialGradient id={`${u}ey`} cx="28%" cy="24%" r="60%">
          <stop offset="0%"  stopColor="#CC8820"/>
          <stop offset="42%" stopColor="#884400"/>
          <stop offset="100%" stopColor="#2A0800"/>
        </radialGradient>
      </defs>

      {/* Warm glow background */}
      <circle cx="50" cy="50" r="49" fill={`url(#${u}bg)`}/>

      {/* ── LEFT EAR — upright, pointed (Vietnamese dog characteristic) ── */}
      <path d="M24,46 Q18,26 27,12 Q36,22 38,42 Z" fill={`url(#${u}fc)`}/>
      <path d="M26,45 Q21,28 28,15 Q34,24 36,41 Z" fill={`url(#${u}ei)`} opacity="0.8"/>

      {/* ── RIGHT EAR — upright, pointed ── */}
      <path d="M76,46 Q82,26 73,12 Q64,22 62,42 Z" fill={`url(#${u}fc)`}/>
      <path d="M74,45 Q79,28 72,15 Q66,24 64,41 Z" fill={`url(#${u}ei)`} opacity="0.8"/>

      {/* ── HEAD — rounded, compact ── */}
      <ellipse cx="50" cy="54" rx="31" ry="28" fill={`url(#${u}fc)`}/>

      {/* ── MUZZLE — forward-facing, compact ── */}
      <ellipse cx="50" cy="66" rx="16" ry="12" fill={`url(#${u}mz)`}/>

      {/* Brow ridges — relaxed, friendly */}
      <path d="M26,48 Q36,43 45,46" stroke="#8B4010" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.45"/>
      <path d="M55,46 Q64,43 74,48" stroke="#8B4010" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.45"/>

      {/* ── LEFT EYE — big, warm amber ── */}
      <circle cx="37" cy="52" r="9"   fill="#CC6010" opacity="0.25"/>
      <ellipse cx="37" cy="52" rx="8" ry="7.5" fill={`url(#${u}ey)`}/>
      <ellipse cx="37" cy="52" rx="5" ry="5.5" fill="#0A0200"/>
      <circle cx="39.5" cy="49.5" r="2.8" fill="white" opacity="0.92"/>
      <circle cx="41"   cy="48.5" r="1.1" fill="white" opacity="0.55"/>

      {/* ── RIGHT EYE ── */}
      <circle cx="63" cy="52" r="9"   fill="#CC6010" opacity="0.25"/>
      <ellipse cx="63" cy="52" rx="8" ry="7.5" fill={`url(#${u}ey)`}/>
      <ellipse cx="63" cy="52" rx="5" ry="5.5" fill="#0A0200"/>
      <circle cx="65.5" cy="49.5" r="2.8" fill="white" opacity="0.92"/>
      <circle cx="67"   cy="48.5" r="1.1" fill="white" opacity="0.55"/>

      {/* ── NOSE ── */}
      <ellipse cx="50" cy="65" rx="8" ry="5.5" fill="#1A0800"/>
      <ellipse cx="47" cy="63.5" rx="2.2" ry="1.3" fill="white" opacity="0.22"/>

      {/* ── FRIENDLY SMILE + TONGUE — key for friendly look ── */}
      <path d="M38,71 Q50,78 62,71" stroke="#7B3010" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
      <path d="M43,72 Q50,70 57,72 Q57,82 53,85 Q50,87 47,85 Q43,82 43,72Z" fill="#E91E63"/>
      <path d="M50,72 Q50,82 50,85" stroke="#C2185B" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
      <ellipse cx="46" cy="77" rx="2.8" ry="4.5" fill="white" opacity="0.2"/>

      {/* Cheek blush — friendly & cute */}
      <ellipse cx="27" cy="62" rx="7" ry="4" fill="#FF7040" opacity="0.18"/>
      <ellipse cx="73" cy="62" rx="7" ry="4" fill="#FF7040" opacity="0.18"/>

      {/* Head specular */}
      <ellipse cx="37" cy="30" rx="11" ry="5" fill="white" opacity="0.11" transform="rotate(-18 37 30)"/>
    </svg>
  );
}

/* ── PHOENIX ─────────────────────────────────────────────────────────────── */
function PhoenixIcon({ s, u }: P) {
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`${u}bg`} cx="50%" cy="60%" r="52%">
          <stop offset="0%" stopColor="#FFD700" stopOpacity="0.45"/>
          <stop offset="100%" stopColor="#FF8C00" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id={`${u}wg`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF0A0"/>
          <stop offset="40%" stopColor="#FF8C00"/>
          <stop offset="100%" stopColor="#CC3300"/>
        </linearGradient>
        <linearGradient id={`${u}bg2`} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#FFD700"/>
          <stop offset="100%" stopColor="#FF5500"/>
        </linearGradient>
        <radialGradient id={`${u}hd`} cx="38%" cy="32%" r="58%">
          <stop offset="0%" stopColor="#FFEE88"/>
          <stop offset="100%" stopColor="#CC5500"/>
        </radialGradient>
      </defs>
      <circle cx="50" cy="52" r="45" fill={`url(#${u}bg)`}/>
      {/* Left wing upper */}
      <path d="M50,50 Q32,35 10,28 Q16,42 22,50 Q30,55 50,52Z" fill={`url(#${u}wg)`}/>
      {/* Left feather detail */}
      <path d="M10,28 Q14,38 22,44" stroke="#FFF0A0" strokeWidth="1.3" fill="none" opacity="0.65"/>
      <path d="M15,27 Q19,38 26,43" stroke="#FFF0A0" strokeWidth="1.3" fill="none" opacity="0.65"/>
      <path d="M21,27 Q24,37 30,43" stroke="#FFF0A0" strokeWidth="1" fill="none" opacity="0.5"/>
      {/* Right wing upper */}
      <path d="M50,50 Q68,35 90,28 Q84,42 78,50 Q70,55 50,52Z" fill={`url(#${u}wg)`}/>
      {/* Right feather detail */}
      <path d="M90,28 Q86,38 78,44" stroke="#FFF0A0" strokeWidth="1.3" fill="none" opacity="0.65"/>
      <path d="M85,27 Q81,38 74,43" stroke="#FFF0A0" strokeWidth="1.3" fill="none" opacity="0.65"/>
      <path d="M79,27 Q76,37 70,43" stroke="#FFF0A0" strokeWidth="1" fill="none" opacity="0.5"/>
      {/* Body */}
      <ellipse cx="50" cy="52" rx="10" ry="14" fill={`url(#${u}bg2)`}/>
      {/* Tail feathers */}
      <path d="M46,63 Q40,76 35,90" stroke="#FF8C00" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
      <path d="M50,65 Q50,79 50,94" stroke="#FFD700" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
      <path d="M54,63 Q60,76 65,90" stroke="#FF8C00" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
      <path d="M43,64 Q36,79 29,88" stroke="#CC3300" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.7"/>
      <path d="M57,64 Q64,79 71,88" stroke="#CC3300" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.7"/>
      {/* Head */}
      <ellipse cx="50" cy="37" rx="10" ry="10" fill={`url(#${u}hd)`}/>
      {/* Crown */}
      <path d="M44,28 Q42,20 45,14" stroke="#FFD700" strokeWidth="2.8" strokeLinecap="round" fill="none"/>
      <path d="M50,27 Q50,19 50,13" stroke="#FFF0A0" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M56,28 Q58,20 55,14" stroke="#FFD700" strokeWidth="2.8" strokeLinecap="round" fill="none"/>
      <circle cx="45" cy="14" r="2.5" fill="#FF3300"/>
      <circle cx="50" cy="13" r="2.5" fill="#FF3300"/>
      <circle cx="55" cy="14" r="2.5" fill="#FF3300"/>
      {/* Beak */}
      <path d="M50,43 L55,47 L50,48 Z" fill="#B8860B"/>
      {/* Eye */}
      <circle cx="46" cy="36" r="3.5" fill="#111"/>
      <circle cx="47" cy="35" r="1.3" fill="white"/>
      {/* Head highlight */}
      <ellipse cx="45" cy="33" rx="5" ry="3.5" fill="white" opacity="0.22"/>
    </svg>
  );
}

/* ── LOTUS (BÔNG SEN) ────────────────────────────────────────────────────── */
function LotusIcon({ s, u }: P) {
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`${u}bg`} cx="50%" cy="60%" r="52%">
          <stop offset="0%" stopColor="#FF69B4" stopOpacity="0.45"/>
          <stop offset="100%" stopColor="#FF1493" stopOpacity="0"/>
        </radialGradient>
        {/* Outer petals – light pink with deep base */}
        <linearGradient id={`${u}p1`} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#FFE4EE"/>
          <stop offset="40%" stopColor="#FFAECB"/>
          <stop offset="100%" stopColor="#C2185B"/>
        </linearGradient>
        {/* Mid petals */}
        <linearGradient id={`${u}p2`} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#FFF0F5"/>
          <stop offset="50%" stopColor="#FF80AB"/>
          <stop offset="100%" stopColor="#AD1457"/>
        </linearGradient>
        {/* Inner petals */}
        <linearGradient id={`${u}p3`} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF"/>
          <stop offset="60%" stopColor="#FFCCE0"/>
          <stop offset="100%" stopColor="#F06292"/>
        </linearGradient>
        {/* Gold center */}
        <radialGradient id={`${u}ct`} cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#FFFDE7"/>
          <stop offset="40%" stopColor="#FFD700"/>
          <stop offset="100%" stopColor="#B8860B"/>
        </radialGradient>
        {/* Water */}
        <linearGradient id={`${u}wt`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1565C0" stopOpacity="0.45"/>
          <stop offset="100%" stopColor="#0D47A1" stopOpacity="0.2"/>
        </linearGradient>
      </defs>

      <circle cx="50" cy="52" r="46" fill={`url(#${u}bg)`}/>

      {/* Water surface */}
      <ellipse cx="50" cy="82" rx="34" ry="9" fill={`url(#${u}wt)`}/>
      <ellipse cx="50" cy="82" rx="30" ry="6" fill="#1565C0" opacity="0.15"/>
      {/* Water ripple lines */}
      <ellipse cx="50" cy="83" rx="20" ry="3" fill="none" stroke="#42A5F5" strokeWidth="0.7" opacity="0.5"/>
      <ellipse cx="50" cy="83" rx="28" ry="5" fill="none" stroke="#42A5F5" strokeWidth="0.5" opacity="0.35"/>

      {/* ── Outer petals (5 large) ── */}
      {[-72, -36, 0, 36, 72].map((r, i) => (
        <ellipse key={i} cx="50" cy="27" rx="9.5" ry="23" fill={`url(#${u}p1)`}
                 transform={`rotate(${r} 50 56)`} opacity="0.95"/>
      ))}
      {/* Outer petal mid-vein */}
      {[-72, -36, 0, 36, 72].map((r, i) => (
        <line key={i}
          x1="50" y1="30" x2="50" y2="52"
          stroke="#C2185B" strokeWidth="0.7" opacity="0.3"
          transform={`rotate(${r} 50 56)`}/>
      ))}

      {/* ── Middle petals (5, offset) ── */}
      {[-54, -18, 18, 54, 90].map((r, i) => (
        <ellipse key={i} cx="50" cy="30" rx="8" ry="19" fill={`url(#${u}p2)`}
                 transform={`rotate(${r} 50 56)`} opacity="0.9"/>
      ))}

      {/* ── Inner upright petals (4) ── */}
      {[-20, 10, 40, -50].map((r, i) => (
        <ellipse key={i} cx="50" cy="36" rx="6.5" ry="14" fill={`url(#${u}p3)`}
                 transform={`rotate(${r} 50 56)`}/>
      ))}

      {/* ── Golden center ── */}
      <circle cx="50" cy="56" r="14" fill={`url(#${u}ct)`}/>
      {/* Stamen dots ring */}
      {Array.from({length: 10}, (_, i) => {
        const ang = (i / 10) * Math.PI * 2;
        return <circle key={i}
          cx={50 + Math.cos(ang) * 9} cy={56 + Math.sin(ang) * 9}
          r="1.6" fill="#B8860B"/>;
      })}
      {/* Center sphere highlight */}
      <circle cx="50" cy="56" r="6" fill="#FFF9C4" opacity="0.75"/>
      <circle cx="47" cy="53" r="2.5" fill="white" opacity="0.5"/>

      {/* Petal top highlights */}
      <ellipse cx="50" cy="33" rx="3" ry="8" fill="white" opacity="0.2"/>
    </svg>
  );
}

/* ── LANTERN ─────────────────────────────────────────────────────────────── */
function LanternIcon({ s, u }: P) {
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`${u}bg`} cx="50%" cy="65%" r="55%">
          <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.55"/>
          <stop offset="100%" stopColor="#FF6B00" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id={`${u}bn`} cx="33%" cy="25%" r="72%">
          <stop offset="0%" stopColor="#FF9050"/>
          <stop offset="50%" stopColor="#CC1800"/>
          <stop offset="100%" stopColor="#700000"/>
        </radialGradient>
        <linearGradient id={`${u}gd`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7B5F00"/>
          <stop offset="30%" stopColor="#FFD700"/>
          <stop offset="70%" stopColor="#FFD700"/>
          <stop offset="100%" stopColor="#7B5F00"/>
        </linearGradient>
        <radialGradient id={`${u}gl`} cx="50%" cy="90%" r="55%">
          <stop offset="0%" stopColor="#FFEE58" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#FF8C00" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="50" cy="55" r="44" fill={`url(#${u}bg)`}/>
      {/* Hanging string */}
      <line x1="50" y1="5" x2="50" y2="14" stroke="#B8860B" strokeWidth="2.5"/>
      {/* Top cap */}
      <rect x="36" y="14" width="28" height="7" rx="3" fill={`url(#${u}gd)`}/>
      {/* Lantern body */}
      <path d="M32,21 Q16,40 16,57 Q16,74 32,84 L68,84 Q84,74 84,57 Q84,40 68,21 Z"
            fill={`url(#${u}bn)`}/>
      {/* Rib lines */}
      <path d="M18,42 Q50,38 82,42" stroke="#AA1400" strokeWidth="1.8" fill="none" opacity="0.7"/>
      <path d="M16,57 Q50,53 84,57" stroke="#AA1400" strokeWidth="1.8" fill="none" opacity="0.7"/>
      <path d="M20,72 Q50,68 80,72" stroke="#AA1400" strokeWidth="1.8" fill="none" opacity="0.7"/>
      {/* Gold ring accents */}
      <path d="M32,21 Q50,19 68,21" stroke={`url(#${u}gd)`} strokeWidth="3" fill="none"/>
      <path d="M18,42 Q50,40 82,42" stroke={`url(#${u}gd)`} strokeWidth="2.2" fill="none"/>
      <path d="M16,57 Q50,55 84,57" stroke={`url(#${u}gd)`} strokeWidth="2.2" fill="none"/>
      <path d="M20,72 Q50,70 80,72" stroke={`url(#${u}gd)`} strokeWidth="2.2" fill="none"/>
      <path d="M32,84 Q50,86 68,84" stroke={`url(#${u}gd)`} strokeWidth="3" fill="none"/>
      {/* Bottom cap */}
      <rect x="36" y="84" width="28" height="7" rx="3" fill={`url(#${u}gd)`}/>
      {/* Tassels */}
      <line x1="43" y1="91" x2="41" y2="99" stroke="#CC1800" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="50" y1="91" x2="50" y2="100" stroke="#CC1800" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="57" y1="91" x2="59" y2="99" stroke="#CC1800" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Inner glow warmth */}
      <ellipse cx="50" cy="74" rx="24" ry="14" fill={`url(#${u}gl)`}/>
      {/* Chinese luck character */}
      <text x="50" y="62" textAnchor="middle" fontFamily="serif" fontSize="24"
            fontWeight="bold" fill="#FFD700" opacity="0.75">福</text>
      {/* Glass highlight */}
      <ellipse cx="37" cy="34" rx="7" ry="16" fill="white" opacity="0.12" transform="rotate(-8 37 34)"/>
    </svg>
  );
}

/* ── BAMBOO ──────────────────────────────────────────────────────────────── */
function BambooIcon({ s, u }: P) {
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`${u}bg`} cx="50%" cy="50%" r="52%">
          <stop offset="0%" stopColor="#4CAF50" stopOpacity="0.28"/>
          <stop offset="100%" stopColor="#1B5E20" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id={`${u}s1`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#1B5E20"/>
          <stop offset="26%"  stopColor="#4CAF50"/>
          <stop offset="56%"  stopColor="#388E3C"/>
          <stop offset="100%" stopColor="#1B5E20"/>
        </linearGradient>
        <linearGradient id={`${u}s2`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#2E7D32"/>
          <stop offset="28%"  stopColor="#66BB6A"/>
          <stop offset="58%"  stopColor="#43A047"/>
          <stop offset="100%" stopColor="#2E7D32"/>
        </linearGradient>
        <linearGradient id={`${u}nd`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#003300"/>
          <stop offset="45%"  stopColor="#2E7D32"/>
          <stop offset="100%" stopColor="#003300"/>
        </linearGradient>
        <linearGradient id={`${u}gl`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#7B5F00"/>
          <stop offset="50%"  stopColor="#FFD700"/>
          <stop offset="100%" stopColor="#7B5F00"/>
        </linearGradient>
      </defs>

      {/* Background glow */}
      <circle cx="50" cy="50" r="46" fill={`url(#${u}bg)`}/>

      {/* ── Left stalk ── */}
      <rect x="14" y="12" width="18" height="80" rx="9" fill={`url(#${u}s1)`}/>
      {[33, 55, 75].map(y => (
        <rect key={y} x="14" y={y} width="18" height="5" rx="2.5" fill={`url(#${u}nd)`}/>
      ))}
      <rect x="16" y="12" width="5" height="80" rx="2.5" fill="white" opacity="0.14"/>
      {/* Gold tip cap */}
      <rect x="14" y="88" width="18" height="4" rx="2" fill={`url(#${u}gl)`} opacity="0.75"/>

      {/* ── Centre stalk (tallest) ── */}
      <rect x="41" y="4" width="18" height="92" rx="9" fill={`url(#${u}s2)`}/>
      {[24, 46, 68, 88].map(y => (
        <rect key={y} x="41" y={y} width="18" height="5" rx="2.5" fill={`url(#${u}nd)`}/>
      ))}
      <rect x="43" y="4" width="5" height="92" rx="2.5" fill="white" opacity="0.14"/>
      {/* Gold tip cap */}
      <rect x="41" y="92" width="18" height="4" rx="2" fill={`url(#${u}gl)`} opacity="0.75"/>

      {/* ── Right stalk ── */}
      <rect x="68" y="16" width="18" height="76" rx="9" fill={`url(#${u}s1)`}/>
      {[38, 58, 76].map(y => (
        <rect key={y} x="68" y={y} width="18" height="5" rx="2.5" fill={`url(#${u}nd)`}/>
      ))}
      <rect x="70" y="16" width="5" height="76" rx="2.5" fill="white" opacity="0.14"/>
      {/* Gold tip cap */}
      <rect x="68" y="88" width="18" height="4" rx="2" fill={`url(#${u}gl)`} opacity="0.75"/>

      {/* ── Leaves ── */}
      {/* Left stalk → leaf right toward centre */}
      <path d="M32,33 Q48,24 52,34 Q44,39 32,33Z" fill="#2E7D32"/>
      <path d="M32,33 Q46,26 50,35 Q42,39 32,33Z" fill="#66BB6A" opacity="0.5"/>
      {/* Centre stalk → leaf left */}
      <path d="M41,46 Q26,37 20,47 Q30,53 41,46Z" fill="#388E3C"/>
      <path d="M41,46 Q28,39 22,48 Q32,54 41,46Z" fill="#81C784" opacity="0.45"/>
      {/* Centre stalk → leaf right */}
      <path d="M59,68 Q74,59 80,69 Q70,75 59,68Z" fill="#2E7D32"/>
      <path d="M59,68 Q72,62 77,71 Q68,75 59,68Z" fill="#66BB6A" opacity="0.45"/>
      {/* Right stalk → leaf left */}
      <path d="M68,38 Q52,30 46,40 Q57,46 68,38Z" fill="#388E3C"/>
    </svg>
  );
}

/* ── PHO BOWL ────────────────────────────────────────────────────────────── */
function PhoIcon({ s, u }: P) {
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`${u}bg`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFD700" stopOpacity="0.35"/>
          <stop offset="100%" stopColor="#FFD700" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id={`${u}bw`} cx="33%" cy="22%" r="72%">
          <stop offset="0%" stopColor="#FAFAFA"/>
          <stop offset="55%" stopColor="#E0E0E0"/>
          <stop offset="100%" stopColor="#9E9E9E"/>
        </radialGradient>
        <linearGradient id={`${u}rm`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#B8860B"/>
          <stop offset="40%" stopColor="#FFD700"/>
          <stop offset="60%" stopColor="#FFF176"/>
          <stop offset="100%" stopColor="#B8860B"/>
        </linearGradient>
        <radialGradient id={`${u}br`} cx="38%" cy="30%" r="62%">
          <stop offset="0%" stopColor="#FFCC80"/>
          <stop offset="100%" stopColor="#BF360C"/>
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill={`url(#${u}bg)`}/>
      {/* Bowl body */}
      <path d="M17,54 Q20,80 50,84 Q80,80 83,54 Z" fill={`url(#${u}bw)`}/>
      {/* Bowl outer rim */}
      <ellipse cx="50" cy="54" rx="33" ry="11" fill={`url(#${u}rm)`}/>
      {/* Broth surface */}
      <ellipse cx="50" cy="54" rx="30" ry="9" fill={`url(#${u}br)`}/>
      {/* Noodles */}
      <path d="M25,54 Q33,49 42,54 Q51,59 60,54 Q69,49 75,54" stroke="#FFF9C4" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M27,57 Q35,52 44,57 Q53,62 62,57 Q70,52 74,56" stroke="#FFF9C4" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.6"/>
      {/* Herb garnish */}
      <ellipse cx="37" cy="52" rx="5" ry="3" fill="#4CAF50" transform="rotate(-20 37 52)"/>
      <ellipse cx="63" cy="53" rx="4.5" ry="2.8" fill="#4CAF50" transform="rotate(18 63 53)"/>
      <ellipse cx="50" cy="50" rx="3" ry="2" fill="#FF7043"/>
      {/* Chopsticks */}
      <line x1="57" y1="18" x2="70" y2="52" stroke="#8D6E63" strokeWidth="3" strokeLinecap="round"/>
      <line x1="63" y1="18" x2="74" y2="52" stroke="#A1887F" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Steam wisps */}
      <path d="M33,46 Q30,38 33,29 Q36,20 33,12" stroke="white" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.4"/>
      <path d="M44,44 Q41,35 44,25 Q47,16 44,8" stroke="white" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.35"/>
      <path d="M55,45 Q52,36 55,26 Q58,17 55,10" stroke="white" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.38"/>
      {/* Rim highlight */}
      <ellipse cx="39" cy="52" rx="11" ry="4" fill="white" opacity="0.28" transform="rotate(-12 39 52)"/>
    </svg>
  );
}

/* ── RICE (BÔNG LÚA) — Vietnamese rice plant: green blades + single arching grain head ── */
function RiceIcon({ s, u }: P) {
  // Rachis quadratic bezier: starts at plant top, arches right then droops down
  const P0x = 44, P0y = 20;  // base of grain head (top of main stalk)
  const P1x = 86, P1y =  8;  // control — pulls the arc far right
  const P2x = 84, P2y = 76;  // bottom of drooping grain head
  // Sample positions along the rachis (t=0 is tip, t=1 is base)
  const samples = [0.06, 0.16, 0.28, 0.40, 0.52, 0.64, 0.76, 0.88];

  return (
    <svg width={s} height={s} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Soft green ambient */}
        <radialGradient id={`${u}bg`} cx="38%" cy="58%" r="54%">
          <stop offset="0%"   stopColor="#8BC34A" stopOpacity="0.28"/>
          <stop offset="100%" stopColor="#1B5E20" stopOpacity="0"/>
        </radialGradient>
        {/* Leaf blade — dark base to bright tip */}
        <linearGradient id={`${u}lf`} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%"   stopColor="#1B5E20"/>
          <stop offset="45%"  stopColor="#4CAF50"/>
          <stop offset="100%" stopColor="#C5E1A5"/>
        </linearGradient>
        {/* Grain — warm amber tan matching real bông lúa */}
        <linearGradient id={`${u}gr`} x1="0%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%"   stopColor="#F2E0A8"/>
          <stop offset="35%"  stopColor="#D4A530"/>
          <stop offset="75%"  stopColor="#A07020"/>
          <stop offset="100%" stopColor="#7A5010"/>
        </linearGradient>
        {/* Stalk / rachis */}
        <linearGradient id={`${u}rs`} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%"   stopColor="#5C3810"/>
          <stop offset="50%"  stopColor="#A07828"/>
          <stop offset="100%" stopColor="#C8A040"/>
        </linearGradient>
      </defs>

      {/* Ambient glow */}
      <circle cx="40" cy="56" r="46" fill={`url(#${u}bg)`}/>

      {/* ── Green leaf blades (back to front) ── */}
      <path d="M30,98 Q14,74 10,24"
            stroke={`url(#${u}lf)`} strokeWidth="5"   fill="none" strokeLinecap="round" opacity="0.6"/>
      <path d="M36,98 Q20,70 16,14"
            stroke={`url(#${u}lf)`} strokeWidth="6.5" fill="none" strokeLinecap="round"/>
      <path d="M42,98 Q30,68 28,14"
            stroke={`url(#${u}lf)`} strokeWidth="6"   fill="none" strokeLinecap="round"/>
      {/* Short side leaf curling left */}
      <path d="M28,90 Q8,80 4,70"
            stroke={`url(#${u}lf)`} strokeWidth="4.5" fill="none" strokeLinecap="round" opacity="0.68"/>
      {/* Midrib highlights on main blades */}
      <path d="M16,14 Q22,54 36,98"   stroke="#AED581" strokeWidth="1.4" fill="none" opacity="0.35"/>
      <path d="M28,14 Q32,56 42,98"   stroke="#AED581" strokeWidth="1.3" fill="none" opacity="0.30"/>

      {/* ── Main stalk up to grain head base ── */}
      <path d={`M40,96 Q40,64 ${P0x},${P0y}`}
            stroke={`url(#${u}rs)`} strokeWidth="3" fill="none" strokeLinecap="round"/>

      {/* ── Grain head rachis ── */}
      <path d={`M${P0x},${P0y} Q${P1x},${P1y} ${P2x},${P2y}`}
            stroke={`url(#${u}rs)`} strokeWidth="2.2" fill="none" strokeLinecap="round"/>

      {/* ── Grain pairs: perpendicular ellipses sampled along the rachis bezier ── */}
      {samples.map((t, i) => {
        const mt = 1 - t;
        // Bezier point
        const bx = mt*mt*P0x + 2*mt*t*P1x + t*t*P2x;
        const by = mt*mt*P0y + 2*mt*t*P1y + t*t*P2y;
        // Bezier tangent (derivative)
        const tx2 = 2*mt*(P1x - P0x) + 2*t*(P2x - P1x);
        const ty2 = 2*mt*(P1y - P0y) + 2*t*(P2y - P1y);
        const tlen = Math.sqrt(tx2*tx2 + ty2*ty2) || 1;
        const tdx = tx2 / tlen;
        const tdy = ty2 / tlen;
        // Perpendicular unit vectors (both sides of rachis)
        const p1dx = -tdy, p1dy =  tdx;  // "left"  of travel
        const p2dx =  tdy, p2dy = -tdx;  // "right" of travel
        // Rotation angle: align grain long-axis with perpendicular direction
        const ang = Math.atan2(-tdy, tdx) * 180 / Math.PI;
        // Size: smallest at tip (t=0), peaks around t=0.45, tapers at base
        const sz = 0.55 + 0.47 * Math.sin(t * Math.PI * 0.93);
        const gw = 4.4 * sz;
        const gh = 9.2 * sz;
        const sp = 6.5;  // spread from rachis center
        const g1x = bx + p1dx*sp, g1y = by + p1dy*sp;
        const g2x = bx + p2dx*sp, g2y = by + p2dy*sp;
        return (
          <g key={i}>
            <ellipse cx={g1x} cy={g1y} rx={gw} ry={gh}
                     fill={`url(#${u}gr)`}
                     transform={`rotate(${ang} ${g1x} ${g1y})`}/>
            <ellipse cx={g2x} cy={g2y} rx={gw} ry={gh}
                     fill={`url(#${u}gr)`}
                     transform={`rotate(${ang} ${g2x} ${g2y})`}/>
          </g>
        );
      })}

      {/* Tip grain at top of rachis */}
      <ellipse cx={P0x + 2} cy={P0y - 5} rx="2.4" ry="5.5"
               fill={`url(#${u}gr)`} transform={`rotate(20 ${P0x + 2} ${P0y - 5})`}/>
    </svg>
  );
}

/* ── TRẺ CHĂN TRÂU (WILD) — Vietnamese buffalo boy portrait ─────────────── */
function WildIcon({ s, u }: P) {
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Warm sunset sky */}
        <radialGradient id={`${u}fg`} cx="50%" cy="38%" r="65%">
          <stop offset="0%"   stopColor="#FFD060" stopOpacity="0.9"/>
          <stop offset="40%"  stopColor="#FF8C00" stopOpacity="0.85"/>
          <stop offset="80%"  stopColor="#CC3300" stopOpacity="0.7"/>
          <stop offset="100%" stopColor="#4A1000" stopOpacity="0"/>
        </radialGradient>
        {/* Hat — warm straw/bamboo weave */}
        <linearGradient id={`${u}ht`} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%"   stopColor="#FFFACD"/>
          <stop offset="35%"  stopColor="#EDD580"/>
          <stop offset="75%"  stopColor="#C49A3C"/>
          <stop offset="100%" stopColor="#8B6510"/>
        </linearGradient>
        {/* Hat underside shadow */}
        <linearGradient id={`${u}hu`} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%"   stopColor="#7B5010"/>
          <stop offset="100%" stopColor="#3A2008"/>
        </linearGradient>
        {/* Skin — warm Vietnamese tan with depth */}
        <radialGradient id={`${u}sk`} cx="40%" cy="30%" r="70%">
          <stop offset="0%"   stopColor="#FFCC99"/>
          <stop offset="35%"  stopColor="#D4916A"/>
          <stop offset="70%"  stopColor="#A86040"/>
          <stop offset="100%" stopColor="#6B3520"/>
        </radialGradient>
        {/* Face shadow sides */}
        <radialGradient id={`${u}sh`} cx="50%" cy="50%" r="50%">
          <stop offset="60%"  stopColor="#A86040" stopOpacity="0"/>
          <stop offset="100%" stopColor="#5A2810" stopOpacity="0.7"/>
        </radialGradient>
        {/* Eyes — deep dark brown */}
        <radialGradient id={`${u}ey`} cx="30%" cy="28%" r="60%">
          <stop offset="0%"   stopColor="#6B3820"/>
          <stop offset="45%"  stopColor="#2A1008"/>
          <stop offset="100%" stopColor="#080200"/>
        </radialGradient>
        {/* Clothing — traditional áo bà ba indigo */}
        <linearGradient id={`${u}cl`} x1="30%" y1="0%" x2="70%" y2="100%">
          <stop offset="0%"   stopColor="#5B8FD0"/>
          <stop offset="40%"  stopColor="#2C5FA0"/>
          <stop offset="100%" stopColor="#0E2B60"/>
        </linearGradient>
        {/* WILD badge */}
        <linearGradient id={`${u}wb`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#5A2800"/>
          <stop offset="50%"  stopColor="#CC6600"/>
          <stop offset="100%" stopColor="#5A2800"/>
        </linearGradient>
      </defs>

      {/* ── Full-frame sunset background ── */}
      <rect x="0" y="0" width="100" height="100" fill="#2A1000"/>
      {/* Sky gradient */}
      <circle cx="50" cy="30" r="72" fill={`url(#${u}fg)`}/>
      {/* Sun disc */}
      <circle cx="50" cy="22" r="12" fill="#FFE040" opacity="0.35"/>
      {/* Horizon light rays */}
      {[0,25,50,75,100].map((x,i) => (
        <line key={i} x1={x} y1={72} x2="50" y2="22"
              stroke="#FF9900" strokeWidth="1" opacity="0.08"/>
      ))}
      {/* Rice paddy ground */}
      <path d="M0,80 Q50,75 100,80 L100,100 L0,100Z" fill="#1A4010"/>
      <path d="M0,84 Q50,79 100,84 L100,100 L0,100Z" fill="#0E2808"/>
      {/* Rice stalks silhouette */}
      {[8,16,24,32,42,52,62,72,82,91].map((x,i) => (
        <path key={i}
          d={`M${x},100 Q${x + (i%2===0 ? -3 : 3)},88 ${x + (i%2===0 ? -5 : 5)},82`}
          stroke="#3A6A20" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7"/>
      ))}
      {/* Water reflection shimmer */}
      <ellipse cx="50" cy="85" rx="45" ry="8" fill="#3A7030" opacity="0.4"/>
      <ellipse cx="30" cy="87" rx="12" ry="2" fill="#FF8800" opacity="0.15"/>
      <ellipse cx="70" cy="87" rx="12" ry="2" fill="#FF8800" opacity="0.15"/>

      {/* ── NÓN LÁ — Vietnamese conical hat (the hero element) ── */}
      {/* Hat cone body */}
      <path d="M15,44 Q32,22 50,4 Q68,22 85,44 Z"
            fill={`url(#${u}ht)`}/>
      {/* Hat shadow on left side */}
      <path d="M15,44 Q32,22 50,4 Q38,20 28,36 Z"
            fill="#7B5010" opacity="0.3"/>
      {/* Bamboo rib lines radiating from tip */}
      <path d="M50,4 Q44,14 36,26" stroke="#A07820" strokeWidth="0.8" fill="none" opacity="0.45"/>
      <path d="M50,4 Q48,16 44,28" stroke="#A07820" strokeWidth="0.8" fill="none" opacity="0.45"/>
      <path d="M50,4 Q50,16 50,28" stroke="#A07820" strokeWidth="0.9" fill="none" opacity="0.5"/>
      <path d="M50,4 Q52,16 56,28" stroke="#A07820" strokeWidth="0.8" fill="none" opacity="0.45"/>
      <path d="M50,4 Q56,14 64,26" stroke="#A07820" strokeWidth="0.8" fill="none" opacity="0.45"/>
      <path d="M50,4 Q40,18 28,34" stroke="#8B6810" strokeWidth="0.7" fill="none" opacity="0.35"/>
      <path d="M50,4 Q60,18 72,34" stroke="#8B6810" strokeWidth="0.7" fill="none" opacity="0.35"/>
      {/* Concentric ring hints on hat surface */}
      <path d="M32,22 Q50,18 68,22" stroke="#C4A040" strokeWidth="0.6" fill="none" opacity="0.4"/>
      <path d="M22,32 Q50,27 78,32" stroke="#C4A040" strokeWidth="0.6" fill="none" opacity="0.35"/>
      {/* Hat brim — the wide rim */}
      <ellipse cx="50" cy="44" rx="35" ry="7" fill={`url(#${u}hu)`}/>
      {/* Brim top highlight edge */}
      <path d="M15,43 Q50,39 85,43" stroke="#EDD580" strokeWidth="1.5" fill="none" opacity="0.7"/>
      {/* Under-brim shadow on face */}
      <ellipse cx="50" cy="46" rx="28" ry="5" fill="#3A1A00" opacity="0.4"/>
      {/* Hat chin-tie strings */}
      <path d="M28,44 Q34,52 38,58" stroke="#D4A040" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.7"/>
      <path d="M72,44 Q66,52 62,58" stroke="#D4A040" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.7"/>

      {/* ── Hair — visible below hat brim ── */}
      <path d="M28,46 Q32,54 30,60" stroke="#100600" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
      <path d="M72,46 Q68,54 70,60" stroke="#100600" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
      <path d="M30,46 Q34,52 32,58" stroke="#1A0A00" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.7"/>
      <path d="M70,46 Q66,52 68,58" stroke="#1A0A00" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.7"/>

      {/* ── Face ── */}
      {/* Ears */}
      <ellipse cx="31" cy="60" rx="4" ry="5.5" fill={`url(#${u}sk)`}/>
      <ellipse cx="69" cy="60" rx="4" ry="5.5" fill={`url(#${u}sk)`}/>
      <ellipse cx="31" cy="60" rx="2.2" ry="3.2" fill="#C47050" opacity="0.45"/>
      <ellipse cx="69" cy="60" rx="2.2" ry="3.2" fill="#C47050" opacity="0.45"/>
      {/* Head */}
      <ellipse cx="50" cy="60" rx="18" ry="17" fill={`url(#${u}sk)`}/>
      {/* Face depth / side shadows */}
      <ellipse cx="50" cy="60" rx="18" ry="17" fill={`url(#${u}sh)`}/>
      {/* Forehead shadow from hat */}
      <ellipse cx="50" cy="50" rx="16" ry="7" fill="#3A1A00" opacity="0.3"/>

      {/* ── Eyebrows — strong, youthful ── */}
      <path d="M36,54 Q42,51 48,53" stroke="#200C00" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
      <path d="M52,53 Q58,51 64,54" stroke="#200C00" strokeWidth="2.2" fill="none" strokeLinecap="round"/>

      {/* ── Eyes — expressive Vietnamese eyes ── */}
      {/* Eye whites */}
      <ellipse cx="41" cy="58" rx="6.5" ry="5.5" fill="#F5EDE0"/>
      <ellipse cx="59" cy="58" rx="6.5" ry="5.5" fill="#F5EDE0"/>
      {/* Irises */}
      <ellipse cx="41" cy="58" rx="4.5" ry="4.8" fill={`url(#${u}ey)`}/>
      <ellipse cx="59" cy="58" rx="4.5" ry="4.8" fill={`url(#${u}ey)`}/>
      {/* Pupils */}
      <ellipse cx="41" cy="58" rx="2.8" ry="3.2" fill="#050100"/>
      <ellipse cx="59" cy="58" rx="2.8" ry="3.2" fill="#050100"/>
      {/* Catchlights — make eyes feel alive */}
      <circle cx="43"   cy="56" r="1.6" fill="white" opacity="0.95"/>
      <circle cx="61"   cy="56" r="1.6" fill="white" opacity="0.95"/>
      <circle cx="44.2" cy="55" r="0.7" fill="white" opacity="0.55"/>
      <circle cx="62.2" cy="55" r="0.7" fill="white" opacity="0.55"/>
      {/* Upper eyelid crease */}
      <path d="M34.5,55 Q41,52.5 47.5,55" stroke="#200C00" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
      <path d="M52.5,55 Q59,52.5 65.5,55" stroke="#200C00" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
      {/* Lower lash line */}
      <path d="M35,61 Q41,63 47,61" stroke="#3A1800" strokeWidth="0.8" fill="none" opacity="0.5"/>
      <path d="M53,61 Q59,63 65,61" stroke="#3A1800" strokeWidth="0.8" fill="none" opacity="0.5"/>

      {/* ── Nose ── */}
      <path d="M46,64 Q50,67 54,64" stroke="#9A5030" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.7"/>
      <ellipse cx="46" cy="64" rx="2" ry="1.5" fill="#8A4020" opacity="0.4"/>
      <ellipse cx="54" cy="64" rx="2" ry="1.5" fill="#8A4020" opacity="0.4"/>

      {/* ── Mouth — innocent smile ── */}
      <path d="M42,69 Q50,74 58,69" stroke="#8A3820" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Lower lip */}
      <path d="M44,71 Q50,75 56,71" stroke="#C47060" strokeWidth="1.2" fill="none" opacity="0.5"/>
      {/* Cheek dimples / blush */}
      <ellipse cx="36" cy="67" rx="5" ry="3" fill="#FF7050" opacity="0.2"/>
      <ellipse cx="64" cy="67" rx="5" ry="3" fill="#FF7050" opacity="0.2"/>

      {/* ── Neck ── */}
      <path d="M40,76 L38,80 Q44,83 50,84 Q56,83 62,80 L60,76 Q56,77 50,77 Q44,77 40,76Z"
            fill={`url(#${u}sk)`}/>
      {/* Neck shadow */}
      <path d="M42,76 Q50,79 58,76" stroke="#7A3A18" strokeWidth="1" fill="none" opacity="0.4"/>

      {/* ── Áo bà ba (traditional shirt) ── */}
      <path d="M28,80 Q36,76 50,75 Q64,76 72,80 Q78,90 74,100 L26,100 Q22,90 28,80Z"
            fill={`url(#${u}cl)`}/>
      {/* Collar V-neck */}
      <path d="M42,76 Q50,80 58,76" stroke="#4488CC" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.8"/>
      {/* Shirt fold shading */}
      <path d="M36,80 Q36,90 34,100" stroke="#0E2B60" strokeWidth="1" fill="none" opacity="0.5"/>
      <path d="M64,80 Q64,90 66,100" stroke="#0E2B60" strokeWidth="1" fill="none" opacity="0.5"/>
      {/* Shirt highlight */}
      <ellipse cx="44" cy="82" rx="6" ry="8" fill="white" opacity="0.07" transform="rotate(-5 44 82)"/>

      {/* ── WILD badge ── */}
      <rect x="12" y="86" width="76" height="14" rx="4" fill="#1A0800" opacity="0.9"/>
      <rect x="13" y="87" width="74" height="12" rx="3" fill={`url(#${u}wb)`}/>
      <rect x="13" y="87" width="74" height="12" rx="3" fill="none" stroke="#FFD700" strokeWidth="0.8" opacity="0.6"/>
      <text x="50" y="96.5" textAnchor="middle" fontFamily="Arial Black,sans-serif" fontSize="11"
            fontWeight="900" fill="#FFE040" letterSpacing="2">WILD</text>

      {/* Hat tip glow highlight */}
      <ellipse cx="44" cy="12" rx="8" ry="3.5" fill="white" opacity="0.22" transform="rotate(-20 44 12)"/>
    </svg>
  );
}

/* ── TRỐNG ĐỒNG (SCATTER) — top surface view ─────────────────────────────── */
function ScatterIcon({ s, u }: P) {
  // 12-pointed star polygon (24 points alternating outer r=11 / inner r=5.5)
  const starPts = Array.from({ length: 24 }, (_, i) => {
    const ang = (i * 15 - 90) * Math.PI / 180;
    const r   = i % 2 === 0 ? 11 : 5.5;
    return `${(50 + r * Math.cos(ang)).toFixed(2)},${(50 + r * Math.sin(ang)).toFixed(2)}`;
  }).join(' ');

  return (
    <svg width={s} height={s} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`${u}bg`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#CD7F32" stopOpacity="0.6"/>
          <stop offset="100%" stopColor="#4A2800" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id={`${u}disc`} cx="42%" cy="38%" r="68%">
          <stop offset="0%" stopColor="#7A4A15"/>
          <stop offset="55%" stopColor="#4A2808"/>
          <stop offset="100%" stopColor="#1E0E00"/>
        </radialGradient>
        <radialGradient id={`${u}inner`} cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#6B3A12"/>
          <stop offset="100%" stopColor="#2E1500"/>
        </radialGradient>
        <radialGradient id={`${u}star`} cx="32%" cy="28%" r="68%">
          <stop offset="0%" stopColor="#FFF9C4"/>
          <stop offset="35%" stopColor="#FFD700"/>
          <stop offset="80%" stopColor="#CC8800"/>
          <stop offset="100%" stopColor="#8B5500"/>
        </radialGradient>
      </defs>

      {/* Ambient glow */}
      <circle cx="50" cy="50" r="47" fill={`url(#${u}bg)`}/>

      {/* Main disc face (top view) */}
      <circle cx="50" cy="50" r="44" fill={`url(#${u}disc)`}/>

      {/* ── Outermost ring ── */}
      <circle cx="50" cy="50" r="44" fill="none" stroke="#CD7F32" strokeWidth="2.8"/>
      <circle cx="50" cy="50" r="40.5" fill="none" stroke="#8B5010" strokeWidth="0.9"/>
      {/* Border dots (28 evenly spaced) */}
      {Array.from({ length: 28 }, (_, i) => {
        const a = (i / 28) * Math.PI * 2;
        return <circle key={i} cx={50 + 42.5 * Math.cos(a)} cy={50 + 42.5 * Math.sin(a)} r="1.4" fill="#CD7F32"/>;
      })}
      {/* Outer tick-marks (14) */}
      {Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2;
        return <line key={i}
          x1={50 + 40 * Math.cos(a)} y1={50 + 40 * Math.sin(a)}
          x2={50 + 37 * Math.cos(a)} y2={50 + 37 * Math.sin(a)}
          stroke="#CD7F32" strokeWidth="1.6"/>;
      })}

      {/* ── Outer bird ring (r ≈ 35.5, 8 flying herons) ── */}
      <circle cx="50" cy="50" r="38.5" fill="none" stroke="#CD7F32" strokeWidth="0.9" opacity="0.75"/>
      <circle cx="50" cy="50" r="32" fill="none" stroke="#8B5010" strokeWidth="0.8" opacity="0.75"/>
      {Array.from({ length: 8 }, (_, i) => {
        const a  = (i / 8) * Math.PI * 2;
        const bx = 50 + 35.3 * Math.cos(a);
        const by = 50 + 35.3 * Math.sin(a);
        const rot = (a * 180 / Math.PI) + 90;
        return (
          <g key={i} transform={`rotate(${rot} ${bx} ${by})`}>
            {/* Body */}
            <ellipse cx={bx} cy={by + 0.5} rx="3" ry="1.8" fill="#CD7F32"/>
            {/* Spread wings */}
            <path d={`M${bx - 5},${by} Q${bx - 2},${by - 3.5} ${bx},${by - 0.5}`} fill="#B8720A"/>
            <path d={`M${bx + 5},${by} Q${bx + 2},${by - 3.5} ${bx},${by - 0.5}`} fill="#B8720A"/>
            {/* Head */}
            <circle cx={bx} cy={by - 2.5} r="1.5" fill="#8B5010"/>
            {/* Long beak / neck */}
            <line x1={bx} y1={by - 4} x2={bx} y2={by - 7} stroke="#CD7F32" strokeWidth="1.2" strokeLinecap="round"/>
            {/* Tail */}
            <line x1={bx} y1={by + 2} x2={bx} y2={by + 5} stroke="#8B5010" strokeWidth="1.2" strokeLinecap="round"/>
          </g>
        );
      })}

      {/* ── Middle deer ring (r ≈ 27, 6 running deer) ── */}
      <circle cx="50" cy="50" r="31" fill="none" stroke="#CD7F32" strokeWidth="0.8" opacity="0.7"/>
      <circle cx="50" cy="50" r="23" fill="none" stroke="#8B5010" strokeWidth="0.7" opacity="0.7"/>
      {Array.from({ length: 6 }, (_, i) => {
        const a  = (i / 6) * Math.PI * 2 - Math.PI / 12;
        const dx = 50 + 27 * Math.cos(a);
        const dy = 50 + 27 * Math.sin(a);
        const rot = (a * 180 / Math.PI) + 90;
        return (
          <g key={i} transform={`rotate(${rot} ${dx} ${dy})`}>
            {/* Body */}
            <ellipse cx={dx} cy={dy + 1} rx="3.5" ry="2.2" fill="#CD7F32"/>
            {/* Neck + head */}
            <circle cx={dx} cy={dy - 2} r="2" fill="#A06010"/>
            <path d={`M${dx},${dy - 1} L${dx},${dy - 4}`} stroke="#A06010" strokeWidth="1.8"/>
            {/* Antlers */}
            <path d={`M${dx - 1},${dy - 3.5} Q${dx - 3.5},${dy - 6} ${dx - 5},${dy - 5}`}
                  stroke="#CD7F32" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
            <path d={`M${dx + 1},${dy - 3.5} Q${dx + 3.5},${dy - 6} ${dx + 5},${dy - 5}`}
                  stroke="#CD7F32" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
            {/* Legs (running pose) */}
            <line x1={dx - 2} y1={dy + 3} x2={dx - 3.5} y2={dy + 7} stroke="#CD7F32" strokeWidth="1" strokeLinecap="round"/>
            <line x1={dx + 2} y1={dy + 3} x2={dx + 3.5} y2={dy + 6} stroke="#CD7F32" strokeWidth="1" strokeLinecap="round"/>
            {/* Front legs angled */}
            <line x1={dx - 1} y1={dy + 3} x2={dx - 0.5} y2={dy + 7} stroke="#8B5010" strokeWidth="0.9" strokeLinecap="round"/>
            <line x1={dx + 1} y1={dy + 3} x2={dx + 2.5} y2={dy + 7} stroke="#8B5010" strokeWidth="0.9" strokeLinecap="round"/>
          </g>
        );
      })}

      {/* ── Inner geometric band (r 16–22, triangle teeth) ── */}
      <circle cx="50" cy="50" r="22" fill={`url(#${u}inner)`}/>
      <circle cx="50" cy="50" r="22" fill="none" stroke="#CD7F32" strokeWidth="1.1"/>
      <circle cx="50" cy="50" r="16.5" fill="none" stroke="#8B5010" strokeWidth="0.8"/>
      {/* Inward-pointing triangles */}
      {Array.from({ length: 16 }, (_, i) => {
        const a1 = (i / 16) * Math.PI * 2;
        const a2 = ((i + 0.5) / 16) * Math.PI * 2;
        const ro = 21.5, ri = 17;
        const x1 = 50 + ro * Math.cos(a1); const y1 = 50 + ro * Math.sin(a1);
        const x2 = 50 + ro * Math.cos(a2); const y2 = 50 + ro * Math.sin(a2);
        const am = a1 + (a2 - a1) / 2;
        const x3 = 50 + ri * Math.cos(am); const y3 = 50 + ri * Math.sin(am);
        return <polygon key={i} points={`${x1.toFixed(1)},${y1.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)} ${x3.toFixed(1)},${y3.toFixed(1)}`}
                        fill="#CD7F32" opacity="0.82"/>;
      })}

      {/* ── Center disc ── */}
      <circle cx="50" cy="50" r="15" fill="#1E0E00"/>
      <circle cx="50" cy="50" r="15" fill="none" stroke="#CD7F32" strokeWidth="1.3"/>

      {/* ── 12-pointed star ── */}
      <polygon points={starPts} fill={`url(#${u}star)`}/>
      {/* Star ray lines */}
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * 30 - 90) * Math.PI / 180;
        return <line key={i}
          x1={(50 + 5.5 * Math.cos(a)).toFixed(2)} y1={(50 + 5.5 * Math.sin(a)).toFixed(2)}
          x2={(50 + 10.5 * Math.cos(a)).toFixed(2)} y2={(50 + 10.5 * Math.sin(a)).toFixed(2)}
          stroke="#FFF9C4" strokeWidth="0.6" opacity="0.6"/>;
      })}

      {/* Center dot */}
      <circle cx="50" cy="50" r="3.8" fill="#FFD700" opacity="0.95"/>
      <circle cx="50" cy="50" r="2" fill="white" opacity="0.85"/>

      {/* Disc top-face highlight */}
      <ellipse cx="37" cy="37" rx="8.5" ry="5" fill="white" opacity="0.1" transform="rotate(-28 37 37)"/>

      {/* SCATTER label */}
      <rect x="26" y="82" width="48" height="14" rx="3" fill="#1E0E00" opacity="0.92"/>
      <text x="50" y="92" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="9"
            fontWeight="bold" fill="#FFD700" letterSpacing="0.5">SCATTER</text>
    </svg>
  );
}

/* ── TRÂU NƯỚC (NUGGET) — Vietnamese Water Buffalo, casino-grade emblem ───── */
/* ── TRÂU — Vietnamese water buffalo, portrait from reference photo ── */
function BuffaloIcon({ s, u }: { s: number; u: string }) {
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Golden square background */}
        <radialGradient id={`${u}bg`} cx="50%" cy="38%" r="72%">
          <stop offset="0%"   stopColor="#FFE84A"/>
          <stop offset="35%"  stopColor="#D4900C"/>
          <stop offset="70%"  stopColor="#8A5000"/>
          <stop offset="100%" stopColor="#3E1E00"/>
        </radialGradient>
        {/* Golden border shimmer */}
        <linearGradient id={`${u}bdr`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#FFF0A0"/>
          <stop offset="35%"  stopColor="#C87800"/>
          <stop offset="65%"  stopColor="#FFD040"/>
          <stop offset="100%" stopColor="#A05800"/>
        </linearGradient>
        {/* Skin — grey-brown like real water buffalo */}
        <radialGradient id={`${u}sk`} cx="40%" cy="30%" r="72%">
          <stop offset="0%"   stopColor="#AAA090"/>
          <stop offset="45%"  stopColor="#727060"/>
          <stop offset="100%" stopColor="#3C3028"/>
        </radialGradient>
        {/* Forehead — slightly lighter */}
        <radialGradient id={`${u}fh`} cx="42%" cy="36%" r="65%">
          <stop offset="0%"   stopColor="#C0B8A8"/>
          <stop offset="55%"  stopColor="#8A8070"/>
          <stop offset="100%" stopColor="#463C30"/>
        </radialGradient>
        {/* Horns — cream/tan, realistic */}
        <linearGradient id={`${u}hl`} x1="100%" y1="0%" x2="0%" y2="80%">
          <stop offset="0%"   stopColor="#EEE0A0"/>
          <stop offset="40%"  stopColor="#C8A858"/>
          <stop offset="100%" stopColor="#7A6030"/>
        </linearGradient>
        <linearGradient id={`${u}hr`} x1="0%" y1="0%" x2="100%" y2="80%">
          <stop offset="0%"   stopColor="#EEE0A0"/>
          <stop offset="40%"  stopColor="#C8A858"/>
          <stop offset="100%" stopColor="#7A6030"/>
        </linearGradient>
        {/* Eyes — dark brown, calm */}
        <radialGradient id={`${u}ey`} cx="30%" cy="28%" r="62%">
          <stop offset="0%"   stopColor="#4A3820"/>
          <stop offset="50%"  stopColor="#180A04"/>
          <stop offset="100%" stopColor="#050100"/>
        </radialGradient>
        {/* Nose — dark purplish grey */}
        <radialGradient id={`${u}ns`} cx="35%" cy="28%" r="65%">
          <stop offset="0%"   stopColor="#585068"/>
          <stop offset="50%"  stopColor="#281828"/>
          <stop offset="100%" stopColor="#0E0810"/>
        </radialGradient>
        {/* Ear inner */}
        <radialGradient id={`${u}ei`} cx="35%" cy="28%" r="65%">
          <stop offset="0%"   stopColor="#CC9898"/>
          <stop offset="60%"  stopColor="#805060"/>
          <stop offset="100%" stopColor="#483040"/>
        </radialGradient>
      </defs>

      {/* ── Golden square background ── */}
      <rect x="0" y="0" width="100" height="100" rx="10" fill={`url(#${u}bg)`}/>
      {/* Inner gold border frame */}
      <rect x="2.5" y="2.5" width="95" height="95" rx="8.5" fill="none"
            stroke={`url(#${u}bdr)`} strokeWidth="2.5" opacity="0.85"/>
      {/* Corner accent dots */}
      <circle cx="7"  cy="7"  r="2.5" fill="#FFD040" opacity="0.6"/>
      <circle cx="93" cy="7"  r="2.5" fill="#FFD040" opacity="0.6"/>
      <circle cx="7"  cy="93" r="2.5" fill="#FFD040" opacity="0.6"/>
      <circle cx="93" cy="93" r="2.5" fill="#FFD040" opacity="0.6"/>
      {/* Top glare sheen */}
      <rect x="5" y="5" width="90" height="30" rx="7" fill="white" opacity="0.07"/>
      {/* Bottom vignette to ground the buffalo */}
      <rect x="0" y="60" width="100" height="40" rx="10" fill="#3E1E00" opacity="0.35"/>

      {/* ── LEFT HORN — wide crescent, cream coloured ── */}
      <path d="M27,42 Q10,28 4,10 Q8,3 15,5 Q19,14 24,30 Q28,38 34,44 Z"
            fill={`url(#${u}hl)`}/>
      <path d="M27,42 Q10,28 4,10 Q8,3 15,5"
            stroke="#F0E4B0" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.55"/>
      {/* Horn shadow/depth */}
      <path d="M27,42 Q11,30 5,12 Q8,5 14,6 Q17,16 22,32 Q26,40 32,45 Z"
            fill="#3A2810" opacity="0.35"/>

      {/* ── RIGHT HORN — mirror ── */}
      <path d="M73,42 Q90,28 96,10 Q92,3 85,5 Q81,14 76,30 Q72,38 66,44 Z"
            fill={`url(#${u}hr)`}/>
      <path d="M73,42 Q90,28 96,10 Q92,3 85,5"
            stroke="#F0E4B0" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.55"/>
      <path d="M73,42 Q89,30 95,12 Q92,5 86,6 Q83,16 78,32 Q74,40 68,45 Z"
            fill="#3A2810" opacity="0.35"/>

      {/* ── EARS — medium, horizontal, slightly down-angled ── */}
      <ellipse cx="14" cy="54" rx="12" ry="9" fill={`url(#${u}sk)`} transform="rotate(-12 14 54)"/>
      <ellipse cx="14" cy="54" rx="7"  ry="5.5" fill={`url(#${u}ei)`} opacity="0.7" transform="rotate(-12 14 54)"/>
      <ellipse cx="86" cy="54" rx="12" ry="9" fill={`url(#${u}sk)`} transform="rotate(12 86 54)"/>
      <ellipse cx="86" cy="54" rx="7"  ry="5.5" fill={`url(#${u}ei)`} opacity="0.7" transform="rotate(12 86 54)"/>

      {/* ── HEAD — broad, rounded ── */}
      <ellipse cx="50" cy="62" rx="34" ry="28" fill={`url(#${u}sk)`}/>
      {/* Forehead dome — lighter patch */}
      <ellipse cx="50" cy="44" rx="24" ry="17" fill={`url(#${u}fh)`}/>
      {/* Brow ridge shadow */}
      <path d="M30,56 Q42,50 50,49 Q58,50 70,56"
            stroke="#2A2018" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.5"/>

      {/* ── ROPE HALTER — distinctive Vietnamese farm buffalo ── */}
      {/* Nose rope */}
      <path d="M24,66 Q50,60 76,66"
            stroke="#6B4418" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.9"/>
      <path d="M24,66 Q50,60 76,66"
            stroke="#A07840" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.45"/>
      {/* Forehead rope going up */}
      <path d="M36,60 Q43,48 50,44 Q57,48 64,60"
            stroke="#6B4418" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8"/>
      <path d="M36,60 Q43,48 50,44 Q57,48 64,60"
            stroke="#A07840" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.4"/>
      {/* Rope knot / wrap on forehead */}
      <ellipse cx="50" cy="44" rx="5" ry="3.5" fill="#5A3410" opacity="0.85"/>
      <ellipse cx="50" cy="44" rx="3" ry="2"   fill="#7A5020" opacity="0.7"/>
      {/* Tassel hanging from nose rope */}
      <path d="M28,66 Q24,75 24,82" stroke="#6B4418" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.7"/>
      <path d="M30,66 Q27,73 28,79" stroke="#9A6830" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.5"/>

      {/* ── EYES — dark, calm, large (buffalo characteristic) ── */}
      {/* Whites */}
      <ellipse cx="35" cy="60" rx="9.5" ry="8" fill="#E8E0D5"/>
      <ellipse cx="65" cy="60" rx="9.5" ry="8" fill="#E8E0D5"/>
      {/* Iris */}
      <ellipse cx="35" cy="61" rx="7.5" ry="7" fill={`url(#${u}ey)`}/>
      <ellipse cx="65" cy="61" rx="7.5" ry="7" fill={`url(#${u}ey)`}/>
      {/* Pupils */}
      <ellipse cx="35" cy="61" rx="4.5" ry="5" fill="#060100"/>
      <ellipse cx="65" cy="61" rx="4.5" ry="5" fill="#060100"/>
      {/* Catchlights */}
      <circle cx="37" cy="58" r="2.2" fill="white" opacity="0.85"/>
      <circle cx="67" cy="58" r="2.2" fill="white" opacity="0.85"/>
      {/* Droopy upper eyelid — gives calm, gentle expression */}
      <path d="M26,57 Q35,52 44,57" stroke="#2A1810" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.85"/>
      <path d="M56,57 Q65,52 74,57" stroke="#2A1810" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.85"/>

      {/* ── NOSE — very wide, flat, dark ── */}
      <ellipse cx="50" cy="78" rx="20" ry="12" fill={`url(#${u}ns)`}/>
      <ellipse cx="43" cy="73" rx="5"  ry="2.5" fill="white" opacity="0.09"/>
      {/* Large nostrils */}
      <ellipse cx="40" cy="79" rx="6.5" ry="4.5" fill="#090408" opacity="0.95"/>
      <ellipse cx="60" cy="79" rx="6.5" ry="4.5" fill="#090408" opacity="0.95"/>
      <ellipse cx="38" cy="77" rx="2"   ry="1.2" fill="white" opacity="0.14"/>
      <ellipse cx="58" cy="77" rx="2"   ry="1.2" fill="white" opacity="0.14"/>
      {/* Philtrum */}
      <path d="M50,68 L50,74" stroke="#150810" strokeWidth="1.8" opacity="0.6"/>

      {/* Head specular — subtle top sheen */}
      <ellipse cx="38" cy="36" rx="11" ry="5" fill="white" opacity="0.07" transform="rotate(-14 38 36)"/>
    </svg>
  );
}

/* ── TRÂU KIM CƯƠNG — Diamond Buffalo, crystal version of the buffalo portrait ── */
function SpecialIcon({ s, u }: P) {
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Deep crystal/navy square background */}
        <radialGradient id={`${u}bg`} cx="50%" cy="38%" r="72%">
          <stop offset="0%"   stopColor="#003A58"/>
          <stop offset="45%"  stopColor="#000E20"/>
          <stop offset="100%" stopColor="#000208"/>
        </radialGradient>
        {/* Cyan border shimmer */}
        <linearGradient id={`${u}bdr`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#80FFFF"/>
          <stop offset="35%"  stopColor="#0088CC"/>
          <stop offset="65%"  stopColor="#00EEFF"/>
          <stop offset="100%" stopColor="#004488"/>
        </linearGradient>
        {/* Diamond facet fills */}
        <linearGradient id={`${u}d1`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#E0F7FA"/>
          <stop offset="35%"  stopColor="#00E5FF"/>
          <stop offset="100%" stopColor="#003366"/>
        </linearGradient>
        <linearGradient id={`${u}d2`} x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#B2EBF2"/>
          <stop offset="55%"  stopColor="#00BCD4"/>
          <stop offset="100%" stopColor="#004466"/>
        </linearGradient>
        <linearGradient id={`${u}d3`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#80DEEA"/>
          <stop offset="100%" stopColor="#005566"/>
        </linearGradient>
        <linearGradient id={`${u}d4`} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%"   stopColor="#00D0EE" stopOpacity="0.6"/>
          <stop offset="100%" stopColor="#001A2E" stopOpacity="0.92"/>
        </linearGradient>
        {/* Crystal buffalo skin — blue-tinted grey */}
        <radialGradient id={`${u}sk`} cx="40%" cy="30%" r="72%">
          <stop offset="0%"   stopColor="#7AA0C0"/>
          <stop offset="50%"  stopColor="#3A5870"/>
          <stop offset="100%" stopColor="#0A1A28"/>
        </radialGradient>
        {/* Crystal horns */}
        <linearGradient id={`${u}hl`} x1="100%" y1="0%" x2="0%" y2="80%">
          <stop offset="0%"   stopColor="#C0E8F8"/>
          <stop offset="50%"  stopColor="#40A0CC"/>
          <stop offset="100%" stopColor="#102840"/>
        </linearGradient>
        <linearGradient id={`${u}hr`} x1="0%" y1="0%" x2="100%" y2="80%">
          <stop offset="0%"   stopColor="#C0E8F8"/>
          <stop offset="50%"  stopColor="#40A0CC"/>
          <stop offset="100%" stopColor="#102840"/>
        </linearGradient>
        {/* Glowing cyan eyes */}
        <radialGradient id={`${u}ey`} cx="30%" cy="25%" r="60%">
          <stop offset="0%"   stopColor="#80FFFF"/>
          <stop offset="50%"  stopColor="#00AACC"/>
          <stop offset="100%" stopColor="#003355"/>
        </radialGradient>
        {/* Nose crystal */}
        <radialGradient id={`${u}ns`} cx="35%" cy="28%" r="65%">
          <stop offset="0%"   stopColor="#204858"/>
          <stop offset="100%" stopColor="#080C14"/>
        </radialGradient>
      </defs>

      {/* ── Deep crystal square background ── */}
      <rect x="0" y="0" width="100" height="100" rx="10" fill={`url(#${u}bg)`}/>
      {/* Cyan inner border frame */}
      <rect x="2.5" y="2.5" width="95" height="95" rx="8.5" fill="none"
            stroke={`url(#${u}bdr)`} strokeWidth="2" opacity="0.75"/>
      {/* Corner sparkle dots */}
      <circle cx="7"  cy="7"  r="2"   fill="#00FFFF" opacity="0.65"/>
      <circle cx="93" cy="7"  r="2"   fill="#00FFFF" opacity="0.65"/>
      <circle cx="7"  cy="93" r="2"   fill="#00FFFF" opacity="0.65"/>
      <circle cx="93" cy="93" r="2"   fill="#00FFFF" opacity="0.65"/>
      {/* Top glare sheen */}
      <rect x="5" y="5" width="90" height="28" rx="7" fill="white" opacity="0.04"/>
      {/* Bottom dark vignette */}
      <rect x="0" y="62" width="100" height="38" rx="10" fill="#000208" opacity="0.4"/>

      {/* ── Diamond facets behind buffalo ── */}
      <polygon points="50,6 76,36 50,30 24,36"   fill={`url(#${u}d1)`} opacity="0.7"/>
      <polygon points="50,6 24,36 8,28 32,6"     fill={`url(#${u}d2)`} opacity="0.65"/>
      <polygon points="50,6 76,36 92,28 68,6"    fill={`url(#${u}d3)`} opacity="0.65"/>
      <polygon points="24,36 50,30 76,36 50,44"  fill="white" opacity="0.3"/>
      <polygon points="8,28 24,36 50,44 24,58"   fill={`url(#${u}d2)`} opacity="0.55"/>
      <polygon points="92,28 76,36 50,44 76,58"  fill={`url(#${u}d1)`} opacity="0.55"/>
      <polygon points="8,28 24,58 50,92"         fill={`url(#${u}d3)`} opacity="0.5"/>
      <polygon points="92,28 76,58 50,92"        fill={`url(#${u}d1)`} opacity="0.5"/>
      <polygon points="24,58 50,44 76,58 50,92"  fill={`url(#${u}d4)`} opacity="0.9"/>

      {/* ── Crystal HORNS — wide sweep, icy blue ── */}
      <path d="M27,42 Q10,28 4,10 Q8,3 15,5 Q19,14 24,30 Q28,38 34,44 Z"
            fill={`url(#${u}hl)`} opacity="0.92"/>
      <path d="M27,42 Q10,28 4,10 Q8,3 15,5"
            stroke="#C0F0FF" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6"/>
      <path d="M73,42 Q90,28 96,10 Q92,3 85,5 Q81,14 76,30 Q72,38 66,44 Z"
            fill={`url(#${u}hr)`} opacity="0.92"/>
      <path d="M73,42 Q90,28 96,10 Q92,3 85,5"
            stroke="#C0F0FF" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6"/>

      {/* ── Crystal EARS ── */}
      <ellipse cx="14" cy="54" rx="11" ry="8" fill={`url(#${u}sk)`} opacity="0.85" transform="rotate(-12 14 54)"/>
      <ellipse cx="86" cy="54" rx="11" ry="8" fill={`url(#${u}sk)`} opacity="0.85" transform="rotate(12 86 54)"/>

      {/* ── Crystal HEAD ── */}
      <ellipse cx="50" cy="62" rx="34" ry="28" fill={`url(#${u}sk)`} opacity="0.9"/>
      <ellipse cx="50" cy="44" rx="24" ry="17" fill="#4A70A0" opacity="0.7"/>

      {/* ── Crystal ROPE HALTER — glowing gold ── */}
      <path d="M24,66 Q50,60 76,66" stroke="#0060A0" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.8"/>
      <path d="M24,66 Q50,60 76,66" stroke="#40C0FF" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.55"/>
      <path d="M36,60 Q43,48 50,44 Q57,48 64,60" stroke="#0060A0" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.7"/>
      <path d="M36,60 Q43,48 50,44 Q57,48 64,60" stroke="#40C0FF" strokeWidth="1"   fill="none" strokeLinecap="round" opacity="0.5"/>
      <ellipse cx="50" cy="44" rx="5" ry="3.5" fill="#003A60" opacity="0.9"/>
      <circle  cx="50" cy="44" r="2.5" fill="#00AAFF" opacity="0.6"/>

      {/* ── EYES — glowing cyan ── */}
      <ellipse cx="35" cy="60" rx="9.5" ry="8" fill="#001822" opacity="0.8"/>
      <ellipse cx="65" cy="60" rx="9.5" ry="8" fill="#001822" opacity="0.8"/>
      <ellipse cx="35" cy="61" rx="7.5" ry="7" fill={`url(#${u}ey)`}/>
      <ellipse cx="65" cy="61" rx="7.5" ry="7" fill={`url(#${u}ey)`}/>
      <ellipse cx="35" cy="61" rx="4"   ry="4.5" fill="#001A28"/>
      <ellipse cx="65" cy="61" rx="4"   ry="4.5" fill="#001A28"/>
      <circle cx="37" cy="58" r="2.5" fill="white" opacity="0.9"/>
      <circle cx="67" cy="58" r="2.5" fill="white" opacity="0.9"/>
      {/* Eye eyelid */}
      <path d="M26,57 Q35,52 44,57" stroke="#0A3050" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8"/>
      <path d="M56,57 Q65,52 74,57" stroke="#0A3050" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8"/>

      {/* ── NOSE — crystal dark ── */}
      <ellipse cx="50" cy="78" rx="20" ry="12" fill={`url(#${u}ns)`} opacity="0.9"/>
      <ellipse cx="40" cy="79" rx="6.5" ry="4.5" fill="#040608" opacity="0.95"/>
      <ellipse cx="60" cy="79" rx="6.5" ry="4.5" fill="#040608" opacity="0.95"/>
      <ellipse cx="38" cy="77" rx="2"   ry="1.2" fill="#40C0FF" opacity="0.25"/>
      <ellipse cx="58" cy="77" rx="2"   ry="1.2" fill="#40C0FF" opacity="0.25"/>

      {/* ── Diamond outline ── */}
      <polygon points="50,6 92,28 76,58 50,92 24,58 8,28"
               fill="none" stroke="#00E5FF" strokeWidth="1.5" opacity="0.75"/>

      {/* ── Sparkles ── */}
      <path d="M84,8 L85.5,3 L87,8 L92,9.5 L87,11 L85.5,16 L84,11 L79,9.5Z"    fill="white" opacity="0.95"/>
      <path d="M8,24 L9.5,18 L11,24 L16,25.5 L11,27 L9.5,32 L8,27 L3,25.5Z"    fill="white" opacity="0.88"/>
      <path d="M86,72 L87,68 L88,72 L92,73 L88,74 L87,78 L86,74 L82,73Z"        fill="white" opacity="0.8"/>
      <path d="M12,70 L13,66 L14,70 L18,71 L14,72 L13,76 L12,72 L8,71Z"         fill="#00FFFF" opacity="0.7"/>

      {/* Crystal sheen */}
      <ellipse cx="38" cy="24" rx="10" ry="4" fill="white" opacity="0.35" transform="rotate(-18 38 24)"/>
      <circle cx="50" cy="88" r="4" fill="#00E5FF" opacity="0.4"/>
    </svg>
  );
}

/* ── Master export ───────────────────────────────────────────────────────── */
export function SymbolSVG({ id, size = 62 }: { id: SymbolId; size?: number }) {
  // useId gives a stable unique string per component instance → no gradient ID collisions
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const p = { s: size, u: uid };

  switch (id) {
    case SymbolId.DRAGON:  return <DogIcon      {...p}/>;
    case SymbolId.TIGER:   return <PhoenixIcon {...p}/>;
    case SymbolId.PANDA:   return <LotusIcon   {...p}/>;
    case SymbolId.KOI:     return <LanternIcon {...p}/>;
    case SymbolId.LOTUS:   return <BambooIcon  {...p}/>;
    case SymbolId.COIN:    return <PhoIcon     {...p}/>;
    case SymbolId.JADE:    return <RiceIcon    {...p}/>;
    case SymbolId.WILD:    return <WildIcon    {...p}/>;
    case SymbolId.SCATTER: return <ScatterIcon {...p}/>;
    case SymbolId.NUGGET:  return <BuffaloIcon {...p}/>;
    case SymbolId.SPECIAL: return <SpecialIcon {...p}/>;
    default:
      return (
        <div style={{ width: size, height: size, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: Math.round(size * 0.5), color: '#FFD700' }}>?</div>
      );
  }
}
