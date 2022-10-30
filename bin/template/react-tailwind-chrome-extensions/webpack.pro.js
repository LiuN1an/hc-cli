const path = require("path");
const webpack = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const tailwindcss = require("tailwindcss");
const autoprefixer = require("autoprefixer");
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  mode: "production",
  entry: {
    popup: path.resolve(__dirname, "./src/popup/index.jsx"),
    background: path.resolve(__dirname, "./src/background/index.js"),
    content: path.resolve(__dirname, "./src/content/index.jsx"),
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
  devtool: false,
  resolve: {
    extensions: ["*", ".ts", ".tsx", ".jsx", ".js", ".json", "svg"],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: require.resolve("babel-loader"),
            options: {
              presets: ["@babel/preset-env", "@babel/preset-react"],
              plugins: [
                "@babel/plugin-transform-runtime",
                ["@babel/plugin-proposal-decorators", { legacy: true }],
              ].filter(Boolean),
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
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
        ],
      },
    ],
  },
  optimization: {
    minimizer: [
      new CssMinimizerPlugin(),
      new TerserPlugin({
        extractComments: false,
      }),
    ],
    splitChunks: {
      chunks: "async",
      cacheGroups: {
        react: {
          name: "react",
          chunks: "all",
          test: /[\\/]node_modules[\\/]react/,
          enforce: true,
        },
        "react-dom": {
          name: "react-dom",
          chunks: "all",
          test: /[\\/]node_modules[\\/]react-dom/,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css",
    }),
    new HtmlWebpackPlugin({
      template: "./src/popup/index.html",
      filename: "popup.html",
      inject: "head",
      hash: false,
    }),
    new CopyPlugin({
      patterns: [{ from: "public" }],
    }),
  ],
};
