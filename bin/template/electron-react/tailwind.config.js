const loopPercent = () => {
  const result = {};
  for (let index = 0; index <= 100; index++) {
    result[`${index}%`] = `${index}%`;
  }
  return result;
};

module.exports = {
  //   corePlugins: {
  //     preflight: false,
  //   },
  purge: ["./src/**/*.tsx", "./public/index.html"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#1890ff",
        hoverPrimary: "#E6F7FF",
      },
      height: {
        "1/20": "5%",
      },
      width: loopPercent(),
    },
  },
  variants: {
    fill: ["hover", "focus"],
  },
  plugins: [],
};
