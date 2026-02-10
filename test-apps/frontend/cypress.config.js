const { defineConfig } = require('cypress')

module.exports = defineConfig({
  allowCypressEnv: false,
  fixturesFolder: false,
  e2e: {
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
    hosts: {
      'foobar.com': '127.0.0.1',
    },
    baseUrl: 'http://localhost:1234',
    expose: {
      codeCoverage: {
        exclude: ['cypress/**/*.*']
      }
    }
  }
})
