/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        base: 'var(--bg-base)',
        surface: {
          DEFAULT: 'var(--bg-surface)',
          elevated: 'var(--bg-surface-elevated)',
        },
        border: {
          subtle: 'var(--border-subtle)',
          strong: 'var(--border-strong)',
        },
        content: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          dark: 'var(--color-primary-dark)',
          contrast: 'var(--color-primary-contrast)',
        },
        brand: {
          orange: 'var(--color-primary)',
          'orange-hover': 'var(--color-primary-hover)',
          'orange-dark': 'var(--color-primary-dark)',
          lime: '#B4F82C',
          hover: '#A3E524',
          glow: '#CCFF00',
          dark: '#161F10',
          card: 'var(--bg-surface)',
          bg: 'var(--bg-base)',
        },
        status: {
          success: 'var(--color-success)',
          warning: 'var(--color-warning)',
          danger: 'var(--color-danger)',
          info: 'var(--color-info)',
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
          primary: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          dark: 'var(--color-primary-dark)',
          light: '#FFB074',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Noto Sans Ethiopic',
          'Nyala',
          'sans-serif',
        ],
        display: [
          'Oswald',
          'Bebas Neue',
          'Barlow Semi Condensed',
          'Inter',
          'Noto Sans Ethiopic',
          'sans-serif',
        ],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      boxShadow: {
        glow: '0 0 16px -2px rgba(255, 107, 0, 0.35)',
        'glow-sm': '0 0 8px -1px rgba(255, 107, 0, 0.25)',
      },
      animation: {
        fadeIn: 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        scaleUp: 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        slideUp: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
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
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
