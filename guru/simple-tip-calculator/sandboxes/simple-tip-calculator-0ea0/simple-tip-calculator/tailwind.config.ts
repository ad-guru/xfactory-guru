import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: "#f0f7f4",
          100: "#dceee5",
          200: "#b9ddcb",
          300: "#8cc5aa",
          400: "#5ea688",
          500: "#3d8b6d",
          600: "#2d6f57",
          700: "#255947",
          800: "#1f4739",
          900: "#1b3b30",
          950: "#0e211b",
        },
        sage: {
          50: "#f6f7f6",
          100: "#e3e6e3",
          200: "#c7ccc7",
          300: "#a3aba3",
          400: "#7f8a7f",
          500: "#646f64",
          600: "#4f594f",
          700: "#414941",
          800: "#363c36",
          900: "#2e332e",
        },
      },
    },
  },
  plugins: [],
};

export default config;
