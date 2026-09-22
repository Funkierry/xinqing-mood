import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FAF7F2",
        ink: "#3F3A36",
        mint: "#BFDCCF",
        peach: "#F5D2BF",
      },
      boxShadow: {
        soft: "0 18px 50px rgba(90, 76, 66, 0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
