const { defineConfig } = require('cypress')

module.exports = defineConfig({
  allowCypressEnv: false,
  fixturesFolder: false,
  e2e: {
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
    expose: {
      codeCoverage: {
        exclude: 'cypress/**/*.*'
      }
    }
  },
})
