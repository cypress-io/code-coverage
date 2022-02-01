module.exports = (on, config) => {
  require('@cypress/code-coverage/task')(on, config)
  // instrument the specs and any source files loaded from specs
  on('file:preprocessor', require('cypress-istanbul/use-babelrc'))
  return config
}
