/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],

  theme: {
    extend: {
      colors: {
        vjj: {
          ivory: "#F7F4EF",
          cream: "#FFFDF8",
          champagne: "#E8DDD0",
          gold: "#A58A5F",
          bronze: "#8B724E",
          coffee: "#6F5A4A",
          espresso: "#342217",
          black: "#2B1D16",
          brown: "#3B261A",
          soft: "#F1EAE1",
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
