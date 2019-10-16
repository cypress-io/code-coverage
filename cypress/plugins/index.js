module.exports = (on, config) => {
  on('task', require('../../task'))

  // also use .babelrc file when bundling spec files
  // to get the code coverage from unit tests
  // https://glebbahmutov.com/blog/combined-end-to-end-and-unit-test-coverage/
  on('file:preprocessor', require('../../use-babelrc'))

  // or use browserify and just push babel-plugin-istanbul
  // directory to the list of babelify plugins
  // on('file:preprocessor', require('../../use-browserify-istanbul'))
}
