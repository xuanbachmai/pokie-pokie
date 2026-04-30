'use client';

/* ══════════════════════════════════════════════════════════════════════════════
   Mekong Delta — photorealistic dusk scene
   Philosophy: heavy atmospheric blur, displacement-mapped water, film grain,
   cinematic color grade, zero hard edges, depth-of-field on foreground.
   ══════════════════════════════════════════════════════════════════════════════ */

export function DeltaBackground() {
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}
    >
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        style={{ width: '100%', height: '100%', display: 'block' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* ── Animated water displacement ── */}
          <filter id="ripple" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="turbulence" baseFrequency="0.016 0.028" numOctaves="4" seed="4" result="wn">
              <animate attributeName="seed" values="4;10;17;4" dur="16s" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="wn" scale="11" xChannelSelector="R" yChannelSelector="G" />
          </filter>

          {/* ── Film grain ── */}
          <filter id="grain" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="linearRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.64 0.60" numOctaves="2" stitchTiles="stitch" result="g" />
            <feColorMatrix type="saturate" values="0" in="g" result="gg" />
            <feBlend in="SourceGraphic" in2="gg" mode="overlay" result="out" />
            <feComposite in="out" in2="SourceGraphic" operator="in" />
          </filter>

          {/* ── Gaussian blur helpers ── */}
          <filter id="b2"  x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2"  /></filter>
          <filter id="b5"  x="-25%" y="-25%" width="150%" height="150%"><feGaussianBlur stdDeviation="5"  /></filter>
          <filter id="b12" x="-35%" y="-35%" width="170%" height="170%"><feGaussianBlur stdDeviation="12" /></filter>
          <filter id="b24" x="-45%" y="-45%" width="190%" height="190%"><feGaussianBlur stdDeviation="24" /></filter>
          <filter id="b48" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="48" /></filter>

          {/* ── Gradients ── */}

          {/* Photographic dusk sky — deep indigo at top, warm amber/orange at horizon */}
          <linearGradient id="duskSky" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#03010E" />
            <stop offset="10%"  stopColor="#0A031C" />
            <stop offset="26%"  stopColor="#240A22" />
            <stop offset="44%"  stopColor="#521418" />
            <stop offset="60%"  stopColor="#8E3014" />
            <stop offset="74%"  stopColor="#BB5C18" />
            <stop offset="87%"  stopColor="#D07820" />
            <stop offset="100%" stopColor="#C46418" />
          </linearGradient>

          {/* Wide horizon glow — photographic sun bloom */}
          <radialGradient id="hBloom" cx="50%" cy="100%" r="68%">
            <stop offset="0%"   stopColor="#FFD840" stopOpacity="0.98" />
            <stop offset="9%"   stopColor="#FF8C00" stopOpacity="0.78" />
            <stop offset="26%"  stopColor="#CC3800" stopOpacity="0.42" />
            <stop offset="50%"  stopColor="#7A0018" stopOpacity="0.16" />
            <stop offset="78%"  stopColor="#3A000E" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0"    />
          </radialGradient>

          {/* Moon halo */}
          <radialGradient id="moonHalo" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#FFFCE0" stopOpacity="0.9"  />
            <stop offset="42%"  stopColor="#F0D880" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#D0A000" stopOpacity="0"    />
          </radialGradient>

          {/* Dark reflective water */}
          <linearGradient id="river" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#162636" />
            <stop offset="18%"  stopColor="#0E1C2C" />
            <stop offset="55%"  stopColor="#080C1A" />
            <stop offset="100%" stopColor="#030508" />
          </linearGradient>

          {/* Gold reflection streak */}
          <linearGradient id="goldRefl" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#D08800" stopOpacity="0.82" />
            <stop offset="30%"  stopColor="#A06600" stopOpacity="0.45" />
            <stop offset="70%"  stopColor="#704800" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#402800" stopOpacity="0"    />
          </linearGradient>

          {/* Bank vegetation */}
          <linearGradient id="bankL" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#16280E" />
            <stop offset="50%"  stopColor="#0C1808" />
            <stop offset="100%" stopColor="#050A04" />
          </linearGradient>

          {/* Horizon atmospheric mist */}
          <linearGradient id="mist" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#C05818" stopOpacity="0"    />
            <stop offset="35%"  stopColor="#B05018" stopOpacity="0.26" />
            <stop offset="65%"  stopColor="#905E14" stopOpacity="0.2"  />
            <stop offset="100%" stopColor="#704808" stopOpacity="0"    />
          </linearGradient>

          {/* Cinematic vignette */}
          <radialGradient id="vig" cx="50%" cy="50%" r="70%">
            <stop offset="0%"   stopColor="#000000" stopOpacity="0"    />
            <stop offset="55%"  stopColor="#000000" stopOpacity="0.12" />
            <stop offset="82%"  stopColor="#000000" stopOpacity="0.52" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.82" />
          </radialGradient>
        </defs>

        {/* ══════════════════════════════════════════════
            1 · SKY BASE
        ══════════════════════════════════════════════ */}
        <rect width="1440" height="900" fill="url(#duskSky)" />

        {/* ══════════════════════════════════════════════
            2 · STARS  (upper sky, faint)
        ══════════════════════════════════════════════ */}
        {([
          [82,20,1.1,0.65],[198,36,0.8,0.5],[355,14,1.0,0.6],[492,40,0.9,0.55],
          [618,16,1.2,0.68],[758,33,0.7,0.48],[902,20,1.0,0.58],[1048,38,0.85,0.52],
          [1172,15,1.1,0.62],[1315,30,0.8,0.48],[1400,22,0.9,0.55],
          [135,82,0.7,0.42],[308,98,1.0,0.58],[472,84,0.8,0.46],[662,104,0.7,0.42],
          [848,90,1.1,0.56],[1028,85,0.8,0.44],[1212,98,0.9,0.52],[1392,86,0.7,0.38],
          [228,145,0.8,0.38],[518,162,0.9,0.48],[792,148,0.7,0.36],[1062,156,0.8,0.42],[1325,144,0.7,0.34],
        ] as [number,number,number,number][]).map(([x,y,r,o], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill="#FFF6E0" opacity={o} />
        ))}

        {/* ══════════════════════════════════════════════
            3 · MOON
        ══════════════════════════════════════════════ */}
        {/* Outer halo bloom */}
        <circle cx="238" cy="168" r="120" fill="url(#moonHalo)" filter="url(#b48)" />
        <circle cx="238" cy="168" r="72"  fill="#FFFCE0" opacity="0.14" filter="url(#b24)" />
        {/* Moon disc */}
        <circle cx="238" cy="168" r="43"  fill="#FFF6CC" opacity="0.93" />
        <circle cx="238" cy="168" r="39"  fill="#FFFAE0" opacity="0.97" />
        {/* Mare-like tonal variation */}
        <circle cx="225" cy="160" r="9"   fill="#E8D098" opacity="0.2"  />
        <circle cx="255" cy="178" r="5.5" fill="#E8D098" opacity="0.15" />
        <circle cx="232" cy="188" r="3.5" fill="#E8D098" opacity="0.12" />

        {/* ══════════════════════════════════════════════
            4 · HORIZON BLOOM  (large radial glow)
        ══════════════════════════════════════════════ */}
        <ellipse cx="720" cy="545" rx="920" ry="350" fill="url(#hBloom)" />

        {/* Atmospheric scattering bands */}
        <ellipse cx="720" cy="450" rx="740" ry="52" fill="#FF4400" opacity="0.04" filter="url(#b24)" />
        <ellipse cx="720" cy="488" rx="640" ry="44" fill="#FF6600" opacity="0.05" filter="url(#b24)" />
        <ellipse cx="720" cy="518" rx="560" ry="36" fill="#FF8800" opacity="0.055" filter="url(#b12)" />

        {/* ══════════════════════════════════════════════
            5 · SUN  (just at/below horizon)
        ══════════════════════════════════════════════ */}
        <ellipse cx="720" cy="543" rx="105" ry="88" fill="#FFB000" opacity="0.1"  filter="url(#b48)" />
        <ellipse cx="720" cy="543" rx="58"  ry="48" fill="#FFD800" opacity="0.22" filter="url(#b24)" />
        <ellipse cx="720" cy="543" rx="28"  ry="22" fill="#FFF0A0" opacity="0.92" filter="url(#b2)"  />
        <ellipse cx="720" cy="543" rx="18"  ry="14" fill="#FFFDE8" opacity="0.99" />

        {/* ══════════════════════════════════════════════
            6 · CLOUD MASSES
            Key: very heavy blur → photo-like density
        ══════════════════════════════════════════════ */}
        {/* Background far haze (b48) */}
        <ellipse cx="560"  cy="330" rx="295" ry="75" fill="#08040A" filter="url(#b48)" opacity="0.88" />
        <ellipse cx="1040" cy="305" rx="320" ry="78" fill="#08040A" filter="url(#b48)" opacity="0.82" />

        {/* Primary left cloud */}
        <ellipse cx="418"  cy="278" rx="240" ry="74" fill="#0E060C" filter="url(#b24)" opacity="0.84" />
        <ellipse cx="452"  cy="252" rx="195" ry="55" fill="#160A12" filter="url(#b12)" opacity="0.72" />
        <ellipse cx="330"  cy="300" rx="158" ry="46" fill="#0C0608" filter="url(#b12)" opacity="0.68" />
        <ellipse cx="492"  cy="238" rx="148" ry="40" fill="#1A0C16" filter="url(#b12)" opacity="0.56" />
        {/* Sunset-lit underside — orange-red glow bleeds into cloud base */}
        <ellipse cx="418"  cy="248" rx="218" ry="25" fill="#982E08" opacity="0.19" filter="url(#b24)" />
        <ellipse cx="348"  cy="272" rx="135" ry="16" fill="#B03C10" opacity="0.14" filter="url(#b12)" />
        <ellipse cx="482"  cy="260" rx="162" ry="13" fill="#A03410" opacity="0.12" filter="url(#b12)" />

        {/* Primary right cloud */}
        <ellipse cx="1088" cy="260" rx="258" ry="76" fill="#0C0608" filter="url(#b24)" opacity="0.8"  />
        <ellipse cx="1138" cy="235" rx="205" ry="57" fill="#160A12" filter="url(#b12)" opacity="0.68" />
        <ellipse cx="1260" cy="276" rx="168" ry="47" fill="#0C0608" filter="url(#b12)" opacity="0.62" />
        <ellipse cx="1088" cy="232" rx="235" ry="23" fill="#982E08" opacity="0.17" filter="url(#b24)" />
        <ellipse cx="1200" cy="250" rx="148" ry="14" fill="#A03410" opacity="0.13" filter="url(#b12)" />

        {/* Thin centre horizon streak */}
        <ellipse cx="720"  cy="352" rx="335" ry="33" fill="#0C0408" opacity="0.5"  filter="url(#b24)" />
        <ellipse cx="720"  cy="345" rx="285" ry="19" fill="#7A2408" opacity="0.1"  filter="url(#b12)" />

        {/* ══════════════════════════════════════════════
            7 · DISTANT TREELINE / FAR BANK
        ══════════════════════════════════════════════ */}
        {/* Hazy silhouette — blurred so it looks miles away */}
        <path
          d="M0,528 Q90,518 190,521 Q290,524 395,516 Q492,509 592,514 Q672,518 722,513
             Q778,508 875,512 Q972,516 1068,508 Q1168,500 1268,506 Q1358,511 1440,507
             L1440,554 L0,554 Z"
          fill="#0A1006" filter="url(#b5)"
        />
        {/* Warm glow bleeding onto far bank top */}
        <path
          d="M0,527 Q360,519 720,514 Q1080,509 1440,514 L1440,534 L0,534 Z"
          fill="#8B3810" opacity="0.09" filter="url(#b24)"
        />

        {/* ══════════════════════════════════════════════
            8 · DISTANT PALM SILHOUETTES  (b2 — atmospheric haze)
        ══════════════════════════════════════════════ */}
        {([
          [90,526,0.50],[196,521,0.63],[322,517,0.55],[438,515,0.61],
          [556,516,0.53],[668,513,0.66],[780,512,0.59],[895,514,0.69],
          [1005,511,0.56],[1115,509,0.63],[1230,511,0.61],[1345,514,0.53],[1420,513,0.48],
        ] as [number,number,number][]).map(([bx,by,sc], ti) => {
          const h = 44*sc, cx = bx+5*sc, cy = by-h;
          const fangs = [-78,-50,-22,8,38,62,86];
          const fLen  = 18*sc;
          return (
            <g key={ti} opacity="0.86" filter="url(#b2)">
              <path d={`M${bx},${by} Q${bx+4*sc},${by-h*0.5} ${cx},${cy}`}
                stroke="#0A1506" strokeWidth={2*sc} fill="none" strokeLinecap="round" />
              {fangs.map((ang, fi) => {
                const rad = (ang-90)*Math.PI/180;
                const ex  = cx+fLen*Math.cos(rad), ey = cy+fLen*Math.sin(rad);
                const qx  = cx+fLen*0.5*Math.cos(rad)+2.5*sc*Math.sin(rad);
                const qy  = cy+fLen*0.5*Math.sin(rad)+3.5*sc;
                return <path key={fi}
                  d={`M${cx.toFixed(1)},${cy.toFixed(1)} Q${qx.toFixed(1)},${qy.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}`}
                  stroke="#0A1506" strokeWidth={0.9*sc} fill="none" strokeLinecap="round" />;
              })}
            </g>
          );
        })}

        {/* ══════════════════════════════════════════════
            9 · RIVER  (dark reflective water body)
        ══════════════════════════════════════════════ */}
        <path d="M0,542 Q360,535 720,542 Q1080,549 1440,537 L1440,900 L0,900 Z"
          fill="url(#river)" />

        {/* ══════════════════════════════════════════════
            10 · WATER DISPLACEMENT LAYER
             Gives the animated ripple/chop look
        ══════════════════════════════════════════════ */}
        <rect x="0" y="542" width="1440" height="80"
          fill="#223448" opacity="0.14" filter="url(#ripple)" />

        {/* ══════════════════════════════════════════════
            11 · SUN REFLECTION IN WATER
        ══════════════════════════════════════════════ */}
        {/* Wide diffuse bloom */}
        <path d="M455,542 Q588,608 660,730 Q696,820 708,900 L732,900 Q744,820 780,730 Q852,608 985,542 Z"
          fill="url(#goldRefl)" opacity="0.48" />
        {/* Bright core column */}
        <path d="M692,542 Q705,590 711,702 Q717,802 719,900 L721,900 Q723,802 729,702 Q735,590 748,542 Z"
          fill="url(#goldRefl)" opacity="0.94" />
        {/* Hot specular on surface */}
        <ellipse cx="720" cy="548" rx="34" ry="10" fill="#FFD840" opacity="0.6" filter="url(#b5)"  />
        <ellipse cx="720" cy="550" rx="16" ry="5"  fill="#FFFCE0" opacity="0.52" />

        {/* Scattered water sparkles */}
        {([
          [428,564,3.5,2,0.26],[505,573,3,1.8,0.2],[590,560,2.5,1.5,0.17],[652,568,3,1.8,0.19],
          [818,565,3,1.8,0.19],[882,574,3.5,2,0.23],[958,558,2.5,1.5,0.17],[1048,567,3,2,0.2],
          [1152,561,2.5,1.5,0.15],[1242,570,3,1.8,0.17],
        ] as [number,number,number,number,number][]).map(([x,y,rx,ry,o], i) => (
          <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill="#FFD060" opacity={o} filter="url(#b2)" />
        ))}

        {/* Animated shimmer lines */}
        {([550, 565, 580] as number[]).map((y, i) => (
          <path key={i}
            d={`M385,${y} Q582,${y-5} 720,${y} Q858,${y+5} 1055,${y}`}
            stroke="#FFE050" strokeWidth="1.3" fill="none" opacity="0">
            <animate attributeName="opacity"
              values="0;0.3;0" dur={`${3.8+i*1.1}s`} begin={`${i*1.5}s`} repeatCount="indefinite" />
          </path>
        ))}

        {/* ══════════════════════════════════════════════
            12 · BANKS  (rice paddies — dark olive green)
        ══════════════════════════════════════════════ */}
        {/* Left bank */}
        <path d="M0,572 Q55,562 112,566 Q166,556 224,562 Q282,554 340,568 L334,900 L0,900 Z"
          fill="url(#bankL)" />
        {([598,617,637,657,677,698,718,740,762,786,810,836,863,892] as number[]).map((y,i) => (
          <path key={i}
            d={`M0,${y} Q${62+i*2},${y-3} 124,${y} Q${188+i*2},${y+2} 248,${y} Q${308+i*2},${y-2} 334,${y}`}
            stroke="#244A1C" strokeWidth="0.85" fill="none" opacity="0.28" />
        ))}
        {([34,84,140,198,262,318] as number[]).map((x,i) => (
          <line key={i} x1={x} y1={582+i*4} x2={x} y2={900}
            stroke="#183A52" strokeWidth={i%2===0?3:2} opacity="0.38" />
        ))}

        {/* Right bank */}
        <path d="M1102,558 Q1168,549 1238,553 Q1308,546 1378,551 Q1415,554 1440,550 L1440,900 L1090,900 Z"
          fill="url(#bankL)" />
        {([592,611,632,652,672,692,712,734,756,780,805,832] as number[]).map((y,i) => (
          <path key={i}
            d={`M1090,${y} Q${1168+i*2},${y-3} 1252,${y} Q${1330+i*2},${y+2} 1440,${y}`}
            stroke="#244A1C" strokeWidth="0.85" fill="none" opacity="0.26" />
        ))}
        {([1148,1218,1288,1358,1418] as number[]).map((x,i) => (
          <line key={i} x1={x} y1={566+i*4} x2={x} y2={900}
            stroke="#183A52" strokeWidth={i%2===0?2.5:2} opacity="0.34" />
        ))}

        {/* ══════════════════════════════════════════════
            13 · FOREGROUND PALMS — LEFT
            (b2 depth-of-field, ring scars on trunk)
        ══════════════════════════════════════════════ */}

        {/* L1 — tallest, leans gently right */}
        <g filter="url(#b2)" opacity="0.96">
          <path d="M28,900 Q46,778 64,658 Q75,590 85,544"
            stroke="#0A1606" strokeWidth="14" strokeLinecap="round" fill="none" />
          <path d="M28,900 Q46,778 64,658 Q75,590 85,544"
            stroke="#142A0A" strokeWidth="7"  strokeLinecap="round" fill="none" opacity="0.5" />
          {([818,738,658,578] as number[]).map((y,i) => (
            <path key={i}
              d={`M${27+i*4},${y} Q${50+i*3},${y-2} ${73+i*3},${y+1}`}
              stroke="#080E06" strokeWidth="2" fill="none" opacity="0.38" />
          ))}
          {([[-84,36],[-56,40],[-24,44],[8,48],[38,44],[65,38],[89,30]] as [number,number][]).map(([ang,len],fi) => {
            const rad=(ang-90)*Math.PI/180;
            const ex=85+len*Math.cos(rad), ey=544+len*Math.sin(rad);
            const qx=85+len*0.52*Math.cos(rad)+5*Math.sin(rad);
            const qy=544+len*0.52*Math.sin(rad)+8;
            return <path key={fi}
              d={`M85,544 Q${qx.toFixed(1)},${qy.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}`}
              stroke="#0A1606" strokeWidth={fi<2||fi>5?1.8:2.2} fill="none" strokeLinecap="round" />;
          })}
        </g>

        {/* L2 — shorter, slight left lean */}
        <g filter="url(#b2)" opacity="0.93">
          <path d="M150,900 Q160,798 156,693 Q152,630 148,588"
            stroke="#0A1606" strokeWidth="11" strokeLinecap="round" fill="none" />
          <path d="M150,900 Q160,798 156,693 Q152,630 148,588"
            stroke="#142A0A" strokeWidth="5.5" strokeLinecap="round" fill="none" opacity="0.5" />
          {([808,728,648,578] as number[]).map((y,i) => (
            <path key={i}
              d={`M${148+i*2},${y} Q${160+i*2},${y-2} ${173+i*2},${y+1}`}
              stroke="#080E06" strokeWidth="1.8" fill="none" opacity="0.36" />
          ))}
          {([[-88,32],[-60,36],[-28,40],[6,44],[36,40],[65,34],[88,26]] as [number,number][]).map(([ang,len],fi) => {
            const rad=(ang-90)*Math.PI/180;
            const ex=148+len*Math.cos(rad), ey=588+len*Math.sin(rad);
            const qx=148+len*0.52*Math.cos(rad)+4.5*Math.sin(rad);
            const qy=588+len*0.52*Math.sin(rad)+7;
            return <path key={fi}
              d={`M148,588 Q${qx.toFixed(1)},${qy.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}`}
              stroke="#0A1606" strokeWidth={fi<2||fi>5?1.6:2.0} fill="none" strokeLinecap="round" />;
          })}
        </g>

        {/* L3 — shorter, mid-left */}
        <g filter="url(#b2)" opacity="0.89">
          <path d="M262,900 Q272,813 265,728 Q260,670 256,640"
            stroke="#0A1606" strokeWidth="9" strokeLinecap="round" fill="none" />
          {([[-82,28],[-54,32],[-24,36],[8,38],[38,34],[68,28]] as [number,number][]).map(([ang,len],fi) => {
            const rad=(ang-90)*Math.PI/180;
            const ex=256+len*Math.cos(rad), ey=640+len*Math.sin(rad);
            const qx=256+len*0.52*Math.cos(rad)+4*Math.sin(rad);
            const qy=640+len*0.52*Math.sin(rad)+6;
            return <path key={fi}
              d={`M256,640 Q${qx.toFixed(1)},${qy.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}`}
              stroke="#0A1606" strokeWidth={1.5} fill="none" strokeLinecap="round" />;
          })}
        </g>

        {/* ══════════════════════════════════════════════
            14 · FOREGROUND PALMS — RIGHT
        ══════════════════════════════════════════════ */}

        {/* R1 */}
        <g filter="url(#b2)" opacity="0.96">
          <path d="M1412,900 Q1394,778 1376,658 Q1365,590 1355,544"
            stroke="#0A1606" strokeWidth="14" strokeLinecap="round" fill="none" />
          <path d="M1412,900 Q1394,778 1376,658 Q1365,590 1355,544"
            stroke="#142A0A" strokeWidth="7"  strokeLinecap="round" fill="none" opacity="0.5" />
          {([818,738,658,578] as number[]).map((y,i) => (
            <path key={i}
              d={`M${1412-i*4},${y} Q${1388-i*3},${y-2} ${1366-i*3},${y+1}`}
              stroke="#080E06" strokeWidth="2" fill="none" opacity="0.38" />
          ))}
          {([[-94,36],[-66,40],[-34,44],[-4,48],[28,44],[58,38],[84,30]] as [number,number][]).map(([ang,len],fi) => {
            const rad=(ang-90)*Math.PI/180;
            const ex=1355+len*Math.cos(rad), ey=544+len*Math.sin(rad);
            const qx=1355+len*0.52*Math.cos(rad)+5*Math.sin(rad);
            const qy=544+len*0.52*Math.sin(rad)+8;
            return <path key={fi}
              d={`M1355,544 Q${qx.toFixed(1)},${qy.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}`}
              stroke="#0A1606" strokeWidth={fi<2||fi>5?1.8:2.2} fill="none" strokeLinecap="round" />;
          })}
        </g>

        {/* R2 */}
        <g filter="url(#b2)" opacity="0.93">
          <path d="M1290,900 Q1278,798 1282,693 Q1285,630 1290,588"
            stroke="#0A1606" strokeWidth="11" strokeLinecap="round" fill="none" />
          <path d="M1290,900 Q1278,798 1282,693 Q1285,630 1290,588"
            stroke="#142A0A" strokeWidth="5.5" strokeLinecap="round" fill="none" opacity="0.5" />
          {([[-90,32],[-62,36],[-30,40],[4,44],[34,40],[63,34],[86,26]] as [number,number][]).map(([ang,len],fi) => {
            const rad=(ang-90)*Math.PI/180;
            const ex=1290+len*Math.cos(rad), ey=588+len*Math.sin(rad);
            const qx=1290+len*0.52*Math.cos(rad)+4.5*Math.sin(rad);
            const qy=588+len*0.52*Math.sin(rad)+7;
            return <path key={fi}
              d={`M1290,588 Q${qx.toFixed(1)},${qy.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}`}
              stroke="#0A1606" strokeWidth={fi<2||fi>5?1.6:2.0} fill="none" strokeLinecap="round" />;
          })}
        </g>

        {/* R3 */}
        <g filter="url(#b2)" opacity="0.89">
          <path d="M1180,900 Q1170,813 1174,728 Q1178,670 1182,640"
            stroke="#0A1606" strokeWidth="9" strokeLinecap="round" fill="none" />
          {([[-86,28],[-58,32],[-26,36],[6,38],[36,34],[66,28]] as [number,number][]).map(([ang,len],fi) => {
            const rad=(ang-90)*Math.PI/180;
            const ex=1182+len*Math.cos(rad), ey=640+len*Math.sin(rad);
            const qx=1182+len*0.52*Math.cos(rad)+4*Math.sin(rad);
            const qy=640+len*0.52*Math.sin(rad)+6;
            return <path key={fi}
              d={`M1182,640 Q${qx.toFixed(1)},${qy.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}`}
              stroke="#0A1606" strokeWidth={1.5} fill="none" strokeLinecap="round" />;
          })}
        </g>

        {/* ══════════════════════════════════════════════
            15 · SAMPAN BOATS
        ══════════════════════════════════════════════ */}

        {/* Boat 1 — centre-left */}
        <g transform="translate(488,550)">
          <path d="M-50,10 Q-40,20 0,22 Q40,20 50,10 Q40,3 0,1 Q-40,3 -50,10 Z"
            fill="#1C1008" stroke="#28180C" strokeWidth="1" />
          <path d="M-22,1 Q-18,-13 0,-17 Q18,-13 22,1 Z" fill="#2C1A0E" />
          {([-14,-7,0,7,14] as number[]).map((x,i) => (
            <path key={i} d={`M${x},1 Q${x*0.9},-13 0,-17`}
              stroke="#3A2218" strokeWidth="0.55" fill="none" opacity="0.5" />
          ))}
          <ellipse cx="-30" cy="5" rx="4" ry="4.5" fill="#100804" />
          <path d="M-30,1 L-30,-8" stroke="#100804" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M-34.5,-8 Q-30,-15 -25.5,-8 Z" fill="#1C1008" />
          <path d="M-36,3 L-52,13" stroke="#281C0A" strokeWidth="1.3" strokeLinecap="round" />
          <ellipse cx="-53" cy="14" rx="2.5" ry="1.8" fill="#281C0A" transform="rotate(-30,-53,14)" />
          <path d="M-50,22 Q0,30 50,22"   stroke="#A86C00" strokeWidth="0.7" fill="none" opacity="0.38" />
          <path d="M-42,25 Q0,35 42,25"   stroke="#A86C00" strokeWidth="0.5" fill="none" opacity="0.22" />
        </g>

        {/* Boat 2 — right of centre, with sail */}
        <g transform="translate(958,552)">
          <path d="M-42,9 Q-33,17 0,19 Q33,17 42,9 Q33,2 0,0 Q-33,2 -42,9 Z"
            fill="#1C1008" stroke="#28180C" strokeWidth="0.9" />
          <path d="M-18,0 Q-12,-12 0,-15 Q12,-12 18,0 Z" fill="#2C1A0E" />
          {([-12,-5,0,5,12] as number[]).map((x,i) => (
            <path key={i} d={`M${x},0 Q${x*0.9},-11 0,-15`}
              stroke="#3A2218" strokeWidth="0.5" fill="none" opacity="0.45" />
          ))}
          <path d="M20,-1 L20,-26" stroke="#3C2C14" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M20,-26 L37,-6 L20,-1 Z" fill="#504020" opacity="0.82" />
          <path d="M20,-26 Q30,-17 37,-6" stroke="#483818" strokeWidth="0.65" fill="none" opacity="0.55" />
          <ellipse cx="-24" cy="5" rx="3.8" ry="4.2" fill="#100804" />
          <path d="M-24,1 L-24,-7" stroke="#100804" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M-28,-7 Q-24,-13 -20,-7 Z" fill="#1C1008" />
          <path d="M-42,19 Q0,27 42,19" stroke="#A86C00" strokeWidth="0.6" fill="none" opacity="0.35" />
        </g>

        {/* Boat 3 — far right, small/distant */}
        <g transform="translate(1228,546) scale(0.7)" opacity="0.8">
          <path d="M-36,8 Q-28,15 0,16 Q28,15 36,8 Q28,1 0,0 Q-28,1 -36,8 Z" fill="#1C1008" />
          <path d="M-16,0 Q-10,-10 0,-13 Q10,-10 16,0 Z" fill="#2C1A0E" />
          <path d="M15,-1 L15,-22" stroke="#3C2C14" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M15,-22 L30,-4 L15,-1 Z" fill="#504020" opacity="0.74" />
          <path d="M-36,16 Q0,23 36,16" stroke="#A86C00" strokeWidth="0.5" fill="none" opacity="0.28" />
        </g>

        {/* Boat 4 — far left, small */}
        <g transform="translate(184,558) scale(0.58)" opacity="0.74">
          <path d="M-34,7 Q-26,14 0,15 Q26,14 34,7 Q26,1 0,0 Q-26,1 -34,7 Z" fill="#1C1008" />
          <path d="M-14,0 Q-9,-9 0,-11 Q9,-9 14,0 Z" fill="#2C1A0E" />
          <path d="M-34,15 Q0,22 34,15" stroke="#A86C00" strokeWidth="0.5" fill="none" opacity="0.22" />
        </g>

        {/* ══════════════════════════════════════════════
            16 · WATER EDGE VEGETATION
        ══════════════════════════════════════════════ */}
        {([
          [330,568,-12],[346,563,8],[360,570,-5],[374,576,15],[384,572,-8],
          [308,574,20],[320,580,-15],[340,583,5],
        ] as [number,number,number][]).map(([x,y,rot],i) => (
          <g key={i} transform={`translate(${x},${y}) rotate(${rot})`} opacity="0.76">
            <ellipse cx="0"  cy="0"  rx="7"   ry="5"   fill="#1C4A12" />
            <ellipse cx="-3" cy="2"  rx="5"   ry="3.5" fill="#285A16" opacity="0.58" />
            <circle  cx="0"  cy="-6" r="3"             fill="#62287A" opacity="0.6"  />
            <circle  cx="0"  cy="-6" r="1.5"           fill="#CCA800" opacity="0.72" />
          </g>
        ))}
        {([
          [1062,572,10],[1078,566,-8],[1092,574,5],[1106,570,-12],[1118,576,8],
          [1050,578,-5],[1040,568,18],[1032,578,-10],
        ] as [number,number,number][]).map(([x,y,rot],i) => (
          <g key={i} transform={`translate(${x},${y}) rotate(${rot})`} opacity="0.73">
            <ellipse cx="0" cy="0"  rx="7"   ry="5"   fill="#1C4A12" />
            <ellipse cx="3" cy="2"  rx="5"   ry="3.5" fill="#285A16" opacity="0.55" />
            <circle  cx="0" cy="-6" r="2.8"            fill="#62287A" opacity="0.58" />
            <circle  cx="0" cy="-6" r="1.4"            fill="#CCA800" opacity="0.68" />
          </g>
        ))}

        {/* ══════════════════════════════════════════════
            17 · HORIZON MIST  (atmospheric depth layer)
        ══════════════════════════════════════════════ */}
        <rect x="0" y="522" width="1440" height="58" fill="url(#mist)" filter="url(#b12)" />
        <line x1="0" y1="542" x2="1440" y2="542" stroke="#CC7224" strokeWidth="0.85" opacity="0.38" />

        {/* ══════════════════════════════════════════════
            18 · FILM GRAIN  (photographic texture)
        ══════════════════════════════════════════════ */}
        <rect width="1440" height="900" fill="#808080" opacity="0.022" filter="url(#grain)" />

        {/* ══════════════════════════════════════════════
            19 · COLOUR GRADE
            Warm highlight tint + cool shadow fill
        ══════════════════════════════════════════════ */}
        <rect width="1440" height="900"    fill="#7A2800" opacity="0.032" />
        <rect x="0" y="555" width="1440" height="345" fill="#00004E" opacity="0.04" />

        {/* ══════════════════════════════════════════════
            20 · CINEMATIC VIGNETTE
        ══════════════════════════════════════════════ */}
        <rect width="1440" height="900" fill="url(#vig)" />

        {/* ══════════════════════════════════════════════
            21 · UI READABILITY OVERLAY
        ══════════════════════════════════════════════ */}
        <rect width="1440" height="900" fill="#000000" opacity="0.44" />
      </svg>
    </div>
  );
}
