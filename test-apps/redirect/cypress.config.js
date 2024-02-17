const { defineConfig } = require('cypress')

module.exports = defineConfig({
  fixturesFolder: false,
  e2e: {
    setupNodeEvents(on, config) {
      require('cypress-code-coverage-v8/task')(on, config)
      return config
    },
    baseUrl: 'http://localhost:1234',
    env: {
      codeCoverage: {
        exclude: ['cypress/**/*.*']
      }
    },
    chromeWebSecurity: false
  }
})
