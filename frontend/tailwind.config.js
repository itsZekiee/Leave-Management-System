/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#4ade80', // Exact green from mockup palette (simulated)
          DEFAULT: '#22c55e',
          dark: '#16a34a',
        }
      }
    },
  },
  plugins: [],
}
