const path = require('path');

module.exports = {
  entry: './src/index.js',
  mode: 'development',
  module: {
    rules: [{
      test: /\.(js)$/,
      exclude: [/node_modules/, /public/],
      use: ['babel-loader']
    }]
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'public'),
  },
  resolve: {
    extensions: ['*', '.js']
  }
};