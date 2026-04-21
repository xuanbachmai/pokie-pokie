import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        crimson: {
          DEFAULT: "#DC143C",
          dark: "#8B0000",
          light: "#FF4D6D",
        },
        gold: {
          DEFAULT: "#FFD700",
          dark: "#B8860B",
          light: "#FFE866",
        },
        jade: {
          DEFAULT: "#00A86B",
          dark: "#004D33",
          light: "#00D187",
        },
        obsidian: {
          DEFAULT: "#0D0D0D",
          light: "#1A1A2E",
          mid: "#16213E",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      backgroundImage: {
        "asian-gradient": "linear-gradient(135deg, #0D0D0D 0%, #1A0A0A 50%, #0D0D0D 100%)",
        "gold-gradient": "linear-gradient(90deg, #B8860B, #FFD700, #B8860B)",
        "crimson-gradient": "linear-gradient(90deg, #8B0000, #DC143C, #8B0000)",
      },
      boxShadow: {
        gold: "0 0 20px rgba(255,215,0,0.5)",
        crimson: "0 0 20px rgba(220,20,60,0.5)",
        jade: "0 0 20px rgba(0,168,107,0.5)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        pulse_gold: {
          "0%, 100%": { boxShadow: "0 0 10px rgba(255,215,0,0.3)" },
          "50%": { boxShadow: "0 0 30px rgba(255,215,0,0.8)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        shimmer: "shimmer 2s linear infinite",
        pulse_gold: "pulse_gold 1.5s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
