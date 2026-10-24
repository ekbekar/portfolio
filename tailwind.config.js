/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./about.html", "./assets/js/**/*.js"],
  // Built from project data in main.js (descWidth), so the scanner can't see them
  safelist: ["lg:w-[259px]", "lg:w-[400px]"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Geist", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
};
