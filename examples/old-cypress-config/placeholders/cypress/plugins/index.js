module.exports = (on, config) => {
  require('../../../../task')(on, config)
  // instrument the specs and any source files loaded from specs
  on('file:preprocessor', require('../../../../use-babelrc'))
  return config
}
