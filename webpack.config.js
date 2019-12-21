const webpack = require('webpack');
const env = 'development';//'production';
process.env.NODE_ENV = env;
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
module.exports = {
  entry: [
    './src/index.js'
  ],
  output: {
    path: __dirname,
    publicPath: '/',
    filename: 'cmi.js'
  },
  module: {
    loaders: [{
      exclude: /node_modules/,
       loader: 'babel',    
      query: {
        presets: ['react', 'es2015', 'stage-1']
      }
    } ]
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  devServer: {
    historyApiFallback: true,
    contentBase: './'
  },
  plugins: [
   // new BundleAnalyzerPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': `'${env}'`
    })
  ]
};