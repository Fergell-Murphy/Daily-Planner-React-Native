/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.tsx',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#eef2f7',
          100: '#d4dce8',
          200: '#a9b9d1',
          300: '#7e96ba',
          400: '#5373a3',
          500: '#1a3a5c',
          600: '#152e4a',
          700: '#102338',
          800: '#0a1725',
          900: '#050c13',
        },
        sage: {
          50: '#f0f7f4',
          100: '#d9ece3',
          200: '#b3d9c7',
          300: '#8dc6ab',
          400: '#67b38f',
          500: '#4a9b75',
        },
        cream: {
          50: '#faf8f5',
          100: '#f5f0e8',
          200: '#ebe1d1',
        },
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
