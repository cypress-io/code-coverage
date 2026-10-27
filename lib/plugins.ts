/// <reference types="node" />
/// <reference types="cypress" />
import registerCodeCoverageTasks = require('./task')

// Ready-made `setupNodeEvents` for projects that only need the coverage tasks:
//   e2e: { setupNodeEvents: require('@cypress/code-coverage/plugins') }
export = function plugins(
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions
): Cypress.PluginConfigOptions {
  registerCodeCoverageTasks(on, config)
  return config
}
