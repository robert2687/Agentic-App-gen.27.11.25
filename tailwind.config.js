/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#38bdf8', // Sky 400 - Main Brand
        'brand-secondary': '#94a3b8', // Slate 400
        'brand-accent': '#8b5cf6', // Violet 500 - Secondary Brand
        'brand-background': '#0f172a', // Slate 900
        'brand-surface': '#1e293b', // Slate 800
        'brand-surface-light': '#334155', // Slate 700
        'brand-text-primary': '#f8fafc', // Slate 50
        'brand-text-secondary': '#cbd5e1', // Slate 300
        'accent-success': '#10b981',
        'accent-warning': '#f59e0b',
        'accent-error': '#ef4444',
        'ide-bg': '#1e1e1e',
        'ide-sidebar': '#252526',
        'ide-border': '#3e3e42',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'neon-primary': '0 0 5px theme("colors.brand-primary"), 0 0 20px theme("colors.brand-primary")',
        'neon-accent': '0 0 5px theme("colors.brand-accent"), 0 0 20px theme("colors.brand-accent")',
        'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
      },
      backgroundImage: {
        'mesh': 'radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
      },
      animation: {
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'mesh-spin': 'spin 20s linear infinite',
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
