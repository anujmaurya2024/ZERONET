/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8FAFC',
        primary: '#4F46E5',
        accent: '#22C55E',
        text: '#1E293B',
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
    },
  },
  plugins: [],
};
