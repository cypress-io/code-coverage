const { defineConfig } = require('cypress')

module.exports = defineConfig({
  allowCypressEnv: false,
  fixturesFolder: false,
  e2e: {
    setupNodeEvents(on, config) {
      require('@cypress/code-coverage/task')(on, config)
      return config
    },
    baseUrl: 'http://localhost:1234',
    expose: {
      codeCoverage: {
        exclude: ['cypress/**/*.*']
      }
    },
    chromeWebSecurity: false
  }
})
