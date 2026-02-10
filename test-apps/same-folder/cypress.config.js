const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      return require('./plugins.js')(on, config)
    },
    specPattern: './**/spec.js',
    supportFile: 'support.js',
    baseUrl: 'http://localhost:1234',
    env: {
      codeCoverage: {
        exclude: ['spec.js', 'support.js']
      }
    }
  },
})
