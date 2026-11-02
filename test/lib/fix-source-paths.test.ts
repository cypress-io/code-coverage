import { describe, it, expect } from 'vitest'
import { fixSourcePaths } from '../../lib/support-utils'

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
          sources: ['/absolute/src/component.vue', 'src/otherFile.js'],
          sourceRoot: ''
        }
      },
      '/folder/module-without-sourcemap.js': {
        path: '/folder/module-without-sourcemap.js'
      }
    })
  })

  it('resolves a relative source against a non-empty sourceRoot', () => {
    const coverage = {
      '/project/dist/bundle.js': {
        path: '/project/dist/bundle.js',
        inputSourceMap: {
          sources: ['src/a.ts', 'src/b.ts'],
          sourceRoot: '/project/'
        }
      }
    }

    fixSourcePaths(coverage)

    expect(coverage['/project/dist/bundle.js'].inputSourceMap).toEqual({
      sources: ['/project/src/a.ts', '/project/src/b.ts'],
      sourceRoot: ''
    })
  })

  it('resolves Qwik segment sources from the suffixed generated path', () => {
    const segmentPath =
      '/project/src/components/example/example.tsx_ExampleTest_component_2RuRrW0S9gQ.js'
    const coverage = {
      [segmentPath]: {
        path: segmentPath,
        inputSourceMap: {
          sources: ['src/components/example/example.tsx'],
          sourceRoot: ''
        }
      }
    }

    fixSourcePaths(coverage)

    expect(coverage[segmentPath].inputSourceMap.sources).toEqual([
      '/project/src/components/example/example.tsx'
    ])
  })

  it('resolves Qwik segment sources on Windows paths', () => {
    const segmentPath =
      'C:\\project\\src\\example.tsx_ExampleTest_component_onClick_5dWdEYGDp1Q.js'
    const coverage = {
      [segmentPath]: {
        path: segmentPath,
        inputSourceMap: { sources: ['./src/example.tsx'] }
      }
    }

    fixSourcePaths(coverage)

    expect(coverage[segmentPath].inputSourceMap.sources).toEqual([
      'C:\\project\\src\\example.tsx'
    ])
  })

  it('leaves absolute, URL, and unrelated relative sources alone', () => {
    const coverage = {
      '/project/src/main.js': {
        path: '/project/src/main.js',
        inputSourceMap: {
          sources: [
            '/other/lib.js',
            'webpack:///src/dep.js',
            '../shared/util.js'
          ],
          sourceRoot: 'webpack://'
        }
      }
    }

    fixSourcePaths(coverage)

    expect(coverage['/project/src/main.js'].inputSourceMap).toEqual({
      sources: ['/other/lib.js', 'webpack:///src/dep.js', '../shared/util.js'],
      sourceRoot: ''
    })
  })
})
