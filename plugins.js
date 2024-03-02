// common Cypress plugin file you can point at to have the
// code coverage tasks registered correctly. From your "cypress.json" file
// {
//   "pluginsFile": "cypress-code-coverage-v8/plugins",
//   "supportFile": "cypress-code-coverage-v8/support"
// }

const { browserLaunchHandler } = require('./lib/plugin/chromeRemoteInterface')
const addTasks = require('./lib/plugin/task')

/**
 * 
 * @example
  ```
    // your plugins file
    module.exports = (on, config) => {
      require('cypress-code-coverage-v8/plugins').coveragePlugin(on, config)
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
