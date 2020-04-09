module.exports = (on, config) => {
  require('../../../../task')(on, config)
  // instrument loaded spec files (and the application code loaded from them)
  on('file:preprocessor', require('../../../../use-browserify-istanbul'))
  return config
}
