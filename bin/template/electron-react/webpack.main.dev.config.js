const path = require("path");
const webpack = require("webpack");
const { merge } = require("webpack-merge");
const nodeExternals = require("webpack-node-externals");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const webpackBaseConfig = require("./webpack.base.config");

module.exports = merge(webpackBaseConfig, {
  devtool: "source-map",
  mode: "development", // 开发模式
  target: "electron-main",
  entry: {
    main: path.join(__dirname, "src/main/index.ts"),
    preload: path.join(__dirname, "src/main/preload.js"),
  },
  output: {
    path: path.join(__dirname, "dist/main"),
    filename: "[name].dev.js", // 开发模式文件名为main.dev.js
  },
  externals: [nodeExternals()], // 排除Node模块
  plugins: [
    new CleanWebpackPlugin(),
    // new webpack.EnvironmentPlugin({
    //   NODE_ENV: "development",
    // }),
  ],
  node: {
    __dirname: false,
    __filename: false,
  },
});
