const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

const isProduction = process.env.NODE_ENV !== 'development'; // 除开发development外，其他环境（生产production、测试test）统一采用生产打包配置

module.exports = {
  outputDir: 'app/renderer',
  publicPath: isProduction ? '.' : './',
  configureWebpack: {
    target: 'electron-renderer',
    devtool: false,
    devServer: {
      port: 9090,
      disableHostCheck: true
    },
    resolve: {
      alias: {
        '@addon': path.join(__dirname, 'src/addon'),
        '@common': path.join(__dirname, 'src/common'),
        '@renderer': path.join(__dirname, 'src/renderer')
      },
      enforceExtension: false,
      extensions: ['.tsx', '.ts', '.js', '.jsx', '.vue', '.css', '.less']
    },
    module: {
      rules: [
        {
          test: /\.node$/, // 处理Node 原生模块
          use: isProduction
            ? {
              loader: 'native-ext-loader',
              options: {
                basePath: ['../../../app.asar.unpacked/app/renderer']
              }
            }
            : { loader: 'node-loader' }
        }
      ]
    },
    node: {
      __dirname: !isProduction, // 生产打包 阻止webpack打包时将__dirname替换
      __filename: !isProduction // 生产打包 阻止webpack打包时将__filename替换
    },
    optimization: {
      minimize: isProduction,
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
    }
  },
  pages: {
    index: {
      entry: 'src/renderer/pages/index/main.ts',
      template: 'src/renderer/template.ejs',
      filename: 'index.html'
    }
  }
};
