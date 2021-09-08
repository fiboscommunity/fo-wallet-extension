const merge = require('webpack-merge')
const webpack = require('webpack')
const CleanWebpackPlugin = require('clean-webpack-plugin')

const base = require('./webpack.base.config')
const dev = {
  devtool: "source-map",
  devServer: {
    port: 3000,
    open: true,
    hot: true,
    publicPath: '/dist/',
    historyApiFallback: {
      index: './index.html'
    },
  },
  plugins: [
    new CleanWebpackPlugin(['dist/*.js', 'dist/*.map', 'dist/*.hot-update.json']),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('development')
      }
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ]
}
module.exports = merge(base, dev)