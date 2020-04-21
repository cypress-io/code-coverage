const { combineNycOptions, defaultNycOptions } = require('../../common-utils')
describe('Combine NYC options', () => {
  it('overrides defaults', () => {
    const pkgNycOptions = {
      extends: '@istanbuljs/nyc-config-typescript',
      all: true
    }
    const combined = combineNycOptions({
      pkgNycOptions,
      defaultNycOptions
    })
    cy.wrap(combined).should('deep.equal', {
      extends: '@istanbuljs/nyc-config-typescript',
      all: true,
      'report-dir': './coverage',
      reporter: ['lcov', 'clover', 'json'],
      extension: ['.js', '.cjs', '.mjs', '.ts', '.tsx', '.jsx'],
      excludeAfterRemap: true
    })
  })

  it('allows to specify reporter, but changes to array', () => {
    const pkgNycOptions = {
      reporter: 'text'
    }
    const combined = combineNycOptions({
      pkgNycOptions,
      defaultNycOptions
    })
    cy.wrap(combined).should('deep.equal', {
      'report-dir': './coverage',
      reporter: ['text'],
      extension: ['.js', '.cjs', '.mjs', '.ts', '.tsx', '.jsx'],
      excludeAfterRemap: true
    })
  })

  it('combines multiple options', () => {
    const pkgNycOptions = {
      all: true,
      extension: '.js'
    }
    const nycrc = {
      include: ['foo.js']
    }
    const nycrcJson = {
      exclude: ['bar.js'],
      reporter: ['json']
    }
    const combined = combineNycOptions({
      pkgNycOptions,
      nycrc,
      nycrcJson,
      defaultNycOptions
    })
    cy.wrap(combined).should('deep.equal', {
      all: true,
      'report-dir': './coverage',
      reporter: ['json'],
      extension: ['.js'],
      excludeAfterRemap: true,
      include: ['foo.js'],
      exclude: ['bar.js']
    })
  })
})
