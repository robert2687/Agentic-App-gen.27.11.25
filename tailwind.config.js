/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#38bdf8', // Sky 400 - brighter for dark mode
        'brand-secondary': '#64748b', // Slate 500
        'brand-background': '#0f172a', // Slate 900
        'brand-surface': '#1e293b', // Slate 800
        'brand-surface-light': '#334155', // Slate 700
        'brand-text-primary': '#f1f5f9', // Slate 100
        'brand-text-secondary': '#94a3b8', // Slate 400
        'accent-success': '#10b981',
        'accent-warning': '#f59e0b',
        'ide-bg': '#1e1e1e',
        'ide-sidebar': '#252526',
        'ide-border': '#3e3e42',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      animation: {
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
