import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    include: ['test/**/*.test.js'],
    coverage: {
      provider: 'istanbul',
      reporter: ['lcov', 'json', 'json-summary', 'text'],
      reportsDirectory: './coverage',
      include: ['lib/**/*.js'],
      exclude: ['test/**', 'node_modules/**', 'cypress/**'],
      thresholds: {
        lines: 80
      }
    }
  }
})

