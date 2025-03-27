/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'mobile': '390px',   // Mobile: 390px
      'tablet': '768px',   // Tablet: 768px
      'desktop': '1920px', // Desktop: 1920px
    },
    extend: {
      gap: {
        8: "2rem",    // 32px
        12: "3rem",   // 48px
        16: "4rem",   // 64px
        20: "5rem",   // 80px
        24: "6rem",   // 96px
        // Thêm các giá trị khác nếu cần
      },
    },
  },
  plugins: [],
};