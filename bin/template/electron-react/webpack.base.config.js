const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const tailwindcss = require("tailwindcss");
const autoprefixer = require("autoprefixer");

const isDev = process.env.NODE_ENV === "development";

module.exports = {
  resolve: {
    extensions: [".js", ".jsx", ".json", ".ts", ".tsx", ".node"],
    plugins: [new TsconfigPathsPlugin()],
  },
  //   devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.(js|jsx|tsx|ts)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: require.resolve("babel-loader"),
            options: {
              presets: [
                "@babel/preset-env",
                "@babel/preset-typescript",
                "@babel/preset-react",
              ],
              plugins: [
                "@babel/plugin-transform-runtime",
                isDev && require.resolve("react-refresh/babel"),
                ["@babel/plugin-proposal-decorators", { legacy: true }],
              ].filter(Boolean),
            },
          },
        ],
      },
      {
        test: /\.(css|less)$/,
        use: [
          "style-loader",
          { loader: "css-loader", options: { importLoaders: 1 } },
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                ident: "postcss",
                plugins: [tailwindcss, autoprefixer],
              },
            },
          },
          "less-loader",
        ],
      },
    ],
  },
};
