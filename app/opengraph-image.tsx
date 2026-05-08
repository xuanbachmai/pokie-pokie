import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Vietnam Maze — Pokies Simulator';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(160deg, #010e05 0%, #020E06 50%, #011408 100%)',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow orbs */}
        <div
          style={{
            position: 'absolute',
            top: 80,
            left: 120,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,192,122,0.18), transparent)',
            filter: 'blur(60px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 80,
            right: 120,
            width: 260,
            height: 260,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,215,0,0.14), transparent)',
            filter: 'blur(50px)',
          }}
        />

        {/* Symbol row */}
        <div style={{ display: 'flex', gap: 28, marginBottom: 28, fontSize: 56 }}>
          <span>🐕</span>
          <span>🐯</span>
          <span>🥁</span>
          <span>🐃</span>
          <span>💎</span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 88,
            fontWeight: 900,
            letterSpacing: '0.06em',
            background: 'linear-gradient(90deg, #00C07A, #FFD700, #00C07A)',
            backgroundClip: 'text',
            color: 'transparent',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: 16,
          }}
        >
          🌾 VIETNAM MAZE
        </div>

        {/* Divider */}
        <div
          style={{
            width: 560,
            height: 2,
            background: 'linear-gradient(90deg, transparent, rgba(0,192,122,0.5), transparent)',
            marginBottom: 24,
          }}
        />

        {/* Description */}
        <div
          style={{
            fontSize: 28,
            color: 'rgba(255,255,255,0.65)',
            letterSpacing: '0.04em',
            textAlign: 'center',
            maxWidth: 820,
            lineHeight: 1.5,
          }}
        >
          Vietnamese-themed pokies simulator · Progressive jackpots · Free spins · Buffalo Rush
        </div>

        {/* URL badge */}
        <div
          style={{
            marginTop: 36,
            padding: '10px 28px',
            borderRadius: 40,
            background: 'rgba(0,192,122,0.12)',
            border: '1.5px solid rgba(0,192,122,0.35)',
            color: '#00C07A',
            fontSize: 22,
            letterSpacing: '0.06em',
          }}
        >
          pokiespokies.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}
