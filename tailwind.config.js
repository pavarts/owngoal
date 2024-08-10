/** @type {import('tailwindcss').Config} */
module.exports = {
  mode:'jit',
  content: [
    './src/index.html',
    './src/js/scripts.js'
  ],
  theme: {
    extend: {
      'roboto': ['Roboto', 'sans-serif'] // Add 'Roboto' as a key and the font stack
    },
  },
  plugins: [],
}
