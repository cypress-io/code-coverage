module.exports = (on, config) => {
  require('cypress-code-coverage-v8/task')(on, config)
  on('file:preprocessor', require('cypress-code-coverage-v8/use-babelrc'))
  return config
}
