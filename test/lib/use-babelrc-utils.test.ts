import { describe, it, expect } from 'vitest'
import webpackPreprocessor from '@cypress/webpack-preprocessor'
import { useBabelrcOptions } from '../../lib/use-babelrc-utils'

const babelRuleOf = (options: ReturnType<typeof useBabelrcOptions>) =>
  options.webpackOptions?.module?.rules?.[0] as {
    test: RegExp
    use: { options: Record<string, unknown> }[]
  }

describe('useBabelrcOptions', () => {
  it('removes the default presets so the .babelrc file is used', () => {
    const options = useBabelrcOptions(
      webpackPreprocessor.defaultOptions,
      '5.0.0'
    )

    expect(babelRuleOf(options).use[0].options).not.toHaveProperty('presets')
  })

  it('sends JavaScript and TypeScript files to babel', () => {
    const { test } = babelRuleOf(
      useBabelrcOptions(webpackPreprocessor.defaultOptions, '5.0.0')
    )

    for (const file of ['a.js', 'a.jsx', 'a.ts', 'a.tsx']) {
      expect(test.test(file), file).toBe(true)
    }
    expect(test.test('a.json')).toBe(false)
  })

  it("adds TypeScript extensions after webpack 5's defaults", () => {
    const options = useBabelrcOptions(
      webpackPreprocessor.defaultOptions,
      '5.99.9'
    )

    expect(options.webpackOptions?.resolve?.extensions).toEqual([
      '...',
      '.jsx',
      '.ts',
      '.tsx'
    ])
  })

  it("adds TypeScript extensions after webpack 4's defaults", () => {
    const options = useBabelrcOptions(
      webpackPreprocessor.defaultOptions,
      '4.47.0'
    )

    expect(options.webpackOptions?.resolve?.extensions).toEqual([
      '.wasm',
      '.mjs',
      '.js',
      '.json',
      '.jsx',
      '.ts',
      '.tsx'
    ])
  })

  it('keeps other resolve options', () => {
    const options = useBabelrcOptions(
      { webpackOptions: { resolve: { alias: { '@': '/src' } } } },
      '5.0.0'
    )

    expect(options.webpackOptions?.resolve?.alias).toEqual({ '@': '/src' })
  })

  it('accepts loader options set to null', () => {
    const options = {
      webpackOptions: {
        module: {
          rules: [{ use: [{ loader: 'babel-loader', options: null }] }]
        }
      }
    }

    expect(() => useBabelrcOptions(options, '5.0.0')).not.toThrow()
  })

  it('leaves options without webpackOptions alone', () => {
    expect(useBabelrcOptions({}, '5.0.0')).toEqual({})
  })
})
