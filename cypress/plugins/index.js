module.exports = (on, config) => {
  require('../../task')(on, config)

  // IMPORTANT to return the config object with changed environment variable
  return config
}
