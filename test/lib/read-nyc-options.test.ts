import { describe, it, expect } from 'vitest'
import { join } from 'path'
import { readNycOptions } from '../../lib/task-utils'

const fixtures = join(__dirname, '__fixtures__', 'nyc-config')

describe('readNycOptions', () => {
  it('reads an ES module nyc.config.js in a "type": "module" project', () => {
    const options = readNycOptions(join(fixtures, 'esm-js'))
    expect(options['report-dir']).toBe('esm-js-coverage')
    expect(options.reporter).toEqual(['text'])
    expect(options).not.toHaveProperty('default')
  })

  it('reads nyc.config.mjs', () => {
    const options = readNycOptions(join(fixtures, 'mjs'))
    expect(options['report-dir']).toBe('mjs-coverage')
    expect(options.exclude).toEqual(['skip.js'])
  })

  it('still reads a CommonJS nyc.config.cjs', () => {
    const options = readNycOptions(join(fixtures, 'cjs'))
    expect(options['report-dir']).toBe('cjs-coverage')
  })

  it('suggests nyc.config.cjs when the config uses top-level await', () => {
    expect(() => readNycOptions(join(fixtures, 'top-level-await'))).toThrow(
      /Failed to load nyc\.config\.js: .*top-level await.*nyc\.config\.cjs/
    )
  })

  it('merges config files in order, with package.json last', () => {
    const options = readNycOptions(join(fixtures, 'precedence'))
    expect(options['report-dir']).toBe('from-mjs')
    expect(options.reporter).toEqual(['lcov'])
    expect(options.all).toBe(true)
  })

  it('rejects an ES module config without a default export', () => {
    expect(() => readNycOptions(join(fixtures, 'named-exports'))).toThrow(
      'Failed to load nyc.config.mjs: it has no default export'
    )
  })

  it('rejects a config that does not export an object', () => {
    expect(() => readNycOptions(join(fixtures, 'function-export'))).toThrow(
      'Failed to load nyc.config.mjs: it must export a plain object of NYC options'
    )
  })

  it('reports why a config file failed to load', () => {
    expect(() => readNycOptions(join(fixtures, 'syntax-error'))).toThrow(
      /Failed to load nyc\.config\.cjs: .*Unexpected end of input/
    )
  })
})
