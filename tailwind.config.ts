import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          // Primary greens (from logo)
          green:      '#16a34a',   // mid green
          greenDark:  '#14532d',   // deep forest green (logo dark)
          greenBright:'#22c55e',   // bright/lime green (logo highlight)
          greenLight: '#dcfce7',   // soft green tint

          // Dark neutral (logo black elements)
          blue:    '#111827',      // near-black (used where "blue" was)
          blueDark:'#030712',
          blueLight:'#1f2937',

          // Accent gold — kept for CTAs
          gold:    '#f59e0b',
          goldDark:'#d97706',

          red:     '#ef4444',
        },
        surface: {
          light: '#f8fafc',
          muted: '#f1f5f9',
          border:'#e2e8f0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-in': 'slideIn 0.5s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #052e16 0%, #14532d 40%, #166534 100%)',
        'gold-gradient': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        'green-gradient': 'linear-gradient(135deg, #16a34a 0%, #14532d 100%)',
        'sg-gradient': 'linear-gradient(160deg, #111827 0%, #14532d 50%, #16a34a 100%)',
        'card-gradient': 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
      },
      boxShadow: {
        'card': '0 4px 24px rgba(20, 83, 45, 0.08)',
        'card-hover': '0 8px 40px rgba(20, 83, 45, 0.18)',
        'gold': '0 4px 20px rgba(245, 158, 11, 0.3)',
        'blue': '0 4px 20px rgba(17, 24, 39, 0.25)',
        'green': '0 4px 20px rgba(22, 163, 74, 0.35)',
      },
    },
  },
  plugins: [],
}

export default config
