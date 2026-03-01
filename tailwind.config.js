/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/context/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/theme/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        hindSiliguri: ["var(--font-hindSiliguri)"],
      },
      colors: {
        // Xinzo brand colors (based on logo)
        primary: "#2563EB", // primary blue
        primaryDark: "#1D4ED8",
        accent: "#F97316", // orange bag accent
      },
    },
  },
  plugins: [],
};
