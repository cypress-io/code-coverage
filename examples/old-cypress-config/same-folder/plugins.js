module.exports = (on, config) => {
  require('../../../task')(on, config)
  on('file:preprocessor', require('cypress-istanbul/use-babelrc'))
  // on('file:preprocessor', require('../../../use-babelrc'))
  return config
}
