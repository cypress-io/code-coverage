// common Cypress plugin file you can point at to have the
// code coverage tasks registered correctly. From your "cypress.json" file
// {
//   "pluginsFile": "cypress-code-coverage-v8/plugins",
//   "supportFile": "cypress-code-coverage-v8/support"
// }

const { browserLaunchHandler } = require('./lib/plugin/chromeRemoteInterface')
const addTasks = require('./lib/plugin/task')

module.exports = (on, config) => {
  on('before:browser:launch', browserLaunchHandler)
  addTasks(on, config)
  // IMPORTANT to return the config object
  // with the any changed environment variables
  return config
}
