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
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Paleta oficial solicitada:
        purple: {
          DEFAULT: "#6045F4", // Royal Purple
          50: "#F6F5FE",
          100: "#EBE8FD",
          200: "#D7D2FC",
          300: "#B8AFF9",
          400: "#9284F6",
          500: "#6045F4",
          600: "#5034E8",
          700: "#4124D3",
          800: "#361DAE",
          900: "#2D198D",
        },
        mint: {
          DEFAULT: "#53E6D4", // Neon Mint
          50: "#F0FDFB",
          100: "#CCFAF3",
          200: "#9BF5E7",
          300: "#53E6D4",
          400: "#2CD4BF",
          500: "#14B8A6",
          600: "#0D9488",
        },
        soft: {
          DEFAULT: "#EBEBED", // Soft Gray
          50: "#FAFAFB",
          100: "#F4F4F6",
          200: "#EBEBED",
          300: "#DCDCE0",
          400: "#C4C4CA",
        },
        carbon: {
          DEFAULT: "#0F1417", // Carbon Black
          50: "#F4F6F8",
          100: "#E5E8EB",
          200: "#CCD2D8",
          400: "#6B7A85",
          600: "#34414A",
          700: "#232D33",
          800: "#182025",
          900: "#0F1417",
          950: "#080B0D",
        },
        neon: {
          green: "#39FF14", // Neon Green
        },
      },
    },
  },
  plugins: [],
};
export default config;
