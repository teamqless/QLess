/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        brand: {
          DEFAULT: '#4f46e5',
          light: '#6366f1',
          dark: '#3730a3',
        },
        surface: {
          DEFAULT: '#ffffff',
          2: '#f8f8fc',
          3: '#f1f0f9',
        },
        text: {
          1: '#0f0e1a',
          2: '#4a4868',
          3: '#9896b0',
        },
        border: {
          DEFAULT: '#e4e3f0',
          dark: '#cccae0',
        },
        success: {
          DEFAULT: '#16a34a',
          bg: '#f0fdf4',
        },
        warning: {
          DEFAULT: '#d97706',
          bg: '#fffbeb',
        },
        danger: {
          DEFAULT: '#dc2626',
          bg: '#fef2f2',
        },
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-hover': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'soft': '0 10px 40px -10px rgba(0,0,0,0.08)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
