import type { Metadata, Viewport } from 'next';
import { Bebas_Neue, Oswald } from 'next/font/google';
import './globals.css';

// Bebas Neue — tall condensed all-caps, classic pokie cabinet feel
const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-jackpot',
  display: 'swap',
});

// Oswald — slightly softer condensed for amounts/values
const oswald = Oswald({
  weight: ['600', '700'],
  subsets: ['latin'],
  variable: '--font-amount',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Vietnam Maze',
  description: 'Vietnamese-themed 5-reel slot machine with progressive jackpots, bonus games, and 3D effects',
  openGraph: {
    title: 'Vietnam Maze — Pokies Simulator',
    description: 'Vietnamese-themed pokies simulator · Progressive jackpots · Free spins · Buffalo Rush',
    url: 'https://pokiespokies.vercel.app',
    siteName: 'Vietnam Maze',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vietnam Maze — Pokies Simulator',
    description: 'Vietnamese-themed pokies simulator · Progressive jackpots · Free spins · Buffalo Rush',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${oswald.variable}`}>
      <body>{children}</body>
    </html>
  );
}
