module.exports = (on, config) => {
  require('@cypress/code-coverage/task')(on, config)
  //Used to instrument code ran like unit tests
  on('file:preprocessor', require('cypress-istanbul/use-babelrc'))
  return config
}
