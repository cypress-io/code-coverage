import { defineConfig } from 'cypress'
import codecov from '@cypress/code-coverage/plugins'

export default defineConfig({
  allowCypressEnv: false,
  fixturesFolder: false,
  e2e: {
    setupNodeEvents(on, config) {
      return codecov(on, config)
    },
    baseUrl: 'http://localhost:1234'
  }
})

