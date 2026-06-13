/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],

  theme: {
    extend: {
      colors: {
        vjj: {
          black: "#080504",
          espresso: "#130d0a",
          ivory: "#fbf7ef",
          champagne: "#f5c56b",
          gold: "#d89b27",
          bronze: "#9b641b",
        },
      },

      boxShadow: {
        luxury: "0 28px 90px rgba(30, 20, 10, 0.16)",
        glow: "0 0 42px rgba(245, 197, 107, 0.24)",
      },
    },
  },

  plugins: [],
};
