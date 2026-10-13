/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        charcoal: {
          950: '#0a0a0a',
          900: '#121212',
          850: '#1a1a1a',
          800: '#242424',
          700: '#333333',
          600: '#4d4d4d',
        },
        orange: {
          primary: '#ff6b00',
          hover: '#e55f00',
          dark: '#cc5200',
          light: '#ff8533',
        },
      },
    },
  },
  plugins: [],
};
