module.exports = (on, config) => {
  require('../../../../task')(on, config)
  // IMPORTANT to return the config object
  // with the any changed environment variables
  return config
}
