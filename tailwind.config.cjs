/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./index.tsx",
    "./App.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ec4899', // Pink 500
        secondary: '#fbcfe8', // Pink 200
        accent: '#be185d', // Pink 700
        soft: '#fdf2f8', // Pink 50
      },
      fontFamily: {
        sans: ['Quicksand', 'sans-serif'],
        display: ['Nunito', 'sans-serif'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    }
  },
  plugins: [],
}
