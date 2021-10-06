const Dotenv = require('dotenv-webpack');
const merge = require('webpack-merge');
const env = process.env.NODE_ENV;
const path = require('path');
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const productionGzipExtensions = ['js', 'css', 'txt', 'svg', 'eot', 'woff', 'ttf', 'svg', 'ico', 'png',];
const config = {
  devServer: {
    disableHostCheck: true,
    // compress: true,
    // port: 9000,
    // https: {
    //   key: fs.readFileSync(path.join(__dirname, './server.key')),
    //   cert: fs.readFileSync(path.join(__dirname, './server.crt')),
    // },
    contentBase: [
      path.join(__dirname, 'public')
    ],
  },
  module: {
    rules: []
  },
}
module.exports = merge(config, {
  plugins: [
    new Dotenv({
      path: env === 'production' ? '.env.production' :
        env === 'intranet' ? '.env.intranet' :
          env === 'test' ? '.env.test' : '.env.development'
    }),
    // new CompressionWebpackPlugin({
      // algorithm: 'gzip',
      // test: new RegExp('\\.(' + productionGzipExtensions.join('|') + ')$'),
      // threshold: 10240, // 只有大小大于该值的资源会被处理 10240
      // minRatio: 0.8 // 只有压缩率小于这个值的资源才会被处理
      // deleteOriginalAssets: false // 删除原文件
    // })
  ]
});
