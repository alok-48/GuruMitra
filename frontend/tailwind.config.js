/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: { 50: '#fef7ec', 100: '#fdecd3', 200: '#f9d5a5', 300: '#f5b76d', 400: '#f09333', 500: '#ec7a11', 600: '#dd5f07', 700: '#b7430a', 800: '#94350f', 900: '#792d10' },
        warm: { 50: '#fdf8f0', 100: '#faf0df', 200: '#f4debb', 300: '#ecc68e', 400: '#e3a75f', 500: '#db8f3e', 600: '#cd7633', 700: '#ab5c2b', 800: '#894a29', 900: '#6f3e24' },
        sage: { 50: '#f4f7f4', 100: '#e3ebe3', 200: '#c8d7c8', 300: '#a1bba1', 400: '#739873', 500: '#527b52', 600: '#3f623f', 700: '#334f33', 800: '#2b402b', 900: '#243524' },
        saffron: { 500: '#FF6F00', 600: '#E65100' },
      },
      fontSize: {
        'elder-sm': ['1rem', { lineHeight: '1.5' }],
        'elder-base': ['1.2rem', { lineHeight: '1.6' }],
        'elder-lg': ['1.4rem', { lineHeight: '1.6' }],
        'elder-xl': ['1.7rem', { lineHeight: '1.5' }],
        'elder-2xl': ['2rem', { lineHeight: '1.4' }],
        'elder-3xl': ['2.5rem', { lineHeight: '1.3' }],
      },
      spacing: { 'touch': '3rem', 'touch-lg': '3.5rem' },
      borderRadius: { 'elder': '1rem' },
    },
  },
  plugins: [],
};
