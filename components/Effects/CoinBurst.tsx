'use client';
import { useEffect, useState } from 'react';

interface Coin {
  id: number;
  angle: number;   // degrees
  distance: number; // px
  duration: number; // ms
  delay: number;    // ms
  size: number;     // px
  spin: number;     // rotations
}

function makeCoin(id: number): Coin {
  return {
    id,
    angle: Math.random() * 360,
    distance: 120 + Math.random() * 180,
    duration: 700 + Math.random() * 600,
    delay: Math.random() * 300,
    size: 18 + Math.random() * 16,
    spin: (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 4),
  };
}

export function CoinBurst({ active }: { active: boolean }) {
  const [coins, setCoins] = useState<Coin[]>([]);

  useEffect(() => {
    if (!active) { setCoins([]); return; }
    setCoins(Array.from({ length: 24 }, (_, i) => makeCoin(i)));
  }, [active]);

  if (!coins.length) return null;

  return (
    <div
      className="absolute pointer-events-none"
      style={{ top: '50%', left: '50%', zIndex: 201 }}
    >
      {coins.map(coin => {
        const rad = (coin.angle * Math.PI) / 180;
        const tx  = Math.cos(rad) * coin.distance;
        const ty  = Math.sin(rad) * coin.distance;

        return (
          <div
            key={coin.id}
            style={{
              position: 'absolute',
              fontSize: coin.size,
              lineHeight: 1,
              transform: 'translate(-50%, -50%)',
              animation: `coinfly-${coin.id} ${coin.duration}ms ${coin.delay}ms ease-out forwards`,
              '--tx': `${tx}px`,
              '--ty': `${ty}px`,
              '--spin': `${coin.spin * 360}deg`,
            } as React.CSSProperties}
          >
            🪙
            <style>{`
              @keyframes coinfly-${coin.id} {
                0%   { transform: translate(-50%, -50%) rotate(0deg) scale(0.3); opacity: 1; }
                70%  { opacity: 1; }
                100% { transform: translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) rotate(${coin.spin * 360}deg) scale(0.6); opacity: 0; }
              }
            `}</style>
          </div>
        );
      })}
    </div>
  );
}
