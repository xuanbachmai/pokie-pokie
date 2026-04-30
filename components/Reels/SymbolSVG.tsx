'use client';
import { SymbolId } from '@/types/game';

interface Props { size?: number }

/* ── Dragon ──────────────────────────────────────────────────────────────── */
function Dragon({ size }: Props) {
  const s = size ?? 56;
  return (
    <svg width={s} height={s} viewBox="0 0 60 60" fill="none">
      <defs>
        <radialGradient id="dr-body" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF6060" /><stop offset="100%" stopColor="#8B0000" />
        </radialGradient>
        <radialGradient id="dr-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF4D6D44" /><stop offset="100%" stopColor="#8B000000" />
        </radialGradient>
      </defs>
      <ellipse cx="30" cy="32" rx="26" ry="24" fill="url(#dr-glow)" />
      <path d="M30 48 C15 48 10 38 14 28 C18 18 28 16 34 20 C40 24 42 32 38 38 C34 44 25 44 22 38 C19 32 22 26 27 25"
        stroke="url(#dr-body)" strokeWidth="5.5" strokeLinecap="round" fill="none" />
      <ellipse cx="27" cy="23" rx="7" ry="5.5" fill="#CC0000" stroke="#FFD700" strokeWidth="1" />
      <ellipse cx="23" cy="25" rx="4" ry="3" fill="#B00000" stroke="#FFD700" strokeWidth="0.8" />
      <circle cx="28" cy="21" r="2" fill="#FFD700" /><circle cx="28" cy="21" r="1" fill="#000" />
      <path d="M20 27 Q17 25 19 23" stroke="#FF8C00" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M21 28 Q18 27 20 25" stroke="#FFD700" strokeWidth="1" strokeLinecap="round" fill="none" />
      <path d="M29 17 L27 11 L31 15" fill="#FFD700" stroke="#FF8C00" strokeWidth="0.5" />
      <path d="M33 18 L33 12 L36 16" fill="#FFD700" stroke="#FF8C00" strokeWidth="0.5" />
      <path d="M20 24 L12 22" stroke="#FFD700" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M20 26 L12 27" stroke="#FFD700" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M22 36 Q24 33 26 36" stroke="#FF4D6D" strokeWidth="1" fill="none" />
      <path d="M26 40 Q28 37 30 40" stroke="#FF4D6D" strokeWidth="1" fill="none" />
    </svg>
  );
}

/* ── Phoenix ─────────────────────────────────────────────────────────────── */
function Phoenix({ size }: Props) {
  const s = size ?? 56;
  return (
    <svg width={s} height={s} viewBox="0 0 60 60" fill="none">
      <defs>
        <linearGradient id="ph-wing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" /><stop offset="50%" stopColor="#FF8C00" /><stop offset="100%" stopColor="#FF4D6D" />
        </linearGradient>
        <linearGradient id="ph-body" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFAA00" /><stop offset="100%" stopColor="#CC4400" />
        </linearGradient>
      </defs>
      <path d="M30 28 L6 14 L12 24 L4 20 L14 32 L8 30 L18 38 L30 32" fill="url(#ph-wing)" opacity="0.9" />
      <path d="M30 28 L54 14 L48 24 L56 20 L46 32 L52 30 L42 38 L30 32" fill="url(#ph-wing)" opacity="0.9" />
      <ellipse cx="30" cy="30" rx="7" ry="9" fill="url(#ph-body)" />
      <circle cx="30" cy="20" r="5.5" fill="#FFAA00" stroke="#FFD700" strokeWidth="1" />
      <path d="M28 15 L26 8 L30 13 L30 8 L32 13 L34 7 L32 14" fill="#FFD700" />
      <circle cx="32" cy="20" r="1.5" fill="#FF4D6D" /><circle cx="32" cy="20" r="0.7" fill="#000" />
      <path d="M34 22 L37 24 L34 25" fill="#FFD700" />
      <path d="M26 38 L20 52 L28 42 L30 54 L32 42 L40 52 L34 38" fill="url(#ph-wing)" opacity="0.85" />
      <ellipse cx="30" cy="50" rx="8" ry="5" fill="#FF8C0044" />
    </svg>
  );
}

/* ── Lotus ───────────────────────────────────────────────────────────────── */
function Lotus({ size }: Props) {
  const s = size ?? 56;
  return (
    <svg width={s} height={s} viewBox="0 0 60 60" fill="none">
      <defs>
        <radialGradient id="lo-petal" cx="50%" cy="80%" r="70%">
          <stop offset="0%" stopColor="#FFE0EA" /><stop offset="100%" stopColor="#FF85A1" />
        </radialGradient>
        <radialGradient id="lo-center" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFE082" /><stop offset="100%" stopColor="#FFD700" />
        </radialGradient>
      </defs>
      <ellipse cx="30" cy="50" rx="22" ry="5" fill="#1565C055" />
      <ellipse cx="14" cy="46" rx="10" ry="6" fill="#2E7D32" transform="rotate(-20,14,46)" />
      <ellipse cx="46" cy="46" rx="10" ry="6" fill="#388E3C" transform="rotate(20,46,46)" />
      <ellipse cx="30" cy="32" rx="6" ry="16" fill="url(#lo-petal)" transform="rotate(-30,30,44)" />
      <ellipse cx="30" cy="32" rx="6" ry="16" fill="url(#lo-petal)" transform="rotate(30,30,44)" />
      <ellipse cx="30" cy="28" rx="6" ry="16" fill="url(#lo-petal)" transform="rotate(0,30,44)" />
      <ellipse cx="30" cy="32" rx="5" ry="13" fill="#FFBDD0" transform="rotate(-15,30,42)" />
      <ellipse cx="30" cy="32" rx="5" ry="13" fill="#FFBDD0" transform="rotate(15,30,42)" />
      <ellipse cx="30" cy="30" rx="5" ry="13" fill="#FFBDD0" />
      <circle cx="30" cy="38" r="7" fill="url(#lo-center)" />
      <circle cx="30" cy="38" r="5" fill="#FFD700" stroke="#FF8C00" strokeWidth="0.5" />
      {[0,60,120,180,240,300].map((a,i) => (
        <circle key={i} cx={30 + 3.5*Math.cos(a*Math.PI/180)} cy={38 + 3.5*Math.sin(a*Math.PI/180)} r="0.8" fill="#FF8C00" />
      ))}
    </svg>
  );
}

