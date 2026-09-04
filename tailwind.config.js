/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Noto Serif"', '"Cormorant Garamond"', '"Playfair Display"', '"Noto Serif JP"', 'serif'],
        cinzel: ['"Cinzel"', 'serif'],
        japanese: ['"Shippori Mincho"', '"Noto Serif"', '"Noto Serif JP"', '"Playfair Display"', 'serif'],
        handwriting: ['"Alex Brush"', 'cursive'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        sakura: {
          50: '#fff5f7',
          100: '#ffe4e9',
          200: '#ffd0da',
          300: '#ffaec0',
          400: '#ff7e9e',
          500: '#f43f77',
          600: '#e11d62',
          petal: '#ffb7c5',
          soft: '#fbe2e8',
          vibrant: '#ff5c8a',
          gold: '#dfb76c',
          crimson: '#b91c1c',
        },
        japanese: {
          bgDark: '#080c18',
          surfaceDark: '#0f172a',
          borderDark: '#1e293b',
          bgLight: '#fffcf7',
          surfaceLight: '#ffffff',
          washi: '#fdfaf2',
        }
      },
      animation: {
        'float-slow': 'floatSlow 6s ease-in-out infinite',
        'float-reverse': 'floatReverse 7s ease-in-out infinite',
        'sway': 'sway 4s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(2deg)' },
        },
        floatReverse: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(8px) rotate(-2deg)' },
        },
        sway: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.04)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
