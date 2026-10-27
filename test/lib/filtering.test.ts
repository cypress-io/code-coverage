import { describe, it, expect, beforeEach, vi } from 'vitest'
import { minimatch } from 'minimatch'
import _ from 'lodash'

import { filterFilesFromCoverage } from '../../lib/support-utils'

vi.stubGlobal('Cypress', {
  minimatch,
  _
})

describe('minimatch', () => {
  it('string matches', () => {
    expect(minimatch('/user/app/src/codeA.js', '/user/app/src/codeA.js')).toBe(
      true
    )

    expect(minimatch('/user/app/src/codeA.js', 'codeA.js')).toBe(false)

    expect(minimatch('/user/app/src/codeA.js', '**/codeA.js')).toBe(true)
  })
})

describe('filtering specs', () => {
  describe('using codeCoverage.exclude and specPattern', () => {
    let config: ReturnType<typeof vi.fn>
    let expose: ReturnType<typeof vi.fn>
    let spec: { absolute: string; relative: string }

    beforeEach(() => {
      config = vi.fn()

      expose = vi.fn().mockReturnValue({
        codeCoverage: {
          exclude: 'cypress/**/*.*'
        }
      })

      spec = {
        absolute: '/user/app/cypress/integration/test.cy.js',
        relative: 'cypress/integration/test.cy.js'
      }
    })

    it('filters list of specs by single string', () => {
      config.mockImplementation((key: string) => {
        if (key === 'specPattern') return 'specA.cy.js'
        return undefined
      })
      const totalCoverage = {
        '/user/app/src/specA.cy.js': {},
        '/user/app/src/specB.cy.js': {}
      }
      const result = filterFilesFromCoverage(
        totalCoverage,
        config as any,
        expose as any,
        spec as any
      )
      expect(result).toEqual({
        '/user/app/src/specB.cy.js': {}
      })
    })

    it('filters list of specs by single string in array', () => {
      config.mockImplementation((key: string) => {
        if (key === 'specPattern') return ['specA.cy.js']
        return undefined
      })
      const totalCoverage = {
        '/user/app/src/specA.cy.js': {},
        '/user/app/src/specB.cy.js': {}
      }
      const result = filterFilesFromCoverage(
        totalCoverage,
        config as any,
        expose as any,
        spec as any
      )
      expect(result).toEqual({
        '/user/app/src/specB.cy.js': {}
      })
    })

    it('filters out file in codeCoverage.exclude', () => {
      config.mockImplementation((key: string) => {
        if (key === 'specPattern') return ['**/*.cy.js']
        return undefined
      })
      const totalCoverage = {
        '/user/app/cypress/support/index.js': {},
        '/user/app/cypress/commands/index.js': {},
        '/user/app/src/codeA.js': {},
        '/user/app/src/codeB.js': {}
      }
      const result = filterFilesFromCoverage(
        totalCoverage,
        config as any,
        expose as any,
        spec as any
      )
      expect(result).toEqual({
        '/user/app/src/codeA.js': {},
        '/user/app/src/codeB.js': {}
      })
    })

    it('filters list of specs by pattern', () => {
      config.mockImplementation((key: string) => {
        if (key === 'specPattern') return ['**/*B.js']
        return undefined
      })

      const totalCoverage = {
        '/user/app/src/codeA.js': {},
        '/user/app/src/codeB.js': {}
      }
      const result = filterFilesFromCoverage(
        totalCoverage,
        config as any,
        expose as any,
        spec as any
      )
      expect(result).toEqual({
        '/user/app/src/codeA.js': {}
      })
    })

    it('filters list of specs by pattern and single spec', () => {
      config.mockImplementation((key: string) => {
        if (key === 'specPattern') return ['**/*B.js', 'codeA.js']
        return undefined
      })

      const totalCoverage = {
        '/user/app/src/codeA.js': {},
        '/user/app/src/codeB.js': {}
      }
      const result = filterFilesFromCoverage(
        totalCoverage,
        config as any,
        expose as any,
        spec as any
      )
      expect(result).toEqual({})
    })

    it('filters list of specs matching specPattern', () => {
      config.mockImplementation((key: string) => {
        if (key === 'specPattern') return '**/*.cy.{js,jsx,ts,tsx}' // default pattern
        return undefined
      })

      const totalCoverage = {
        '/user/app/src/codeA.js': {},
        '/user/app/src/codeB.js': {},
        '/user/app/cypress/integration/spec1.cy.js': {},
        '/user/app/cypress/integration/spec2.cy.js': {}
      }
      const result = filterFilesFromCoverage(
        totalCoverage,
        config as any,
        expose as any,
        spec as any
      )
      expect(result).toEqual({
        '/user/app/src/codeA.js': {},
        '/user/app/src/codeB.js': {}
      })
    })

    it('filters list of specs when specPattern specifies folder', () => {
      config.mockImplementation((key: string) => {
        if (key === 'specPattern') return ['src/**/*.cy.js']
        return undefined
      })

      const totalCoverage = {
        '/user/app/src/specA.cy.js': {},
        '/user/app/src/specB.cy.js': {},
        'src/my-code.js': {}
      }
      const result = filterFilesFromCoverage(
        totalCoverage,
        config as any,
        expose as any,
        spec as any
      )
      expect(result).toEqual({
        'src/my-code.js': {}
      })
    })

    it('filters list of specs when exclude pattern is an array', () => {
      expose = vi.fn().mockReturnValue({
        codeCoverage: {
          exclude: ['cypress/**/a.js', 'cypress/**/b.js']
        }
      })

      config.mockImplementation((key: string) => {
        if (key === 'specPattern') return ['src/**/*.cy.js']
        return undefined
      })

      const totalCoverage = {
        '/user/app/cypress/a.js': {},
        '/user/app/cypress/b.js': {},
        '/user/app/cypress/c.js': {},
        'src/my-code.js': {}
      }
      const result = filterFilesFromCoverage(
        totalCoverage,
        config as any,
        expose as any,
        spec as any
      )
      expect(result).toEqual({
        '/user/app/cypress/c.js': {},
        'src/my-code.js': {}
      })
    })

    it('filters Windows paths against forward-slash patterns', () => {
      config.mockImplementation((key: string) => {
        if (key === 'specPattern') return 'cypress/e2e/**/*.cy.js'
        return undefined
      })
      spec = {
        absolute: 'C:\\user\\app\\cypress\\e2e\\test.cy.js',
        relative: 'cypress\\e2e\\test.cy.js'
      }

      const totalCoverage = {
        'C:\\user\\app\\cypress\\e2e\\specA.cy.js': {},
        'C:\\user\\app\\src\\codeA.js': {}
      }
      const result = filterFilesFromCoverage(
        totalCoverage,
        config as any,
        expose as any,
        spec as any
      )
      expect(result).toEqual({
        'C:\\user\\app\\src\\codeA.js': {}
      })
    })
  })

  // https://github.com/cypress-io/code-coverage/issues/908
  describe('keys that are not file paths', () => {
    const config = vi.fn((key: string) => {
      if (key === 'specPattern') return '**/*.cy.js'
      return undefined
    })
    const expose = vi.fn().mockReturnValue({})
    const spec = {
      absolute: '/user/app/cypress/e2e/test.cy.js',
      relative: 'cypress/e2e/test.cy.js'
    }

    const filter = (totalCoverage: object) =>
      filterFilesFromCoverage(
        totalCoverage as any,
        config as any,
        expose as any,
        spec as any
      )

    it('ignores Symbol keys on the coverage object prototype', () => {
      // some runtimes (e.g. a dynamically imported wasm module) add a Symbol key
      // to the prototype of window.__coverage__
      const totalCoverage = Object.create({ [Symbol('wasm type')]: 0 })
      totalCoverage['/user/app/src/codeA.js'] = {}
      totalCoverage['/user/app/src/specA.cy.js'] = {}

      const result = filter(totalCoverage)
      expect(result).toEqual({ '/user/app/src/codeA.js': {} })
      expect(Object.getOwnPropertySymbols(result)).toEqual([])
    })

    it('ignores own Symbol keys', () => {
      const totalCoverage = {
        '/user/app/src/codeA.js': {},
        [Symbol('wasm type')]: 0
      }

      const result = filter(totalCoverage)
      expect(result).toEqual({ '/user/app/src/codeA.js': {} })
      expect(Object.getOwnPropertySymbols(result)).toEqual([])
    })

    it('ignores inherited string keys', () => {
      const totalCoverage = Object.create({ notAFile: 0 })
      totalCoverage['/user/app/src/codeA.js'] = {}

      const result = filter(totalCoverage)
      expect(Object.keys(result)).toEqual(['/user/app/src/codeA.js'])
    })

    it('ignores non-file keys when filtering the support file', () => {
      const withSupportFile = vi.fn((key: string) => {
        if (key === 'specPattern') return '**/*.cy.js'
        if (key === 'supportFile') return '/user/app/cypress/support/e2e.js'
        return undefined
      })
      const totalCoverage = Object.create({
        notAFile: 0,
        [Symbol('wasm type')]: 0
      })
      totalCoverage['/user/app/cypress/support/e2e.js'] = {}
      totalCoverage['/user/app/src/codeA.js'] = {}

      const result = filterFilesFromCoverage(
        totalCoverage,
        withSupportFile as any,
        expose as any,
        spec as any
      )
      expect(Object.keys(result)).toEqual(['/user/app/src/codeA.js'])
      expect(Object.getOwnPropertySymbols(result)).toEqual([])
    })
  })
})
