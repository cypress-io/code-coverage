module.exports = (on, config) => {
  require('@cypress/code-coverage/task')(on, config)
  //used to instrument files included as unit tests
  on('file:preprocessor', require('@cypress/code-coverage/use-babelrc'))
  return config
}
