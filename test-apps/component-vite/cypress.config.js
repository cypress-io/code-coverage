import { defineConfig } from 'cypress'
import codeCoverageTask from '@cypress/code-coverage/task'

export default defineConfig({
  allowCypressEnv: false,
  fixturesFolder: false,
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite'
    },
    specPattern: 'src/**/*.cy.jsx',
    setupNodeEvents(on, config) {
      codeCoverageTask(on, config)
      return config
    }
  }
})
