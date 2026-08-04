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
      // DEVELOPMENT.md's Typography table (§ "Typography"): one scale, four
      // named roles, used everywhere instead of Tailwind's default sizes.
      fontSize: {
        wordmark: ['32px', { lineHeight: '1.2' }],
        heading: ['22px', { lineHeight: '1.3' }],
        body: ['17px', { lineHeight: '1.5' }],
        utility: ['15px', { lineHeight: '1.4' }],
        // Desktop-only 1.5x versions of the same four roles, applied with a
        // `lg:` prefix. Deliberately separate keys rather than a bigger root
        // rem so this only touches font-size — Tailwind's spacing/width
        // scale (gap-*, w-*, px-*, including the lg:w-72/lg:w-96 tuning on
        // Country detail) is rem-based off the *root* element, and changing
        // that would have scaled layout along with text.
        'wordmark-lg': ['48px', { lineHeight: '1.2' }],
        'heading-lg': ['33px', { lineHeight: '1.3' }],
        'body-lg': ['25.5px', { lineHeight: '1.5' }],
        'utility-lg': ['22.5px', { lineHeight: '1.4' }],
      },
    },
  },
  plugins: [],
};
