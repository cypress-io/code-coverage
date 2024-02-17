module.exports = (on, config) => {
  require('cypress-code-coverage-v8/task')(on, config)
  //used to instrument files included as unit tests
  on('file:preprocessor', require('cypress-code-coverage-v8/use-babelrc'))
  return config
}
