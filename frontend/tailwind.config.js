/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        khmer: ['"Noto Sans Khmer"', 'sans-serif'],
        sans: ['"Noto Sans Khmer"', '"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
