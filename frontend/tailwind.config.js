/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          lime: '#B4F82C',
          hover: '#A3E524',
          glow: '#CCFF00',
          dark: '#161F10',
          card: '#0E1217',
          bg: '#090C10',
        },
        lime: {
          brand: '#B4F82C',
          hover: '#A3E524',
          glow: '#CCFF00',
          dark: '#161F10',
        },
        charcoal: {
          950: '#07090C',
          900: '#0E1217',
          850: '#141822',
          800: '#1D2331',
          700: '#2A3346',
          600: '#3D4A63',
        },
        orange: {
          primary: '#B4F82C',
          hover: '#A3E524',
          dark: '#161F10',
          light: '#CCFF00',
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        scaleUp: 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleUp: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
