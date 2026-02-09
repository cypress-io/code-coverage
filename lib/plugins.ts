/// <reference types="node" />
/// <reference types="cypress" />
import registerCodeCoverageTasks = require('./task')

// common Cypress plugin file you can point at to have the
// code coverage tasks registered correctly. From your "cypress.json" file
// {
//   "pluginsFile": "@cypress/code-coverage/plugins",
//   "supportFile": "@cypress/code-coverage/support"
// }
//
export = function plugins(on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions): Cypress.PluginConfigOptions {
  registerCodeCoverageTasks(on, config)
  // IMPORTANT to return the config object with any changes
  return config
}

