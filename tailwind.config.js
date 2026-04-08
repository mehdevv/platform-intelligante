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
        "aem-bleu": "#4B5B72",
        "aem-azur": "#197F94",
        "aem-azur-light": "#e1f4f7",
        "aem-gris": "#A5ADBA",
        "aem-blanc": "#EBECF1",
        "aem-dark": "#1a2332",
        "brand-mark": "#40828d",
        "primary": "#4B5B72",
        "accent": "#197F94",
        "premium-gold": "#d4a020",
        "background-light": "#EBECF1",
        "background-dark": "#1a2332",
      },
      fontFamily: {
        "display": ["League Spartan", "sans-serif"],
        "logo": ["League Spartan", "sans-serif"],
        "serif": ["Libre Baskerville", "serif"],
        "body": ["Ubuntu", "sans-serif"],
        "editorial": ["Libre Baskerville", "serif"],
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.625rem",
        "full": "9999px"
      },
    },
  },
  plugins: [],
}
