/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'mobile': '390px',   // Mobile: 390px
      'tablet': '768px',   // Tablet: 768px
      'desktop': '1920px', // Desktop: 1920px
    },
    extend: {},
  },
  plugins: [],
};