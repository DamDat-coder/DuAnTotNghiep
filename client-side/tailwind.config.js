/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      // Định nghĩa các breakpoint với max-width
      mobile: { max: "767px" }, // Dưới 768px
      tablet: { min: "768px", max: "1920px" }, // Từ 768px đến 1279px
      desktop: { min: "1280px", max: "1920px" }, // Từ 1280px đến 1920px
    },
    extend: {
      gap: {
        8: "2rem", // 32px
        12: "3rem", // 48px
        16: "4rem", // 64px
        20: "5rem", // 80px
        24: "6rem", // 96px
      },
      fontFamily: {
        heading: ["UTM Avo", "sans-serif"],
        body: ["UTM Avo", "sans-serif"],
        description: ["var(--font-lora)", "serif"],
      },
    },
  },
  plugins: [],
};