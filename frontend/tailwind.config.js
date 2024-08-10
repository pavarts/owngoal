// tailwind.config.js
module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      boxShadow: {
        'custom': '0px 3px 5px rgb(100, 114, 135)',
      },
      colors: {
        'lime-green': '#C5F53B',
        'custom-blue': '#D6C10B', // Example color, adjust as needed
      },
      backgroundImage: theme => ({
        'custom-gradient': 'linear-gradient(to right, #C5F53B, #4A90E2)',
      }),
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
