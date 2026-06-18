import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dash: {
          bg: "#07101E",
          card: "#0D1F3C",
          border: "#1A3A6A",
          accent: "#3B82F6",
          success: "#22C55E",
          warning: "#F59E0B",
          danger: "#EF4444",
          text: "#E2EAF8",
          muted: "#4A6080",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
