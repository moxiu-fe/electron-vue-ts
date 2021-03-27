"use strict";

const path = require("path");
const webpack = require("webpack");
const BabiliWebpackPlugin = require("babili-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const TerserPlugin = require("terser-webpack-plugin");
const nodeExternals = require('webpack-node-externals');

const isProduction = process.env.NODE_ENV !== "development"; // 除开发development外，其他环境（生产production、测试test）统一采用生产打包配置

let mainConfig = {
  mode: isProduction ? "production" : "development",
  target: "electron-main",
  entry: path.join(__dirname, '../src/main/', `${isProduction ? 'index.ts' : 'index.dev.ts'}`),
  output: {
    filename: "main.js",
    path: path.join(__dirname, "../app/main"),
  },
  resolve: {
    alias: {
      '@addon': path.join(__dirname, '../src/addon'),
      '@common': path.join(__dirname, '../src/common'),
      '@childProcess': path.join(__dirname, '../src/childProcess'),
      '@static': path.join(__dirname, '../src/static')
    },
    enforceExtension: false,
    extensions: [".ts", ".js", ".json", ".node"]
  },
  externals: [
    // nodeExternals()
  ],
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
              basePath: ["../../../app.asar.unpacked/app/main"]
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
    }),
    new CopyWebpackPlugin([
      {
        from: path.join(__dirname, "../src/static"),
        to: path.join(__dirname, "../app/static"),
        ignore: [".*"]
      }
    ])
  ]
};

/**
 * Adjust mainConfig for production、stg settings
 */
if (isProduction) {
  mainConfig.optimization = {
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
  mainConfig.plugins.push(
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ["**/*", "!childProcess/**/*", "!renderer/**/*", "!worker/**/*"]
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
  mainConfig.devtool = "inline-source-map";
}

module.exports = mainConfig;
