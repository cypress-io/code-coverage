module.exports = (on, config) => {
  require('../../../../taskge/task')(on, config)
  on('file:preprocessor', require('@cypress/code-coverage/use-babelrc'))
  return config
}
