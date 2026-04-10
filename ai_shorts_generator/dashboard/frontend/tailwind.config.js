/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg': '#080a0f',
        'surface': '#0e1118',
        'surface2': '#161b27',
        'accent': '#e8ff47',
        'accent2': '#ff4f6e',
        'text': '#f0f2f7',
        'muted': '#6b7280',
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        dm: ['DM Sans', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'drift': 'drift 12s ease-in-out infinite alternate',
        'pip-wave': 'pip-wave 1.4s ease infinite',
        'blink': 'blink 1.5s ease infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(232,255,71,0.18)' },
          '50%': { boxShadow: '0 0 20px 6px rgba(232,255,71,0.18)' },
        },
        'drift': {
          'from': { transform: 'translate(0, 0) scale(1)' },
          'to': { transform: 'translate(30px, 20px) scale(1.08)' },
        },
        'pip-wave': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.7' },
          '50%': { transform: 'scale(1.5)', opacity: '1' },
        },
        'blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
      },
    },
  },
  plugins: [],
}
