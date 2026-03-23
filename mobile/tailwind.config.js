/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  presets: [require("nativewind/preset")],
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
        inter: "Inter_400Regular",
        "inter-medium": "Inter_500Medium",
        "inter-semibold": "Inter_600SemiBold",
        "inter-bold": "Inter_700Bold",
      },
    },
  },
  plugins: [],
};
