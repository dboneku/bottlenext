/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0A0E1A',      // Dark Navy
        panel: '#161E2E',   // Navy Panel
        panelAlt: '#1F2937', // Slightly lighter navy
        line: '#2D3748',    // Subtle borders
        ink: '#E2E8F0',     // Light gray-blue text
        muted: '#94A3B8',   // Muted text
        accent: '#FDFBF7',  // Light Cream White
        royal: '#1E40AF',   // Royal Blue
        slate: '#334155',   // Slate
        lime: '#10B981',    // Success
        coral: '#EF4444',   // Error/Alert
        violet: '#6366F1',  // Secondary accent
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Menlo', 'monospace'],
      },
      boxShadow: {
        card: '0 4px 20px -2px rgba(0, 0, 0, 0.4), 0 0 3px rgba(255,255,255,0.05) inset',
        glow: '0 0 20px rgba(59, 130, 246, 0.5)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.4s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
