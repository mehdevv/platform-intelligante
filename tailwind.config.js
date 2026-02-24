/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#003399",
        "accent-orange": "#ff6b00",
        "premium-gold": "#d4af37",
        "background-light": "#f5f6f8",
        "background-dark": "#0f1623",
      },
      fontFamily: {
        "display": ["Public Sans", "sans-serif"],
        "logo": ["Playfair Display", "serif"]
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
    },
  },
  plugins: [],
}
