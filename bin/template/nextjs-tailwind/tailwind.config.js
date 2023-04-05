/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      maxd: { max: "768px" },
      md: "768px",
    },
    extend: {
      gridTemplateRows: {
        "grid-direction-row": "repeat(auto-fit, minmax(auto, 1fr))",
      },
      gridTemplateColumns: {
        "auto-fill-but-max-with": "repeat(auto-fill, minmax(175px, 1fr))",
        "param-auto-fill-but-max-with":
          "repeat(auto-fill, minmax(234px, 1fr))",
      },
      colors: {
        "prompt-bg-color": "#1f1f1f",
        "input-bg-color": "#141414",
        "hover-input-bg-color": "rgba(255, 255, 255, 0.16)",
        "active-input-bg-color": "rgba(20, 20, 20, 0.75)",
        "input-border-color": "#4c4c4c",
        "focus-color": "#FF4D00",
        "tag-bg-color": "#333333",
        "select-bg-color": "rgba(255, 77, 0, 0.16)",
        "select-hover-bg-color": "rgba(255, 77, 0, 0.08)",
        "select-active-bg-color": "rgba(255, 77, 0, 0.12)",
        "select-border-color": "rgba(255, 77, 0, 1)",
      },
    },
  },
  plugins: [require("tailwind-scrollbar")],
};
