// 渲染进程prod环境webpack配置
const path = require("path");
// const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const { merge } = require("webpack-merge");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const webpackBaseConfig = require("./webpack.base.config");

const entry = {
  index: path.join(__dirname, "src/renderer/index.tsx"), // 页面入口
};

// 对每一个入口生成一个.html文件
const htmlWebpackPlugin = Object.keys(entry).map(
  (name) =>
    new HtmlWebpackPlugin({
      inject: "body",
      scriptLoading: "defer",
      template: path.join(__dirname, "resources/template/index.html"), // template.html是一个很简单的html模版
      minify: false,
      filename: `${name}/index.html`,
      chunks: [name],
    })
);

module.exports = merge(webpackBaseConfig, {
  devtool: "hidden-source-map",
  mode: "production",
  target: ["web", "electron-renderer"],
  entry,
  output: {
    path: path.join(__dirname, "dist/renderer/"),
    publicPath: "../",
    filename: "[name]/index.prod.js", // 输出则是每一个入口对应一个文件夹
  },
  resolve: {
    fallback: {
      assert: require.resolve("assert"),
      crypto: require.resolve("crypto-browserify"),
      http: require.resolve("stream-http"),
      https: require.resolve("https-browserify"),
      os: require.resolve("os-browserify/browser"),
      stream: require.resolve("stream-browserify"),
      path: require.resolve("path-browserify"),
      process: require.resolve("process/browser"),
      util: require.resolve("util"),
      buffer: require.resolve("buffer"),
    },
  },
  plugins: [
    // new webpack.EnvironmentPlugin({
    //   NODE_ENV: "production",
    // }),
    new CleanWebpackPlugin(),
    ...htmlWebpackPlugin,
    new webpack.ProvidePlugin({
      process: "process/browser",
    }),
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
    }),
  ],
});
