const path = require('path')

// https://webpack.js.org/guides/development/
module.exports = {
  entry: './src/index.js',
  mode: 'development',
  devtool: 'inline-source-map',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        // when bundling application's own source code
        // transpile using Babel which uses .babelrc file
        // and instruments code using babel-plugin-istanbul
        test: /\.js/,
        exclude: /(node_modules|bower_components)/,
        use: [
          {
            loader: 'babel-loader'
          }
        ]
      }
    ]
  }
}
