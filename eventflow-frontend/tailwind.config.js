/** @type {import('tailwindcss').Config} */
// Force Vite HMR reload
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        brand: {
          DEFAULT: '#C05800',
          dark: '#713600',
          light: '#d97424',
          glow: 'rgba(192, 88, 0, 0.4)',
        },
        surface: {
          DEFAULT: '#ffffff',
          base: '#FDFBD4',
          glass: 'rgba(253, 251, 212, 0.7)',
        },
        text: {
          1: '#38240D',
          2: '#5c3a14',
          3: '#8c6032',
          light: '#FDFBD4',
          muted: '#ab8258',
        },
        border: {
          DEFAULT: '#713600',
          light: 'rgba(113, 54, 0, 0.1)',
        },
        success: {
          DEFAULT: '#10b981',
          bg: '#ecfdf5',
        },
        warning: {
          DEFAULT: '#f59e0b',
          bg: '#fffbeb',
        },
        danger: {
          DEFAULT: '#ef4444',
          bg: '#fef2f2',
        },
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.05)',
        'glass-hover': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'glow': '0 0 20px rgba(99, 102, 241, 0.5)',
        'glow-lg': '0 0 40px rgba(99, 102, 241, 0.6)',
        'neon': '0 0 10px theme("colors.brand.DEFAULT"), 0 0 40px theme("colors.brand.DEFAULT"), 0 0 80px theme("colors.brand.DEFAULT")',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '50%': { opacity: '.7', filter: 'brightness(1.2)' },
        },
      },
    },
  },
  plugins: [],
}
