/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#111111', // primary text, borders
        muted: '#8A8A8A', // secondary text, placeholders, values
        hairline: '#CFCFCF', // input borders, dividers
        paper: '#FFFFFF', // background
        status: {
          upcoming: '#4CAF50', // green
          ongoing: '#2F6FED', // blue
          completed: '#D9D9D9', // grey
        },
        danger: '#D64545', // validation errors, delete confirmation only
      },
      borderRadius: {
        pill: '9999px',
      },
      fontFamily: {
        sans: ['"Work Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
