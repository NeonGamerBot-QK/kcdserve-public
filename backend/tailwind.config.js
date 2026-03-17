/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/views/**/*.html.erb",
    "./app/helpers/**/*.rb",
    "./app/assets/stylesheets/**/*.css",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
        },
        accent: {
          500: "#14B8A6",
          600: "#0D9488",
        },
        status: {
          pending: "#F59E0B",
          approved: "#22C55E",
          rejected: "#EF4444",
        },
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        "inter-medium": ["Inter", "sans-serif"],
        "inter-semibold": ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
