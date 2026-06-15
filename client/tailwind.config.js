/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],

  theme: {
    extend: {
      colors: {
        vjj: {
          black: "#0f172a",
          espresso: "#1e293b",
          bronze: "#2563eb",
          gold: "#60a5fa",
          champagne: "#dbeafe",
          ivory: "#f8fbff",
          blush: "#eff6ff",
          blue: "#3b82f6",
          sky: "#e0f2fe",
          glass: "rgba(255,255,255,0.72)",
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
