const { defineConfig } = require('cypress')
const webpack = require('@cypress/webpack-preprocessor')

module.exports = defineConfig({
  allowCypressEnv: false,
  fixturesFolder: false,
  viewportHeight: 400,
  viewportWidth: 400,
  e2e: {
    baseUrl: 'http://localhost:1234',
    setupNodeEvents(on, config) {
      // bundling specs with the app's webpack config instruments the
      // TypeScript files they import, adding unit test coverage
      on(
        'file:preprocessor',
        webpack({ webpackOptions: require('./webpack.config') })
      )
      require('@cypress/code-coverage/task')(on, config)
      return config
    }
  }
})
