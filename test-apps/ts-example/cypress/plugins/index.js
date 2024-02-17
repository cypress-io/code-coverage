module.exports = (on, config) => {
  require('cypress-code-coverage-v8/task')(on, config)
  return config
}
