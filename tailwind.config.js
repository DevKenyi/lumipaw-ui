/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fdf4ff',
          100: '#fae8ff',
          200: '#f3d0fe',
          300: '#e9a8fd',
          400: '#d770f8',
          500: '#c044ed',
          600: '#a726d0',
          700: '#8c1cac',
          800: '#741b8c',
          900: '#5f1a70',
          950: '#3f0549',
        },
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f8f8f8',
          border: '#e5e7eb',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-hover': '0 4px 16px 0 rgb(0 0 0 / 0.10)',
      },
    },
  },
  plugins: [],
}
