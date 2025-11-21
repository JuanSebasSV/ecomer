/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  safelist: [
  { pattern: /(bg|text|border|from|to|via)-(.*)/ },
  { pattern: /(grid-cols|col-span|row-span)-(.*)/ },
  { pattern: /(hidden|block|flex|inline|inline-flex)/ },
  ],
  content: [
  "./*.html",
  "./src/**/*.html",
  "./src/**/*.js",
  "./pages/**/*.html",
  "./components/**/*.html",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

