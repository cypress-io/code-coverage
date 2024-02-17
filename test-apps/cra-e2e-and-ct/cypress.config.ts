import { defineConfig } from 'cypress'
import '@cypress/instrument-cra'

export default defineConfig({
  env: {
    codeCoverage: {
      exclude: 'cypress/**/*.*'
    }
  },
  e2e: {
    setupNodeEvents(on, config) {
      require('cypress-code-coverage-v8/task')(on, config)
      return config
    }
  },

  component: {
    devServer: {
      framework: 'create-react-app',
      bundler: 'webpack'
    },
    setupNodeEvents(on, config) {
      require('cypress-code-coverage-v8/task')(on, config)
      return config
    }
  }
})
