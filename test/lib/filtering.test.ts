import { describe, it, expect, beforeEach, vi } from 'vitest'
import { minimatch } from 'minimatch'
import _ from 'lodash'

import { filterFilesFromCoverage } from '../../lib/support-utils'

vi.stubGlobal('Cypress', {
  minimatch,
  _,
})

describe('minimatch', () => {
  it('string matches', () => {
    expect(
      minimatch('/user/app/src/codeA.js', '/user/app/src/codeA.js')
    ).toBe(true)

    expect(
      minimatch('/user/app/src/codeA.js', 'codeA.js')
    ).toBe(false)

    expect(
      minimatch('/user/app/src/codeA.js', '**/codeA.js')
    ).toBe(true)
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
        //filter out all files in the cypress folder
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
      const result = filterFilesFromCoverage(totalCoverage, config as any, expose as any, spec as any)
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
      const result = filterFilesFromCoverage(totalCoverage, config as any, expose as any, spec as any)
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
        //these files should be included
        '/user/app/src/codeA.js': {},
        '/user/app/src/codeB.js': {}
      }
      const result = filterFilesFromCoverage(totalCoverage, config as any, expose as any, spec as any)
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
      const result = filterFilesFromCoverage(totalCoverage, config as any, expose as any, spec as any)
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
      const result = filterFilesFromCoverage(totalCoverage, config as any, expose as any, spec as any)
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
        // these files should be removed
        '/user/app/cypress/integration/spec1.cy.js': {},
        '/user/app/cypress/integration/spec2.cy.js': {}
      }
      const result = filterFilesFromCoverage(totalCoverage, config as any, expose as any, spec as any)
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
        // This file should be included in coverage
        'src/my-code.js': {}
      }
      const result = filterFilesFromCoverage(totalCoverage, config as any, expose as any, spec as any)
      expect(result).toEqual({
        'src/my-code.js': {}
      })
    })

    it('filters list of specs when exclude pattern is an array', () => {
      expose = vi.fn().mockReturnValue({
        //filter out a.js and b.js in cypress folder
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
        // These files should be included in coverage
        '/user/app/cypress/c.js': {},
        'src/my-code.js': {}
      }
      const result = filterFilesFromCoverage(totalCoverage, config as any, expose as any, spec as any)
      expect(result).toEqual({
        '/user/app/cypress/c.js': {},
        'src/my-code.js': {}
      })
    })
  })
})

