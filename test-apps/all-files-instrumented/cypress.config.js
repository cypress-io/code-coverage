const { defineConfig } = require('cypress')

module.exports = defineConfig({
  allowCypressEnv: false,
  fixturesFolder: false,
  expose: {
    codeCoverage: {
      // report files that no test loads at 0% instead of leaving them empty
      instrumentUnloadedFiles: true
    }
  },
  e2e: {
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
    baseUrl: 'http://localhost:1234'
  }
})
