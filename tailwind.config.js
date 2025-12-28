/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'insta-dark': '#0c0f14',
        'insta-light-dark': '#212328',
      }
    },
  },
  plugins: [],
}