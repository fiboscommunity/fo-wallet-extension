const merge = require('webpack-merge')
var webpack = require('webpack')
var CleanWebpackPlugin = require('clean-webpack-plugin')

var base = require('./webpack.base.config')
const prod = {
	cache: false,
	devtool: false,
	plugins: [
		new CleanWebpackPlugin(['dist/*.js', 'dist/*.map']),
		new webpack.optimize.ModuleConcatenationPlugin(),
		new webpack.optimize.OccurrenceOrderPlugin(),
		new webpack.NoEmitOnErrorsPlugin(),
		new webpack.DefinePlugin({
			'process.env': {
				'NODE_ENV': JSON.stringify('production')
			}
		}),
	],
	optimization: {
		splitChunks: {
			cacheGroups: {
				vendor: {
					name: "vendor",
					chunks: "async",
					minChunks: 2,
					// maxAsyncRequests: 1, // 最大异步请求数， 默认1
					// maxInitialRequests: 1, // 最大初始化请求书，默认1
				},
			}
		},
	}
}

module.exports = merge(base, prod)
