module.exports = (on, config) => {
  require('cypress-code-coverage-v8/task')(on, config)
  // IMPORTANT to return the config object
  // with the any changed environment variables
  return config
}
