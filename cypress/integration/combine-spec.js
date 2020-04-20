const { combineNycOptions, defaultNycOptions } = require('../../task-utils')
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
})
