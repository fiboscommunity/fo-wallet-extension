module.exports = {
  entry: {
    index: './src/views/index.tsx',
    content: './src/content.tsx',
    inject: './src/inject.tsx',
    background: './src/background.tsx',
    prompt: './src/prompt.tsx'
  },
  output: {
    filename: "[name].js",
    path: __dirname + "/dist",
    publicPath: '',
  },
  devtool: "source-map",
  performance: {
    hints: "warning",
    maxAssetSize: 30000000,
    maxEntrypointSize: 50000000,
    assetFilter: function (assetFilename) {
      return assetFilename.endsWith('.css') || assetFilename.endsWith('.js') || assetFilename.endsWith('.less')
    }
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".less", ".css", ".json"]
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          plugins: ['transform-runtime'],
          presets: ['es2015', 'react', 'stage-2']
        }
      },
      {
        test: /\.tsx?$/,
        loader: "ts-loader"
      },
      {
        test: /\.css$/,
        loader: "style-loader!css-loader?modules"
      },
      {
        test: /\.less$/,
        loader: 'style-loader!css-loader!less-loader'
      },
      {
        test: /\.(png|jpeg|gif)/,
        loader: "file-loader?name=/assets/[hash].[ext]"
      },
      {
        enforce: "pre",
        test: /\.js$/,
        loader: "source-map-loader"
      }
    ]
  },
  plugins: [
  ],
};
