/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#f5f7fa',
        panel: '#ffffff',
        panelAlt: '#f0f4f8',
        line: '#dce3eb',
        ink: '#111827',
        muted: '#64748b',
        accent: '#1d4ed8',
        gold: '#b45309',
        lime: '#047857',
        coral: '#dc2626',
        violet: '#4f46e5',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}
