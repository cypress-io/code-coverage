import { describe, it, expect } from 'vitest'
const { fixSourcePaths } = require('../../lib/support-utils')

describe('fixSourcePaths', () => {
  it('fixes webpack loader source-map pathes', () => {
    const coverage = {
      '/absolute/src/component.vue': {
        path: '/absolute/src/component.vue',
        inputSourceMap: {
          sources: [
            '/folder/node_modules/cache-loader/dist/cjs.js??ref--0-0!/folder/node_modules/vue-loader/lib/index.js??vue-loader-options!component.vue?vue&type=script&lang=ts&',
            'otherFile.js'
          ],
          sourceRoot: 'src'
        }
      },
      '/folder/module-without-sourcemap.js': {
        path: '/folder/module-without-sourcemap.js'
      }
    }

    fixSourcePaths(coverage)

    expect(coverage).toEqual({
      '/absolute/src/component.vue': {
        path: '/absolute/src/component.vue',
        inputSourceMap: {
          sources: ['/absolute/src/component.vue', 'otherFile.js'],
          sourceRoot: ''
        }
      },
      '/folder/module-without-sourcemap.js': {
        path: '/folder/module-without-sourcemap.js'
      }
    })
  })
})

