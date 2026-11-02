const { defineConfig } = require('cypress')

module.exports = defineConfig({
  allowCypressEnv: false,
  e2e: {
    setupNodeEvents(on, config) {
      return require('./plugins.js')(on, config)
    },
    // The negated entry guards against dropping all app coverage (#472)
    specPattern: ['./**/spec.js', '!**/ignored/**/spec.js'],
    supportFile: 'support.js',
    baseUrl: 'http://localhost:1234',
    expose: {
      codeCoverage: {
        exclude: ['spec.js', 'support.js']
      }
    }
  },
})
