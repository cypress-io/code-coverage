import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['lib/common-utils.ts', 'lib/support-utils.ts'],
      thresholds: {
        lines: 80
      }
    }
  }
})
