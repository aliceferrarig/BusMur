/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#004c68",
          hover:   "#003a52",
          deep:    "#002c3e",
          light:   "#e6f3f8",
          mid:     "#b3d9e8",
        },
        accent: {
          DEFAULT: "#ffe500",
          hover:   "#f5da00",
          text:    "#002c3e",
        },
      },
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        mono: ["Space Mono", "monospace"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "22px",
      },
      boxShadow: {
        brand: "0 6px 18px rgba(0, 76, 104, 0.28)",
        accent: "0 6px 18px rgba(255, 229, 0, 0.40)",
      },
    },
  },
  plugins: [],
};