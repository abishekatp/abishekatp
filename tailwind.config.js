/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        'philosophy': '#0f172a', // Slate 950
        'philosophy-light': '#1e293b', // Slate 800
        'coding': '#172554', // Blue 950
        'coding-light': '#1e3a8a', // Blue 900
        'paras': '#1e1b4b', // Indigo 950
        'paras-light': '#312e81', // Indigo 900
        'accent': '#d97706', // Amber 600
        'accent-hover': '#b45309', // Amber 700
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
        'serif': ['"Playfair Display"', 'serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

