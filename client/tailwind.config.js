/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkbg: '#0B1020',
        darkcard: '#151D33',
        glassborder: '#273449',
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#151D33',
          900: '#111827',
          950: '#0B1020',
        },
        indigo: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#A78BFA',
          500: '#7C3AED',
          600: '#6D28D9',
          700: '#5B21B6',
          800: '#4C1D95',
          900: '#2E1065',
        },
        primary: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          500: '#7C3AED',
          600: '#6D28D9',
          700: '#5B21B6',
        },
        accent: {
          violet: '#8B5CF6',
          emerald: '#22C55E',
          amber: '#F59E0B',
          rose: '#EF4444',
          blue: '#2563EB',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        neonBlue: '0 0 15px rgba(37, 99, 235, 0.35)',
        neonIndigo: '0 0 15px rgba(124, 58, 237, 0.35)',
      }
    },
  },
  plugins: [],
}
