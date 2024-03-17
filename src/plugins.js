const { browserLaunchHandler } = require('./lib/plugin/chromeRemoteInterface')
const addTasks = require('./lib/plugin/task')

/**
 * @param {Cypress.PluginEvents} on
 * @param {Cypress.PluginConfigOptions} config
 * @returns {Cypress.PluginConfigOptions}
 * @example
  ```js
    // your plugins file
    
    module.exports = (on, config) => {
      require('cypress-code-coverage-v8/dist/plugins').coveragePlugin(on, config)
      // IMPORTANT to return the config object
      // with the any changed environment variables
      return config
    }
  ```
 */
const coveragePlugin = (on, config) => {
  on('before:browser:launch', browserLaunchHandler)
  addTasks(on, config)
  // IMPORTANT to return the config object
  // with the any changed environment variables
  return config
}

module.exports = {
  coveragePlugin
}
