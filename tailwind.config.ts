import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: {
          bg: '#0E0F11',
          surface: '#1C1D22',
          border: '#2A2B32',
        },
        surface: {
          sidebar: '#14151A',
        },
        node: {
          start: '#10b981',
          task: '#0ea5e9',
          approval: '#f59e0b',
          automated: '#8b5cf6',
          end: '#f43f5e',
        },
        accent: {
          primary: '#F97316',
          secondary: '#71717A',
          orange: '#F97316',
        },
        'border-subtle': '#2A2B32',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        in: 'fadeIn 0.2s ease-out',
        'slide-in-from-bottom-2': 'slideInFromBottom 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        'pulse-orange': 'pulseOrange 0.75s ease-in-out 2',
        shimmer: 'shimmer 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInFromBottom: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseOrange: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(249, 115, 22, 0)' },
          '50%': { boxShadow: '0 0 16px 4px rgba(249, 115, 22, 0.4)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
