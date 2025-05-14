/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens: {
      mobile: { max: "767px" },
      tablet: "768px",
      laptop: "1440px",
      desktop: "1920px" ,
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