"use strict";

const path = require("path");
const webpack = require("webpack");
const BabiliWebpackPlugin = require("babili-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const TerserPlugin = require("terser-webpack-plugin");
const { getMultiChildProcessEntry } = require('./utils.js');

const isProduction = process.env.NODE_ENV !== "development"; // 除开发development外，其他环境（生产production、测试test）统一采用生产打包配置

let childProcessConfig = {
  mode: isProduction ? "production" : "development",
  target: "electron-main",
  entry: getMultiChildProcessEntry(),
  output: {
    filename: "[name]",
    path: path.join(__dirname, "../app/childProcess"),
  },
  resolve: {
    alias: {
      '@addon': path.join(__dirname, '../src/addon'),
      '@common': path.join(__dirname, '../src/common'),
    },
    enforceExtension: false,
    extensions: [".ts", ".js", ".json", ".node"]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.js$/,
        use: "babel-loader",
        exclude: /node_modules/
      },
      {
        test: /\.node$/, // 处理Node 原生模块
        use: isProduction
          ? {
            loader: "native-ext-loader",
            options: {
              basePath: ["../../../app.asar.unpacked/app/childProcess"]
            }
          }
          : { loader: "node-loader" }
      }
    ]
  },
  node: {
    __dirname: !isProduction, // 生产打包 阻止webpack打包时将__dirname替换
    __filename: !isProduction // 生产打包 阻止webpack打包时将__filename替换
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": `"${process.env.NODE_ENV}"`
    })
  ]
};

/**
 * Adjust childProcessConfig for production、stg settings
 */
if (isProduction) {
  childProcessConfig.optimization = {
    minimizer: [
      new TerserPlugin({
        parallel: false,
        sourceMap: false,
        terserOptions: {
          output: { comments: false },
          compress: {
            drop_console: true,
            drop_debugger: true
          }
        }
      })
    ]
  };
  childProcessConfig.plugins.push(
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ["**/*", "!main/**/*", "!renderer/**/*", "!worker/**/*", "!static/**/*"]
    }),
    new BabiliWebpackPlugin()
  );

  // 打包分析
  if (process.env.OPEN_ANALYZER) {
    rendererConfig.plugins.push(
      new BundleAnalyzerPlugin({
        analyzerMode: "server",
        openAnalyzer: true
      })
    );
  }
} else {
  childProcessConfig.devtool = "inline-source-map";
}

module.exports = childProcessConfig;
