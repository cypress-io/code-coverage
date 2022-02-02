module.exports = (on, config) => {
  require('@cypress/code-coverage/task')(on, config)
  on('file:preprocessor', require('cypress-istanbul/use-babelrc'))
  return config
}
