/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0284C7',
        'primary-dark': '#0369A1',
        accent: '#9333EA',
      },
    },
  },
  plugins: [],
}
