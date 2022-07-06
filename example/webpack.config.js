const path = require('path');

module.exports = {
  entry: './src/index.js',
  mode: 'development',
  module: {
    rules: [{
      test: /\.(js)$/,
      exclude: [/node_modules/, /dist/],
      use: ['babel-loader']
    }]
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['*', '.js']
  },
  watch: true
};