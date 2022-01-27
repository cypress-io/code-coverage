module.exports = (on, config) => {
  require('../../../task')(on, config)
  on('file:preprocessor', require('cypress-istanbul/use-babelrc'))
  return config
}
