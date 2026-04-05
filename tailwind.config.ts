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
          // ── Primary: Electric Green (CTA, savings, money) ──
          green:       '#00C853',
          greenDark:   '#00A846',   // hover / pressed
          greenLight:  '#E8FFF1',   // soft tint / bg
          greenBorder: '#A3F0C4',   // border tint

          // ── Secondary: Electric Blue (tech, energy, features) ──
          blue:        '#2979FF',
          blueDark:    '#1A5FCC',   // hover
          blueLight:   '#EBF2FF',   // soft tint
          blueBorder:  '#93BBFF',   // border tint

          // ── Accent: Orange (urgency, warnings, expiry) ──
          orange:      '#FF6D00',
          orangeDark:  '#E05E00',
          orangeLight: '#FFF3E8',
          orangeBorder:'#FFBC85',

          // ── Neutrals ──
          dark:        '#0F172A',   // primary text
          muted:       '#64748B',   // secondary text
          subtle:      '#94A3B8',   // placeholder / disabled
        },
        surface: {
          bg:     '#F8FAFC',        // page background
          card:   '#FFFFFF',        // card background
          muted:  '#F1F5F9',        // muted bg
          border: '#E2E8F0',        // borders
          hover:  '#F8FAFC',        // hover state bg
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        // Hero gradient (green → blue)
        'hero-gradient':  'linear-gradient(135deg, #00C853 0%, #2979FF 100%)',
        // CTA section gradient
        'cta-gradient':   'linear-gradient(135deg, #00C853 0%, #00A846 100%)',
        // Blue tech gradient
        'tech-gradient':  'linear-gradient(135deg, #2979FF 0%, #1A5FCC 100%)',
        // Card gradient
        'card-gradient':  'linear-gradient(145deg, #ffffff 0%, #F8FAFC 100%)',
        // Warm orange
        'orange-gradient':'linear-gradient(135deg, #FF6D00 0%, #FF8C00 100%)',
      },
      boxShadow: {
        'sm':         '0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)',
        'card':       '0 4px 16px rgba(15,23,42,0.06)',
        'card-hover': '0 8px 32px rgba(15,23,42,0.10)',
        'green':      '0 4px 14px rgba(0,200,83,0.35)',
        'green-lg':   '0 8px 24px rgba(0,200,83,0.40)',
        'blue':       '0 4px 14px rgba(41,121,255,0.30)',
        'orange':     '0 4px 14px rgba(255,109,0,0.30)',
        'inner':      'inset 0 2px 4px rgba(15,23,42,0.06)',
      },
      animation: {
        'fade-up':    'fadeUp 0.55s ease-out forwards',
        'fade-in':    'fadeIn 0.4s ease-out forwards',
        'float':      'float 5s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'shimmer':    'shimmer 2.5s linear infinite',
        'spin-slow':  'spin 6s linear infinite',
        'bounce-sm':  'bounceSm 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        bounceSm: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-4px)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
