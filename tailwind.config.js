/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,js}", // busca clases dentro de src
    "./*.{html,js}"         // busca clases también en la raíz
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
