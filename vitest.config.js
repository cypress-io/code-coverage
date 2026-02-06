import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    include: ['test/**/*.test.js'],
    coverage: {
      provider: 'istanbul',
      reporter: ['lcov', 'json', 'json-summary', 'text'],
      reportsDirectory: './coverage',
      include: ['lib/common-utils.js', 'lib/support-utils.js'],
      exclude: ['test/**', 'node_modules/**', 'cypress/**'],
      thresholds: {
        lines: 80
      }
    }
  }
})
