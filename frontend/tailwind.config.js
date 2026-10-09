/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* F1 Racing Theme */
        background: '#0a0a0a',
        surface: '#181818',
        'surface-2': '#222222',
        primary: '#e10600',      /* F1 Red */
        'primary-dark': '#a80400',
        accent: '#00d2ff',       /* Telemetry Cyan */
        'accent-green': '#39ff14', /* Pit lane green */
        gold: '#ffd700',
        text: '#f0f0f0',
        'text-muted': 'rgba(240,240,240,0.55)',
        'text-dim': 'rgba(240,240,240,0.3)',
        border: 'rgba(255,255,255,0.08)',
      },
      fontFamily: {
        orbitron: ['Orbitron', 'monospace'],
        inter: ['Inter', 'sans-serif'],
      },
      minHeight: {
        screen: '100vh',
        'screen-dynamic': '100dvh',
      },
      padding: {
        'safe-t': 'env(safe-area-inset-top)',
        'safe-r': 'env(safe-area-inset-right)',
        'safe-b': 'env(safe-area-inset-bottom)',
        'safe-l': 'env(safe-area-inset-left)',
      },
      boxShadow: {
        'f1-red': '0 0 12px rgba(225,6,0,0.4), 0 0 24px rgba(225,6,0,0.2)',
        'f1-cyan': '0 0 12px rgba(0,210,255,0.4), 0 0 24px rgba(0,210,255,0.2)',
        'f1-card': '0 4px 24px rgba(0,0,0,0.6)',
      },
      backgroundImage: {
        'carbon': `repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.015) 2px, rgba(255,255,255,0.015) 4px)`,
        'red-gradient': 'linear-gradient(135deg, #e10600 0%, #a80400 100%)',
        'dark-gradient': 'linear-gradient(180deg, #181818 0%, #0a0a0a 100%)',
      },
      animation: {
        'race-stripe': 'raceStripe 2.5s linear infinite',
        'blink-slow': 'telemetry-blink 1.5s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
