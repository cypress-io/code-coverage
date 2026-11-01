const path = require('path')

module.exports = {
  entry: './src/index.ts',
  mode: 'development',
  devtool: 'inline-source-map',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        // babel-loader reads .babelrc, which strips the types with
        // @babel/preset-typescript and instruments with babel-plugin-istanbul
        test: /\.[jt]s$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  }
}
