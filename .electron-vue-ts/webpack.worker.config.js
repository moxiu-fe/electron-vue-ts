"use strict";

const path = require("path");
const webpack = require("webpack");
const BabiliWebpackPlugin = require("babili-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const TerserPlugin = require("terser-webpack-plugin");
const { getMultiWorkerEntry } = require('./utils.js');

const isProduction = process.env.NODE_ENV !== "development"; // 除开发development外，其他环境（生产production、测试test）统一采用生产打包配置

let workerConfig = {
  mode: isProduction ? "production" : "development",
  target: "electron-renderer", // 需要调用node模块，故不能配置webworker
  entry: getMultiWorkerEntry(),
  output: {
    filename: "[name].js",
    path: path.join(__dirname, "../app/worker"),
  },
  resolve: {
    alias: {
      '@addon': path.join(__dirname, '../src/addon'),
      '@common': path.join(__dirname, '../src/common'),
    },
    enforceExtension: false,
    extensions: [".tsx", ".ts", ".js", ".json", ".node"]
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
              basePath: ["../../../app.asar.unpacked/app/worker"]
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
 * Adjust workerConfig for production、stg settings
 */
if (isProduction) {
  workerConfig.optimization = {
    minimize: true,
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

  workerConfig.plugins.push(
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ["**/*", "!main/**/*", "!childProcess/**/*", "!renderer/**/*", "!static/**/*"]
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
  workerConfig.devtool = "inline-source-map";
}



module.exports = workerConfig;
