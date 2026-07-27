/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ts: {
          bg: '#0A0E1A',
          bgGradient: '#12172A',
          surface: '#131826',
          border: '#232B42',
          accent: '#5B8DEF',
          textMain: '#F1F4F9',
          textMuted: '#9CA6B8',
          textPlaceholder: '#5B6478',
          inputBg: '#0F1420',
        },
        status: {
          clean: '#34D399',
          review: '#FBBF24',
          flagged: '#F87171',
          pending: '#6B7280',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Inter', 'sans-serif'],
      },
      keyframes: {
        fadeSlideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        gridDrift: {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(-24px, -24px)' },
        }
      },
      animation: {
        'fade-slide-up': 'fadeSlideUp 0.3s ease-out forwards',
        'grid-drift': 'gridDrift 30s linear infinite',
      }
    },
  },
  plugins: [],
}
