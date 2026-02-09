import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['common-utils.js', 'support-utils.js'],
      thresholds: {
        lines: 80
      }
    }
  }
})

