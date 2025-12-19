/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontSize: {
        xxs: "10px",
      },
      colors: {
        newNavy: "#1d2d53",
        newBlue: "#3b68d8",
      }
    },
  },
  plugins: [],
};
