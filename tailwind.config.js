/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#06131f',
        panel: '#0d2030',
        panelAlt: '#10283b',
        line: '#21415b',
        ink: '#dbe8f5',
        muted: '#7f9ab2',
        accent: '#7dd3fc',
        gold: '#f5c451',
        lime: '#8ce99a',
        coral: '#ff8d7b',
        violet: '#81a1ff',
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(125, 211, 252, 0.18), 0 18px 45px rgba(0, 0, 0, 0.32)',
      },
    },
  },
  plugins: [],
}
