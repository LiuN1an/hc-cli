// 渲染进程prod环境webpack配置
const path = require("path");
// const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const { merge } = require("webpack-merge");
const webpackBaseConfig = require("./webpack.base.config");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const { spawn } = require("child_process");

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
      //   templateParameters(compilation, assets, options) {
      //     return {
      //       compilation: compilation,
      //       webpack: compilation.getStats().toJson(),
      //       webpackConfig: compilation.options,
      //       htmlWebpackPlugin: {
      //         files: assets,
      //         options: options,
      //       },
      //       process,
      //     };
      //   },
      minify: false,
      filename: `${name}/index.html`,
      chunks: [name],
    })
);

module.exports = merge(webpackBaseConfig, {
  devServer: {
    hot: true,
    open: false,
    inline: true,
    // publicPath: `http://localhost:${process.env.PORT}/dist`,
    contentBase: path.join(__dirname, "dist"),
    port: process.env.PORT || 3000,
    historyApiFallback: true,
    before() {
      console.warn("start main process ... \n\n");
      spawn("npm", ["run", "dev:main"], {
        shell: true,
        env: process.env,
        stdio: "inherit",
      })
        .on("close", (code) => process.exit(code))
        .on("error", (spawnError) => console.error(spawnError));
    },
    writeToDisk: true, // 写入dist目录下，如果开启，在hotReload下会不断的添加hot-load.json进去
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
  devtool: "inline-source-map",
  mode: "development",
  target: ["web", "electron-renderer"],
  entry,
  output: {
    path: path.join(__dirname, "dist/renderer"),
    publicPath: `http://localhost:${process.env.PORT}/renderer/`,
    filename: "[name]/bundle.js", // 输出则是每一个入口对应一个文件夹
    chunkFilename: "[name].js",
  },
  plugins: [
    new CleanWebpackPlugin(),
    ...htmlWebpackPlugin,
    new webpack.ProvidePlugin({
      process: "process/browser",
    }),
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
    }),
    new ReactRefreshWebpackPlugin(),
    new webpack.HotModuleReplacementPlugin(),
  ],
});
