import { describe, it, expect, beforeEach, vi, beforeAll } from 'vitest'
import { minimatch } from 'minimatch'
import _ from 'lodash'

// Mock Cypress globals before importing support-utils
global.Cypress = {
  minimatch,
  _: {
    omitBy: _.omitBy
  }
}

const { filterFilesFromCoverage } = require('../support-utils')

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
  describe('using integrationFolder and testFiles in Cypress < v10', () => {
    let config
    let expose
    let spec

    beforeEach(() => {
      const configValues = {
        integrationFolder: '/user/app/cypress/integration',
        supportFile: '/user/app/cypress/support/index.js',
        supportFolder: '/user/app/cypress/support'
      }
      config = vi.fn((key) => {
        return configValues[key]
      })

      expose = vi.fn().mockReturnValue({})

      spec = {
        absolute: '/user/app/cypress/integration/test.cy.js',
        relative: 'cypress/integration/test.cy.js'
      }
    })

    it('filters list of specs by single string', () => {
      config.mockImplementation((key) => {
        if (key === 'testFiles') return 'specA.js'
        if (key === 'integrationFolder') return '/user/app/cypress/integration'
        if (key === 'supportFile') return '/user/app/cypress/support/index.js'
        if (key === 'supportFolder') return '/user/app/cypress/support'
        return undefined
      })
      const totalCoverage = {
        '/user/app/cypress/integration/specA.js': {},
        '/user/app/cypress/integration/specB.js': {}
      }
      const result = filterFilesFromCoverage(totalCoverage, config, expose, spec)
      expect(result).toEqual({
        '/user/app/cypress/integration/specB.js': {}
      })
    })

    it('filters list of specs by single string in array', () => {
      config.mockImplementation((key) => {
        if (key === 'testFiles') return ['codeA.js']
        if (key === 'integrationFolder') return '/user/app/cypress/integration'
        if (key === 'supportFile') return '/user/app/cypress/support/index.js'
        if (key === 'supportFolder') return '/user/app/cypress/support'
        return undefined
      })
      const totalCoverage = {
        '/user/app/src/codeA.js': {},
        '/user/app/src/codeB.js': {}
      }
      const result = filterFilesFromCoverage(totalCoverage, config, expose, spec)
      expect(result).toEqual({
        '/user/app/src/codeB.js': {}
      })
    })

    it('filters list of specs by pattern', () => {
      config.mockImplementation((key) => {
        if (key === 'testFiles') return ['**/*B.js']
        if (key === 'integrationFolder') return '/user/app/cypress/integration'
        if (key === 'supportFile') return '/user/app/cypress/support/index.js'
        if (key === 'supportFolder') return '/user/app/cypress/support'
        return undefined
      })

      const totalCoverage = {
        '/user/app/src/codeA.js': {},
        '/user/app/src/codeB.js': {}
      }
      const result = filterFilesFromCoverage(totalCoverage, config, expose, spec)
      expect(result).toEqual({
        '/user/app/src/codeA.js': {}
      })
    })

    it('filters list of specs by pattern and single spec', () => {
      config.mockImplementation((key) => {
        if (key === 'testFiles') return ['**/*B.js', 'codeA.js']
        if (key === 'integrationFolder') return '/user/app/cypress/integration'
        if (key === 'supportFile') return '/user/app/cypress/support/index.js'
        if (key === 'supportFolder') return '/user/app/cypress/support'
        return undefined
      })

      const totalCoverage = {
        '/user/app/src/codeA.js': {},
        '/user/app/src/codeB.js': {}
      }
      const result = filterFilesFromCoverage(totalCoverage, config, expose, spec)
      expect(result).toEqual({})
    })

    it('filters specs from integration folder', () => {
      config.mockImplementation((key) => {
        if (key === 'testFiles') return '**/*.*' // default pattern
        if (key === 'integrationFolder') return '/user/app/cypress/integration'
        if (key === 'supportFile') return '/user/app/cypress/support/index.js'
        if (key === 'supportFolder') return '/user/app/cypress/support'
        return undefined
      })

      const totalCoverage = {
        '/user/app/src/codeA.js': {},
        '/user/app/src/codeB.js': {},
        // these files should be removed
        '/user/app/cypress/integration/spec1.js': {},
        '/user/app/cypress/integration/spec2.js': {}
      }
      const result = filterFilesFromCoverage(totalCoverage, config, expose, spec)
      expect(result).toEqual({
        '/user/app/src/codeA.js': {},
        '/user/app/src/codeB.js': {}
      })
    })

    it('filters list of specs when testFiles specifies folder', () => {
      config.mockImplementation((key) => {
        if (key === 'testFiles') return ['cypress/integration/**.*']
        if (key === 'integrationFolder') return '/user/app/cypress/integration'
        if (key === 'supportFile') return '/user/app/cypress/support/index.js'
        if (key === 'supportFolder') return '/user/app/cypress/support'
        return undefined
      })

      const totalCoverage = {
        '/user/app/cypress/integration/specA.js': {},
        '/user/app/cypress/integration/specB.js': {},
        // This file should be included in coverage
        'src/my-code.js': {}
      }
      const result = filterFilesFromCoverage(totalCoverage, config, expose, spec)
      expect(result).toEqual({
        'src/my-code.js': {}
      })
    })

    it('filters files out of cypress support directory', () => {
      config.mockImplementation((key) => {
        if (key === 'testFiles') return ['**/*.*'] // default pattern
        if (key === 'integrationFolder') return '/user/app/cypress/integration'
        if (key === 'supportFile') return '/user/app/cypress/support/index.js'
        if (key === 'supportFolder') return '/user/app/cypress/support'
        return undefined
      })
      const totalCoverage = {
        '/user/app/cypress/support/index.js': {},
        '/user/app/cypress/support/command.js': {},
        '/user/app/cypress/integration/spec.js': {},
        // This file should be included in coverage
        'src/my-code.js': {}
      }
      const result = filterFilesFromCoverage(totalCoverage, config, expose, spec)
      expect(result).toEqual({
        'src/my-code.js': {}
      })
    })
  })

  describe('using codeCoverage.exclude and specPattern in Cypress >= v10', () => {
    let config
    let expose
    let spec

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
      config.mockImplementation((key) => {
        if (key === 'specPattern') return 'specA.cy.js'
        return undefined
      })
      const totalCoverage = {
        '/user/app/src/specA.cy.js': {},
        '/user/app/src/specB.cy.js': {}
      }
      const result = filterFilesFromCoverage(totalCoverage, config, expose, spec)
      expect(result).toEqual({
        '/user/app/src/specB.cy.js': {}
      })
    })

    it('filters list of specs by single string in array', () => {
      config.mockImplementation((key) => {
        if (key === 'specPattern') return ['specA.cy.js']
        return undefined
      })
      const totalCoverage = {
        '/user/app/src/specA.cy.js': {},
        '/user/app/src/specB.cy.js': {}
      }
      const result = filterFilesFromCoverage(totalCoverage, config, expose, spec)
      expect(result).toEqual({
        '/user/app/src/specB.cy.js': {}
      })
    })

    it('filters out file in codeCoverage.exclude', () => {
      config.mockImplementation((key) => {
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
      const result = filterFilesFromCoverage(totalCoverage, config, expose, spec)
      expect(result).toEqual({
        '/user/app/src/codeA.js': {},
        '/user/app/src/codeB.js': {}
      })
    })

    it('filters list of specs by pattern', () => {
      config.mockImplementation((key) => {
        if (key === 'specPattern') return ['**/*B.js']
        return undefined
      })

      const totalCoverage = {
        '/user/app/src/codeA.js': {},
        '/user/app/src/codeB.js': {}
      }
      const result = filterFilesFromCoverage(totalCoverage, config, expose, spec)
      expect(result).toEqual({
        '/user/app/src/codeA.js': {}
      })
    })

    it('filters list of specs by pattern and single spec', () => {
      config.mockImplementation((key) => {
        if (key === 'specPattern') return ['**/*B.js', 'codeA.js']
        return undefined
      })

      const totalCoverage = {
        '/user/app/src/codeA.js': {},
        '/user/app/src/codeB.js': {}
      }
      const result = filterFilesFromCoverage(totalCoverage, config, expose, spec)
      expect(result).toEqual({})
    })

    it('filters list of specs in integration folder', () => {
      config.mockImplementation((key) => {
        if (key === 'specPattern') return '**/*.cy.{js,jsx,ts,tsx}' // default pattern
        return undefined
      })

      const totalCoverage = {
        '/user/app/src/codeA.js': {},
        '/user/app/src/codeB.js': {},
        // these files should be removed
        '/user/app/cypress/integration/spec1.js': {},
        '/user/app/cypress/integration/spec2.js': {}
      }
      const result = filterFilesFromCoverage(totalCoverage, config, expose, spec)
      expect(result).toEqual({
        '/user/app/src/codeA.js': {},
        '/user/app/src/codeB.js': {}
      })
    })

    it('filters list of specs when specPattern specifies folder', () => {
      config.mockImplementation((key) => {
        if (key === 'specPattern') return ['src/**/*.cy.js']
        return undefined
      })

      const totalCoverage = {
        '/user/app/src/specA.cy.js': {},
        '/user/app/src/specB.cy.js': {},
        // This file should be included in coverage
        'src/my-code.js': {}
      }
      const result = filterFilesFromCoverage(totalCoverage, config, expose, spec)
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

      config.mockImplementation((key) => {
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
      const result = filterFilesFromCoverage(totalCoverage, config, expose, spec)
      expect(result).toEqual({
        '/user/app/cypress/c.js': {},
        'src/my-code.js': {}
      })
    })
  })
})