/* ── Lantern ─────────────────────────────────────────────────────────────── */
function Lantern({ size }: Props) {
  const s = size ?? 56;
  return (
    <svg width={s} height={s} viewBox="0 0 60 60" fill="none">
      <defs>
        <radialGradient id="lan-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF8C0066" /><stop offset="100%" stopColor="#CC000000" />
        </radialGradient>
        <linearGradient id="lan-body" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#CC0000" /><stop offset="40%" stopColor="#FF4444" /><stop offset="100%" stopColor="#990000" />
        </linearGradient>
      </defs>
      <ellipse cx="30" cy="34" rx="22" ry="20" fill="url(#lan-glow)" />
      <line x1="30" y1="4" x2="30" y2="12" stroke="#FFD700" strokeWidth="1.2" />
      <path d="M18 16 Q30 12 42 16 L40 20 Q30 17 20 20 Z" fill="#FFD700" />
      <path d="M20 20 Q10 34 20 48 Q30 52 40 48 Q50 34 40 20 Q30 17 20 20 Z" fill="url(#lan-body)" />
      {[22,27,32,37,42].map((y,i) => (
        <path key={i} d={`M${20+Math.abs(y-34)/3.5} ${y} Q30 ${y+1} ${40-Math.abs(y-34)/3.5} ${y}`}
          stroke="#FFD700" strokeWidth="0.9" fill="none" opacity="0.7" />
      ))}
      <text x="30" y="37" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#FFD700" fontFamily="serif">福</text>
      <path d="M20 48 Q30 52 40 48 L38 52 Q30 55 22 52 Z" fill="#FFD700" />
      <line x1="26" y1="54" x2="24" y2="62" stroke="#FFD700" strokeWidth="1.2" />
      <line x1="30" y1="54" x2="30" y2="62" stroke="#FFD700" strokeWidth="1.2" />
      <line x1="34" y1="54" x2="36" y2="62" stroke="#FFD700" strokeWidth="1.2" />
      <circle cx="24" cy="62" r="1.5" fill="#FF8C00" />
      <circle cx="30" cy="62" r="1.5" fill="#FF8C00" />
      <circle cx="36" cy="62" r="1.5" fill="#FF8C00" />
    </svg>
  );
}

