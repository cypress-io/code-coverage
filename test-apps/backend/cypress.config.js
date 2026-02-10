const { defineConfig } = require('cypress')

module.exports = defineConfig({
  fixturesFolder: false,
  env: {
    codeCoverage: {
      url: 'http://localhost:3003/__coverage__',
      expectBackendCoverageOnly: true,
    },
  },
  e2e: {
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
    baseUrl: 'http://localhost:3003',
  },
})
