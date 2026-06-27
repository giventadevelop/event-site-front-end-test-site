const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        "dm-sans": ["DM Sans", "sans-serif"],
      },
      colors: {
        parchment: {
          DEFAULT: "#FDF6EE",
          deep: "#F5E8D8",
          mid: "#FAF0E6",
          light: "#FFFAF5",
        },
        burgundy: {
          DEFAULT: "#C0284A",
          dark: "#8B1030",
          light: "#E8406A",
          muted: "#E8899A",
        },
        warmBrown: {
          DEFAULT: "#7A1E35",
          light: "#9E2A48",
          dark: "#520D22",
        },
        warmGold: {
          DEFAULT: "#C8860A",
          dark: "#A06808",
          light: "#E8A830",
        },
        warmGray: {
          light: "#D4C4C4",
          DEFAULT: "#9E8080",
          dark: "#5C3D3D",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

module.exports = config;