/* ── Bamboo ──────────────────────────────────────────────────────────────── */
function Bamboo({ size }: Props) {
  const s = size ?? 56;
  return (
    <svg width={s} height={s} viewBox="0 0 60 60" fill="none">
      <defs>
        <linearGradient id="ba-stalk1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2E7D32" /><stop offset="50%" stopColor="#66BB6A" /><stop offset="100%" stopColor="#388E3C" />
        </linearGradient>
        <linearGradient id="ba-stalk2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1B5E20" /><stop offset="50%" stopColor="#4CAF50" /><stop offset="100%" stopColor="#2E7D32" />
        </linearGradient>
      </defs>
      <rect x="14" y="6" width="8" height="52" rx="4" fill="url(#ba-stalk2)" opacity="0.7" />
      {[14,22,30,40,50].map((y,i) => <line key={i} x1="14" y1={y} x2="22" y2={y} stroke="#1B5E20" strokeWidth="1" />)}
      <rect x="24" y="3" width="10" height="56" rx="5" fill="url(#ba-stalk1)" />
      {[12,22,32,42,52].map((y,i) => <line key={i} x1="24" y1={y} x2="34" y2={y} stroke="#1B5E20" strokeWidth="1.2" />)}
      <rect x="38" y="8" width="8" height="50" rx="4" fill="url(#ba-stalk2)" opacity="0.8" />
      {[18,28,38,48].map((y,i) => <line key={i} x1="38" y1={y} x2="46" y2={y} stroke="#1B5E20" strokeWidth="1" />)}
      <path d="M22 20 Q32 15 38 20" stroke="#4CAF50" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M22 36 Q12 28 8 33" stroke="#388E3C" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M34 16 Q44 10 48 16" stroke="#4CAF50" strokeWidth="2.5" fill="#4CAF5044" strokeLinecap="round" />
      <path d="M34 30 Q44 24 50 28" stroke="#66BB6A" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M24 44 Q14 38 10 43" stroke="#4CAF50" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/* ── Pho ─────────────────────────────────────────────────────────────────── */
function Pho({ size }: Props) {
  const s = size ?? 56;
  return (
    <svg width={s} height={s} viewBox="0 0 60 60" fill="none">
      <defs>
        <linearGradient id="pho-bowl" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" /><stop offset="100%" stopColor="#D0C0A0" />
        </linearGradient>
        <radialGradient id="pho-broth" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#D4891A" /><stop offset="100%" stopColor="#8B5E3C" />
        </radialGradient>
      </defs>
      <path d="M20 22 Q18 16 20 10 Q22 16 20 22" stroke="#ffffff55" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M30 20 Q28 13 30 7 Q32 13 30 20" stroke="#ffffff55" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M40 22 Q38 16 40 10 Q42 16 40 22" stroke="#ffffff55" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M8 32 Q8 52 30 54 Q52 52 52 32 L48 28 Q30 26 12 28 Z" fill="url(#pho-bowl)" stroke="#C8A870" strokeWidth="1" />
      <path d="M10 30 Q30 24 50 30" stroke="#C8A870" strokeWidth="2" fill="none" />
      <path d="M10 30 Q12 28 30 26 Q48 28 50 30 Q30 32 10 30 Z" fill="#E8D8B8" />
      <ellipse cx="30" cy="36" rx="18" ry="8" fill="url(#pho-broth)" />
      <path d="M14 35 Q20 32 26 36 Q32 40 38 36 Q44 32 46 35" stroke="#FFF8E1" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M16 38 Q22 35 28 39 Q34 43 40 39 Q44 36 46 38" stroke="#FFF8E1" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <circle cx="22" cy="34" r="2" fill="#4CAF50" />
      <circle cx="38" cy="34" r="2" fill="#4CAF50" />
      <circle cx="30" cy="33" r="1.5" fill="#66BB6A" />
      <line x1="38" y1="22" x2="52" y2="44" stroke="#8D6E63" strokeWidth="2" strokeLinecap="round" />
      <line x1="42" y1="20" x2="56" y2="42" stroke="#A1887F" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ── Rice ────────────────────────────────────────────────────────────────── */
function Rice({ size }: Props) {
  const s = size ?? 56;
  return (
    <svg width={s} height={s} viewBox="0 0 60 60" fill="none">
      <defs>
        <linearGradient id="ri-stalk" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8BC34A" /><stop offset="100%" stopColor="#558B2F" />
        </linearGradient>
      </defs>
      <path d="M5 55 Q30 52 55 55" stroke="#558B2F" strokeWidth="2" fill="none" />
      <path d="M16 54 Q14 40 18 24" stroke="url(#ri-stalk)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M18 24 Q16 16 12 10" stroke="#8BC34A" strokeWidth="2" fill="none" strokeLinecap="round" />
      {[10,14,18,22].map((y,i) => <ellipse key={i} cx={12+i*0.5} cy={y} rx="2.5" ry="4" fill="#FFD700" transform={`rotate(${-20-i*5},${12+i*0.5},${y})`} />)}
      <path d="M30 54 Q29 38 30 20" stroke="url(#ri-stalk)" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M30 20 Q28 10 25 4" stroke="#8BC34A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {[4,9,14,19].map((y,i) => <ellipse key={i} cx={25+i*0.5} cy={y} rx="3" ry="5" fill="#DAA520" transform={`rotate(${-25-i*4},${25+i*0.5},${y})`} />)}
      <path d="M44 54 Q46 40 42 24" stroke="url(#ri-stalk)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M42 24 Q44 14 48 8" stroke="#8BC34A" strokeWidth="2" fill="none" strokeLinecap="round" />
      {[8,13,18,23].map((y,i) => <ellipse key={i} cx={48-i*0.5} cy={y} rx="2.5" ry="4" fill="#FFD700" transform={`rotate(${20+i*5},${48-i*0.5},${y})`} />)}
      <path d="M18 38 Q10 32 7 36" stroke="#66BB6A" strokeWidth="2" fill="none" />
      <path d="M30 35 Q38 28 42 32" stroke="#66BB6A" strokeWidth="2" fill="none" />
    </svg>
  );
}

/* ── Tiger Wild ──────────────────────────────────────────────────────────── */
function TigerWild({ size }: Props) {
  const s = size ?? 56;
  return (
    <svg width={s} height={s} viewBox="0 0 60 60" fill="none">
      <defs>
        <radialGradient id="ti-face" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#FFA726" /><stop offset="100%" stopColor="#E65100" />
        </radialGradient>
      </defs>
      <ellipse cx="30" cy="34" rx="22" ry="20" fill="url(#ti-face)" />
      <path d="M10 20 L6 8 L18 18" fill="#FF8C00" stroke="#E65100" strokeWidth="0.8" />
      <path d="M50 20 L54 8 L42 18" fill="#FF8C00" stroke="#E65100" strokeWidth="0.8" />
      <path d="M11 19 L8 11 L17 18" fill="#FFCCBC" />
      <path d="M49 19 L52 11 L43 18" fill="#FFCCBC" />
      <path d="M26 18 L24 10" stroke="#4E2600" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M30 16 L30 8" stroke="#4E2600" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M34 18 L36 10" stroke="#4E2600" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M10 30 L18 32" stroke="#4E2600" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 36 L18 36" stroke="#4E2600" strokeWidth="2" strokeLinecap="round" />
      <path d="M50 30 L42 32" stroke="#4E2600" strokeWidth="2" strokeLinecap="round" />
      <path d="M50 36 L42 36" stroke="#4E2600" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="30" cy="42" rx="13" ry="9" fill="#FFF8E1" />
      <path d="M26 36 Q30 34 34 36 L32 38 Q30 39 28 38 Z" fill="#FF7043" />
      <path d="M30 38 L30 42" stroke="#4E2600" strokeWidth="1" />
      <path d="M24 42 Q27 44 30 42 Q33 44 36 42" stroke="#4E2600" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <ellipse cx="22" cy="30" rx="4.5" ry="5" fill="#FFF" stroke="#4E2600" strokeWidth="0.5" />
      <ellipse cx="38" cy="30" rx="4.5" ry="5" fill="#FFF" stroke="#4E2600" strokeWidth="0.5" />
      <ellipse cx="22" cy="30" rx="3" ry="4" fill="#388E3C" />
      <ellipse cx="38" cy="30" rx="3" ry="4" fill="#388E3C" />
      <ellipse cx="22" cy="31" rx="1.5" ry="3" fill="#000" />
      <ellipse cx="38" cy="31" rx="1.5" ry="3" fill="#000" />
      <circle cx="21" cy="28" r="0.8" fill="#FFF" />
      <circle cx="37" cy="28" r="0.8" fill="#FFF" />
      <line x1="20" y1="40" x2="8" y2="38" stroke="#FFF8E1" strokeWidth="0.8" />
      <line x1="20" y1="42" x2="8" y2="43" stroke="#FFF8E1" strokeWidth="0.8" />
      <line x1="40" y1="40" x2="52" y2="38" stroke="#FFF8E1" strokeWidth="0.8" />
      <line x1="40" y1="42" x2="52" y2="43" stroke="#FFF8E1" strokeWidth="0.8" />
      {/* WILD badge */}
      <rect x="16" y="52" width="28" height="9" rx="4" fill="#FF8C00" stroke="#FFD700" strokeWidth="1" />
      <text x="30" y="59.5" textAnchor="middle" fontSize="6" fontWeight="900" fill="#000" fontFamily="Arial">WILD</text>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
/* ── Trống Đồng (Bronze Drum) — blazing FREE GAMES scatter symbol ────────── */
/* ══════════════════════════════════════════════════════════════════════════ */
function BronzeDrum({ size }: Props) {
  const s = size ?? 56;
  return (
    <svg width={s} height={s} viewBox="0 0 60 60" fill="none" overflow="visible">
      <defs>
        <radialGradient id="bd2-face" cx="50%" cy="40%" r="60%">
          <stop offset="0%"   stopColor="#FFFDE7" />
          <stop offset="20%"  stopColor="#FFD700" />
          <stop offset="55%"  stopColor="#E07A00" />
          <stop offset="100%" stopColor="#7A3800" />
        </radialGradient>
        <radialGradient id="bd2-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#FF8C0000" />
          <stop offset="45%"  stopColor="#FF8C0044" />
          <stop offset="100%" stopColor="#FFD700CC" />
        </radialGradient>
        <radialGradient id="bd2-center" cx="40%" cy="35%" r="70%">
          <stop offset="0%"   stopColor="#FFFFFF" />
          <stop offset="35%"  stopColor="#FFE000" />
          <stop offset="100%" stopColor="#FF7000" />
        </radialGradient>
        <radialGradient id="bd2-badge" cx="50%" cy="30%" r="70%">
          <stop offset="0%"   stopColor="#FF4500" />
          <stop offset="100%" stopColor="#CC2200" />
        </radialGradient>
        <filter id="bd2-glow">
          <feGaussianBlur stdDeviation="2.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="bd2-softglow">
          <feGaussianBlur stdDeviation="1.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* ── STARBURST RAYS (slow rotation behind drum) ── */}
      <g opacity="0.55">
        <animateTransform attributeName="transform" type="rotate"
          from="0 30 30" to="360 30 30" dur="10s" repeatCount="indefinite" />
        {Array.from({ length: 16 }, (_, i) => {
          const a  = (i * 22.5) * Math.PI / 180;
          const a2 = (i * 22.5 + 8) * Math.PI / 180;
          const a3 = (i * 22.5 - 8) * Math.PI / 180;
          const r1 = 11, r2 = 34;
          const x1 = 30 + r1 * Math.cos(a),  y1 = 30 + r1 * Math.sin(a);
          const x2 = 30 + r2 * Math.cos(a),  y2 = 30 + r2 * Math.sin(a);
          const x3 = 30 + r1 * Math.cos(a2), y3 = 30 + r1 * Math.sin(a2);
          const x4 = 30 + r1 * Math.cos(a3), y4 = 30 + r1 * Math.sin(a3);
          return <path key={i}
            d={`M${x3.toFixed(1)} ${y3.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)} L${x4.toFixed(1)} ${y4.toFixed(1)} Z`}
            fill={i % 2 === 0 ? '#FFD700' : '#FF8C00'} />;
        })}
      </g>

      {/* Strong pulsing outer halo */}
      <circle cx="30" cy="30" r="30" fill="url(#bd2-halo)">
        <animate attributeName="r" values="27;32;27" dur="1.4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.6;1;0.6" dur="1.4s" repeatCount="indefinite" />
      </circle>

      {/* Outer border ring */}
      <circle cx="30" cy="30" r="26.5" stroke="#7A3800" strokeWidth="2.5" fill="none" />
      <circle cx="30" cy="30" r="26.5" stroke="#FFB300" strokeWidth="1.2" fill="none" opacity="0.9">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="1.4s" repeatCount="indefinite" />
      </circle>

      {/* Drum face */}
      <circle cx="30" cy="30" r="24.5" fill="url(#bd2-face)" />

      {/* ── Rotating outer decoration ring ── */}
      <g>
        <animateTransform attributeName="transform" type="rotate"
          from="0 30 30" to="360 30 30" dur="15s" repeatCount="indefinite" />
        <circle cx="30" cy="30" r="21.5" stroke="#5C2800" strokeWidth="2.8" fill="none" />
        <circle cx="30" cy="30" r="21.5" stroke="#CC8800" strokeWidth="1" fill="none" opacity="0.6" />
        {Array.from({ length: 12 }, (_, i) => (
          <g key={i} transform={`rotate(${i * 30} 30 30)`}>
            <path d="M30 8.5 L32 13 L30 11 L28 13 Z" fill="#4A2000" opacity="0.95" />
          </g>
        ))}
      </g>

      {/* Concentric decorative rings */}
      <circle cx="30" cy="30" r="18.5" stroke="#AA6000" strokeWidth="0.8" fill="none" opacity="0.75" />
      <circle cx="30" cy="30" r="14"   stroke="#CC8010" strokeWidth="0.7" fill="none" opacity="0.65" />

      {/* 12-point Đông Sơn sun rays */}
      {Array.from({ length: 12 }, (_, i) => {
        const a  = (i * 30 - 90) * Math.PI / 180;
        const aw = (i * 30 - 90 + 13) * Math.PI / 180;
        const inner = 7, outer = 13.5;
        const x1 = 30 + inner * Math.cos(a),  y1 = 30 + inner * Math.sin(a);
        const x2 = 30 + outer * Math.cos(a),  y2 = 30 + outer * Math.sin(a);
        const xw = 30 + (inner + 1.5) * Math.cos(aw), yw = 30 + (inner + 1.5) * Math.sin(aw);
        return <path key={i}
          d={`M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)} L${xw.toFixed(1)} ${yw.toFixed(1)} Z`}
          fill={i % 2 === 0 ? '#7A3800' : '#5C2000'} opacity="0.9" />;
      })}

      {/* 4 frogs on rim */}
      {[0, 90, 180, 270].map((deg, i) => (
        <g key={i} transform={`rotate(${deg} 30 30)`}>
          <ellipse cx={30} cy={9} rx="3" ry="1.9" fill="#2E7D32" opacity="0.95" />
          <circle cx={28.4} cy={8} r="0.75" fill="#1B5E20" />
          <circle cx={31.6} cy={8} r="0.75" fill="#1B5E20" />
        </g>
      ))}

      {/* ── CENTER MEDALLION — big bright pulsing ── */}
      <circle cx="30" cy="30" r="10.5" fill="#3E1200" stroke="#FF8C00" strokeWidth="1.8" filter="url(#bd2-glow)">
        <animate attributeName="r" values="9.5;11.5;9.5" dur="1.4s" repeatCount="indefinite" />
      </circle>
      <circle cx="30" cy="30" r="9.5" fill="url(#bd2-center)">
        <animate attributeName="r" values="8.5;10.5;8.5" dur="1.4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.85;1;0.85" dur="1.4s" repeatCount="indefinite" />
      </circle>

      {/* Center text — FREE GAMES 10 SPINS */}
      <text x="30" y="27" textAnchor="middle" fontSize="5.5" fontWeight="900"
        fill="#3A1000" fontFamily="Arial, sans-serif">FREE</text>
      <text x="30" y="32.5" textAnchor="middle" fontSize="4.2" fontWeight="900"
        fill="#3A1000" fontFamily="Arial, sans-serif">GAMES</text>
      <text x="30" y="37.5" textAnchor="middle" fontSize="3.4" fontWeight="700"
        fill="#5C2200" fontFamily="Arial, sans-serif">10 SPINS</text>

      {/* ── Bottom banner: FREE GAMES ── */}
      <rect x="3" y="50.5" width="54" height="10" rx="5" fill="url(#bd2-badge)" stroke="#FFD700" strokeWidth="1.4" filter="url(#bd2-softglow)">
        <animate attributeName="opacity" values="0.85;1;0.85" dur="1.4s" repeatCount="indefinite" />
      </rect>
      <text x="30" y="58" textAnchor="middle" fontSize="5.8" fontWeight="900"
        fill="#FFD700" fontFamily="Arial, sans-serif" letterSpacing="0.5">FREE GAMES</text>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
/* ── Trâu — Friendly Water Buffalo — warm brown, cute, gold coin frame ───── */
/* ══════════════════════════════════════════════════════════════════════════ */
function Buffalo({ size }: Props) {
  const s = size ?? 56;
  return (
    <svg width={s} height={s} viewBox="0 0 60 60" fill="none" overflow="visible">
      <defs>
        {/* Warm honey-brown head */}
        <radialGradient id="bu2-head" cx="48%" cy="36%" r="58%">
          <stop offset="0%"   stopColor="#D4956A" />
          <stop offset="45%"  stopColor="#A06840" />
          <stop offset="100%" stopColor="#6B3E20" />
        </radialGradient>
        {/* Lighter warm muzzle */}
        <radialGradient id="bu2-muzzle" cx="50%" cy="40%" r="60%">
          <stop offset="0%"   stopColor="#C8845A" />
          <stop offset="100%" stopColor="#8B5030" />
        </radialGradient>
        {/* Big friendly eye iris — warm amber */}
        <radialGradient id="bu2-iris" cx="38%" cy="32%" r="65%">
          <stop offset="0%"   stopColor="#FFE066" />
          <stop offset="50%"  stopColor="#E8A000" />
          <stop offset="100%" stopColor="#B06800" />
        </radialGradient>
        {/* Ear inner */}
        <radialGradient id="bu2-earInner" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#FFCCAA" />
          <stop offset="100%" stopColor="#E8A070" />
        </radialGradient>
        {/* Fluffy tuft on forehead */}
        <radialGradient id="bu2-tuft" cx="50%" cy="30%" r="60%">
          <stop offset="0%"   stopColor="#C8845A" />
          <stop offset="100%" stopColor="#8B5030" />
        </radialGradient>
        <filter id="bu2-glow">
          <feGaussianBlur stdDeviation="1.8" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="bu2-coinGlow">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        {/* Horn gradient — warm honey brown */}
        <linearGradient id="bu2-horn" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#8B6040" />
          <stop offset="60%"  stopColor="#C89060" />
          <stop offset="100%" stopColor="#A07040" />
        </linearGradient>
        {/* Horn tip — golden */}
        <radialGradient id="bu2-hornTip" cx="40%" cy="40%" r="60%">
          <stop offset="0%"   stopColor="#FFF0A0" />
          <stop offset="100%" stopColor="#FFD700" />
        </radialGradient>
        {/* Gold coin ring */}
        <linearGradient id="bu2-coinOuter" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#8B6914" />
          <stop offset="25%"  stopColor="#FFD700" />
          <stop offset="50%"  stopColor="#C8960C" />
          <stop offset="75%"  stopColor="#FFE566" />
          <stop offset="100%" stopColor="#8B6914" />
        </linearGradient>
        <radialGradient id="bu2-coinFill" cx="50%" cy="40%" r="60%">
          <stop offset="0%"   stopColor="#3A2200" />
          <stop offset="100%" stopColor="#140C00" />
        </radialGradient>
        <linearGradient id="bu2-shine" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#FFFFFF00" />
          <stop offset="50%"  stopColor="#FFFFFF99" />
          <stop offset="100%" stopColor="#FFFFFF00" />
        </linearGradient>
      </defs>

      {/* ═══ GOLD COIN RING ═══ */}
      {/* Outer glow pulse */}
      <circle cx="30" cy="34" r="25" fill="none" stroke="#FFD700" strokeWidth="0.8" opacity="0.25" filter="url(#bu2-coinGlow)">
        <animate attributeName="r"       values="23;27;23" dur="2.2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.15;0.55;0.15" dur="2.2s" repeatCount="indefinite" />
      </circle>

      {/* Coin base fill */}
      <circle cx="30" cy="34" r="22" fill="url(#bu2-coinFill)" />

      {/* Dark shadow ring */}
      <circle cx="30" cy="34" r="22" fill="none" stroke="#6B4F0A" strokeWidth="6.5" />
      {/* Bright gold ring */}
      <circle cx="30" cy="34" r="22" fill="none" stroke="url(#bu2-coinOuter)" strokeWidth="4.5" />
      {/* Inner & outer fine lines */}
      <circle cx="30" cy="34" r="20"   fill="none" stroke="#FFE566" strokeWidth="0.6" opacity="0.55" />
      <circle cx="30" cy="34" r="23.9" fill="none" stroke="#7A5800" strokeWidth="0.6" opacity="0.45" />

      {/* Coin reeding — 44 ticks */}
      {Array.from({ length: 44 }, (_, i) => {
        const a  = (i * (360 / 44)) * Math.PI / 180;
        const r1 = 20.3, r2 = 23.7;
        const x1 = 30 + r1 * Math.cos(a), y1 = 34 + r1 * Math.sin(a);
        const x2 = 30 + r2 * Math.cos(a), y2 = 34 + r2 * Math.sin(a);
        return <line key={i} x1={x1.toFixed(1)} y1={y1.toFixed(1)}
          x2={x2.toFixed(1)} y2={y2.toFixed(1)} stroke="#4A3400" strokeWidth="0.8" />;
      })}

      {/* Animated shine sweep */}
      <circle cx="30" cy="34" r="22" fill="none" stroke="url(#bu2-shine)" strokeWidth="4.5" opacity="0">
        <animateTransform attributeName="gradientTransform" type="rotate"
          from="0 30 34" to="360 30 34" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0;0.65;0.65;0" dur="3s" repeatCount="indefinite" />
      </circle>

      {/* ══ FRIENDLY BUFFALO INSIDE COIN ══ */}

      {/* ── Gentle curving horns — sweep UP, not sideways ── */}
      {/* Left horn: starts at head, arcs gently up-left, rounds at top */}
      <path d="M17 26 Q6 16 10 6 Q14 2 19 7 Q21 12 20 20"
        stroke="url(#bu2-horn)" strokeWidth="5.5" strokeLinecap="round" fill="none" />
      <path d="M17 26 Q6 16 10 6 Q14 2 19 7 Q21 12 20 20"
        stroke="#D4A870" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.5" />
      {/* Left tip gold ball */}
      <circle cx="10.5" cy="6" r="2.8" fill="url(#bu2-hornTip)">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
      </circle>

      {/* Right horn */}
      <path d="M43 26 Q54 16 50 6 Q46 2 41 7 Q39 12 40 20"
        stroke="url(#bu2-horn)" strokeWidth="5.5" strokeLinecap="round" fill="none" />
      <path d="M43 26 Q54 16 50 6 Q46 2 41 7 Q39 12 40 20"
        stroke="#D4A870" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.5" />
      <circle cx="49.5" cy="6" r="2.8" fill="url(#bu2-hornTip)">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" begin="0.4s" repeatCount="indefinite" />
      </circle>

      {/* ── Round fluffy ears ── */}
      <ellipse cx="12" cy="28" rx="6" ry="7.5" fill="#A06840" transform="rotate(-12,12,28)" />
      <ellipse cx="48" cy="28" rx="6" ry="7.5" fill="#A06840" transform="rotate(12,48,28)" />
      {/* Inner ear */}
      <ellipse cx="12" cy="28" rx="3.5" ry="5" fill="url(#bu2-earInner)" transform="rotate(-12,12,28)" />
      <ellipse cx="48" cy="28" rx="3.5" ry="5" fill="url(#bu2-earInner)" transform="rotate(12,48,28)" />

      {/* ── Main head — rounder & warmer ── */}
      <ellipse cx="30" cy="34" rx="18" ry="16" fill="url(#bu2-head)" />

      {/* Fluffy forehead tuft */}
      <ellipse cx="30" cy="21" rx="6"   ry="4"   fill="url(#bu2-tuft)" opacity="0.9" />
      <ellipse cx="27" cy="20" rx="3.5" ry="2.8" fill="#C8845A" opacity="0.7" />
      <ellipse cx="33" cy="20" rx="3.5" ry="2.8" fill="#C8845A" opacity="0.7" />

      {/* Gentle forehead highlight */}
      <ellipse cx="30" cy="26" rx="9" ry="4" fill="#D4956A" opacity="0.35" />

      {/* ── Big friendly eyes ── */}
      {/* Left eye soft glow */}
      <circle cx="21" cy="31" r="7" fill="#FFB300" opacity="0.08" filter="url(#bu2-glow)">
        <animate attributeName="r"       values="5;8;5"         dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.05;0.18;0.05" dur="3s" repeatCount="indefinite" />
      </circle>
      {/* Right eye soft glow */}
      <circle cx="39" cy="31" r="7" fill="#FFB300" opacity="0.08" filter="url(#bu2-glow)">
        <animate attributeName="r"       values="5;8;5"         dur="3s" begin="0.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.05;0.18;0.05" dur="3s" begin="0.5s" repeatCount="indefinite" />
      </circle>
      {/* Eye whites — big round */}
      <ellipse cx="21" cy="31" rx="5.5" ry="5.5" fill="#FFFBF0" stroke="#8B5030" strokeWidth="0.6" />
      <ellipse cx="39" cy="31" rx="5.5" ry="5.5" fill="#FFFBF0" stroke="#8B5030" strokeWidth="0.6" />
      {/* Iris — warm amber */}
      <circle cx="21" cy="31" r="4" fill="url(#bu2-iris)" />
      <circle cx="39" cy="31" r="4" fill="url(#bu2-iris)" />
      {/* Pupil */}
      <circle cx="21" cy="31" r="2.2" fill="#1A0800" />
      <circle cx="39" cy="31" r="2.2" fill="#1A0800" />
      {/* Main eye sparkle */}
      <circle cx="19.8" cy="29.5" r="1.1" fill="#FFF" opacity="0.95" />
      <circle cx="38.8" cy="29.5" r="1.1" fill="#FFF" opacity="0.95" />
      {/* Small secondary sparkle */}
      <circle cx="22"   cy="32.5" r="0.5" fill="#FFF" opacity="0.6" />
      <circle cx="40"   cy="32.5" r="0.5" fill="#FFF" opacity="0.6" />

      {/* Friendly eyebrows — gentle arch up */}
      <path d="M16 25.5 Q21 23 26 25" stroke="#6B3E20" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M34 25 Q39 23 44 25.5" stroke="#6B3E20" strokeWidth="1.4" fill="none" strokeLinecap="round" />

      {/* ── Wide round muzzle ── */}
      <ellipse cx="30" cy="43" rx="12" ry="8" fill="url(#bu2-muzzle)" />
      {/* Muzzle highlight */}
      <ellipse cx="30" cy="40.5" rx="8" ry="3" fill="#D4845A" opacity="0.3" />
      {/* Nostrils — soft and rounded */}
      <ellipse cx="25.5" cy="44" rx="2.8" ry="2.2" fill="#7A3A18" />
      <ellipse cx="34.5" cy="44" rx="2.8" ry="2.2" fill="#7A3A18" />
      {/* Nostril shine */}
      <circle cx="25" cy="43.3" r="0.7" fill="#A06040" opacity="0.7" />
      <circle cx="34" cy="43.3" r="0.7" fill="#A06040" opacity="0.7" />

      {/* ── Little smile ── */}
      <path d="M24 47.5 Q30 51 36 47.5" stroke="#6B3E20" strokeWidth="1.5" fill="none"
        strokeLinecap="round" opacity="0.8" />

      {/* ── Gold nose ring ── */}
      <path d="M26 49 Q30 52.5 34 49" stroke="#9A7010" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M26 49 Q30 52.5 34 49" stroke="#FFD700" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* Ring shine */}
      <path d="M27.5 49.8 Q30 52.5 32.5 49.8" stroke="#FFFDE7" strokeWidth="0.8" fill="none"
        strokeLinecap="round" opacity="0">
        <animate attributeName="opacity" values="0;0.9;0" dur="2.8s" begin="1s" repeatCount="indefinite" />
      </path>

      {/* ── RUSH badge at coin bottom ── */}
      <rect x="18" y="53.5" width="24" height="7.5" rx="3.5" fill="#7A5800" />
      <rect x="18.8" y="54.2" width="22.4" height="6.1" rx="3" fill="#FFD700" />
      <text x="30" y="59.2" textAnchor="middle" fontSize="4.8" fontWeight="900"
        fill="#3A1A00" fontFamily="Arial, sans-serif" letterSpacing="0.5">RUSH</text>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
/* ── Trâu Kim Cương — Diamond Buffalo — orbiting sparkles, prismatic gem ── */
/* ══════════════════════════════════════════════════════════════════════════ */
function DiamondBuffalo({ size }: Props) {
  const s = size ?? 56;
  return (
    <svg width={s} height={s} viewBox="0 0 60 60" fill="none" overflow="visible">
      <defs>
        <linearGradient id="db2-crown" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#E0FFFF" />
          <stop offset="40%"  stopColor="#00E5FF" />
          <stop offset="100%" stopColor="#0097A7" />
        </linearGradient>
        <linearGradient id="db2-pav" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#0097A7" />
          <stop offset="100%" stopColor="#003040" />
        </linearGradient>
        <linearGradient id="db2-shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#FFFFFF00" />
          <stop offset="50%"  stopColor="#FFFFFF88" />
          <stop offset="100%" stopColor="#FFFFFF00" />
        </linearGradient>
        <linearGradient id="db2-facetL" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#00BCD4BB" />
          <stop offset="100%" stopColor="#006064BB" />
        </linearGradient>
        <linearGradient id="db2-facetR" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#00ACC1BB" />
          <stop offset="100%" stopColor="#004D5ABB" />
        </linearGradient>
        <radialGradient id="db2-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#00E5FF55" />
          <stop offset="100%" stopColor="#00000000" />
        </radialGradient>
        <filter id="db2-sparkle">
          <feGaussianBlur stdDeviation="0.8" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <clipPath id="db2-clip">
          <path d="M30 4 L54 22 L46 56 L14 56 L6 22 Z" />
        </clipPath>
      </defs>

      {/* Pulsing outer glow */}
      <ellipse cx="30" cy="32" rx="28" ry="28" fill="url(#db2-glow)">
        <animate attributeName="rx" values="24;30;24" dur="2.2s" repeatCount="indefinite"/>
        <animate attributeName="ry" values="24;30;24" dur="2.2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.5;1;0.5" dur="2.2s" repeatCount="indefinite"/>
      </ellipse>

      {/* ── Main diamond body ── */}
      {/* Table (top face) */}
      <path d="M30 4 L54 22 L46 56 L14 56 L6 22 Z" fill="url(#db2-crown)" stroke="#00E5FF" strokeWidth="1.2" />

      {/* Crown facets */}
      <path d="M30 4 L54 22 L30 22 Z"   fill="#E0FFFF" opacity="0.55" />
      <path d="M30 4 L6  22 L30 22 Z"   fill="#B2EBF2" opacity="0.45" />

      {/* Pavilion facets */}
      <path d="M30 22 L54 22 L46 56 Z"  fill="url(#db2-facetR)" />
      <path d="M30 22 L6  22 L14 56 Z"  fill="url(#db2-facetL)" />
      <path d="M30 22 L46 56 L14 56 Z"  fill="#003D4D" opacity="0.5" />

      {/* Internal reflection lines */}
      <line x1="30" y1="4"  x2="30" y2="56" stroke="#FFFFFF22" strokeWidth="0.7" />
      <line x1="6"  y1="22" x2="54" y2="22" stroke="#FFFFFF33" strokeWidth="0.7" />
      <line x1="14" y1="56" x2="54" y2="22" stroke="#FFFFFF18" strokeWidth="0.5" />
      <line x1="46" y1="56" x2="6"  y2="22" stroke="#FFFFFF18" strokeWidth="0.5" />
      <line x1="30" y1="4"  x2="46" y2="56" stroke="#FFFFFF12" strokeWidth="0.5" />
      <line x1="30" y1="4"  x2="14" y2="56" stroke="#FFFFFF12" strokeWidth="0.5" />

      {/* ── Buffalo silhouette inside the gem — clearly visible ── */}
      <g clipPath="url(#db2-clip)" opacity="0.75">
        {/* Buffalo head */}
        <ellipse cx="30" cy="32" rx="12" ry="11" fill="#003040" />
        {/* Massive horns */}
        <path d="M20 28 Q9 16 11 10 Q14 8 16 13 Q17 19 22 25"
          stroke="#001A26" strokeWidth="4.5" strokeLinecap="round" fill="none" />
        <path d="M40 28 Q51 16 49 10 Q46 8 44 13 Q43 19 38 25"
          stroke="#001A26" strokeWidth="4.5" strokeLinecap="round" fill="none" />
        {/* Muzzle */}
        <ellipse cx="30" cy="39" rx="8" ry="5.5" fill="#002030" />
        {/* Eyes — glowing white on dark */}
        <circle cx="24" cy="30" r="2.5" fill="#00E5FF" opacity="0.9" />
        <circle cx="36" cy="30" r="2.5" fill="#00E5FF" opacity="0.9" />
        <circle cx="24" cy="30" r="1.2" fill="#000" />
        <circle cx="36" cy="30" r="1.2" fill="#000" />
        <circle cx="23.5" cy="29.5" r="0.5" fill="#FFF" />
        <circle cx="35.5" cy="29.5" r="0.5" fill="#FFF" />
        {/* Nose ring gold */}
        <path d="M26 43 Q30 46 34 43" stroke="#FFD700" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>

      {/* ── Animated shimmer sweep across gem ── */}
      <rect x="-10" y="0" width="30" height="60" fill="url(#db2-shimmer)" opacity="0" transform="skewX(-20)">
        <animateTransform attributeName="transform" type="translate"
          values="-40 0;80 0;-40 0" dur="3s" repeatCount="indefinite" additive="sum" />
        <animate attributeName="opacity" values="0;0.6;0" dur="3s" repeatCount="indefinite" />
      </rect>

      {/* Girdle highlight line */}
      <path d="M6 22 Q30 16 54 22" stroke="#FFFFFF55" strokeWidth="0.8" fill="none" />

      {/* ── 4 Orbiting sparkle stars ── */}
      <g>
        <animateTransform attributeName="transform" type="rotate"
          from="0 30 30" to="360 30 30" dur="5s" repeatCount="indefinite" />
        {/* Top sparkle */}
        <g transform="translate(30, 1)" filter="url(#db2-sparkle)">
          <path d="M0 -4 L1 -1 L4 0 L1 1 L0 4 L-1 1 L-4 0 L-1 -1 Z" fill="#FFFFFF" />
          <circle cx="0" cy="0" r="1.5" fill="#B2EBF2" />
        </g>
        {/* Right sparkle */}
        <g transform="translate(59, 30)" filter="url(#db2-sparkle)">
          <path d="M0 -3 L0.8 -0.8 L3 0 L0.8 0.8 L0 3 L-0.8 0.8 L-3 0 L-0.8 -0.8 Z" fill="#FFFFFF" />
          <circle cx="0" cy="0" r="1.2" fill="#80DEEA" />
        </g>
      </g>
      {/* Offset second pair of sparkles (counter-rotating for more life) */}
      <g>
        <animateTransform attributeName="transform" type="rotate"
          from="180 30 30" to="540 30 30" dur="5s" repeatCount="indefinite" />
        <g transform="translate(30, 1)" filter="url(#db2-sparkle)">
          <path d="M0 -3.5 L0.9 -0.9 L3.5 0 L0.9 0.9 L0 3.5 L-0.9 0.9 L-3.5 0 L-0.9 -0.9 Z" fill="#E0FFFF" opacity="0.85" />
        </g>
        <g transform="translate(59, 30)" filter="url(#db2-sparkle)">
          <path d="M0 -2.5 L0.7 -0.7 L2.5 0 L0.7 0.7 L0 2.5 L-0.7 0.7 L-2.5 0 L-0.7 -0.7 Z" fill="#E0FFFF" opacity="0.85" />
        </g>
      </g>

      {/* Corner sparkle flares (static) */}
      <path d="M10 10 L11.5 7 L13 10 L16 11.5 L13 13 L11.5 16 L10 13 L7 11.5 Z" fill="#FFF" opacity="0.7">
        <animate attributeName="opacity" values="0.3;0.9;0.3" dur="1.8s" repeatCount="indefinite" />
      </path>
      <path d="M50 10 L51 8 L52 10 L54 11 L52 12 L51 14 L50 12 L48 11 Z" fill="#FFF" opacity="0.6">
        <animate attributeName="opacity" values="0.2;0.8;0.2" dur="1.8s" begin="0.6s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

/* ── Master export ───────────────────────────────────────────────────────── */
export function SymbolSVG({ id, size }: { id: SymbolId; size?: number }) {
  switch (id) {
    case SymbolId.DRAGON:  return <Dragon size={size} />;
    case SymbolId.TIGER:   return <Phoenix size={size} />;
    case SymbolId.PANDA:   return <Lotus size={size} />;
    case SymbolId.KOI:     return <Lantern size={size} />;
    case SymbolId.LOTUS:   return <Bamboo size={size} />;
    case SymbolId.COIN:    return <Pho size={size} />;
    case SymbolId.JADE:    return <Rice size={size} />;
    case SymbolId.WILD:    return <TigerWild size={size} />;
    case SymbolId.SCATTER: return <BronzeDrum size={size} />;
    case SymbolId.NUGGET:  return <Buffalo size={size} />;
    case SymbolId.SPECIAL: return <DiamondBuffalo size={size} />;
    default: return null;
  }
}
