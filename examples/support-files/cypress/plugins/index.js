module.exports = (on, config) => {
  on('task', require('../../../../task'))
  on('file:preprocessor', require('../../../../use-babelrc'))
}
