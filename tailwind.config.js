/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0F1115',      // Deep dark background
        panel: '#16191E',   // Slightly lighter panel
        panelAlt: '#1C2027', // Hover state for panel
        line: '#2A303C',    // Subtle borders
        ink: '#F8FAFC',     // Pure text
        muted: '#94A3B8',   // Muted text
        accent: '#3B82F6',  // Vivid blue accent
        gold: '#F59E0B',    // Premium gold accent
        lime: '#10B981',    // Success
        coral: '#EF4444',   // Error/Alert
        violet: '#8B5CF6',  // Secondary accent
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
