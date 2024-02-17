module.exports = (on, config) => {
  require('cypress-code-coverage-v8/task')(on, config)
  //Used to instrument code ran like unit tests
  on('file:preprocessor', require('cypress-code-coverage-v8/use-babelrc'))
  return config
}
