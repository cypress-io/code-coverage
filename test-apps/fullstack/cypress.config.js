const { defineConfig } = require('cypress')

module.exports = defineConfig({
  fixturesFolder: false,
  env: {
    codeCoverage: {
      url: 'http://localhost:1234/__coverage__',
      exclude: 'cypress/**/*.*'
    }
  },
  e2e: {
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
    baseUrl: 'http://localhost:1234'
  }
})
