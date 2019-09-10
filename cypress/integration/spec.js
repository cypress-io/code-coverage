// enables intelligent code completion for Cypress commands
// https://on.cypress.io/intelligent-code-completion
/// <reference types="Cypress" />

import { add } from '../unit'
const { fixSourcePaths } = require('../../utils')

context('Page test', () => {
  beforeEach(() => {
    cy.visit('/', {
      onBeforeLoad (win) {
        cy.spy(win.console, 'log').as('log')
      }
    })
  })

  it('logs names', function () {
    cy.get('@log')
      .should('have.been.calledOnce')
      .should('have.been.calledWith', 'just names', ['joe', 'mary'])
  })
})

context('Unit tests', () => {
  it('adds numbers', () => {
    expect(add(2, 3)).to.equal(5)
  })

  it('concatenates strings', () => {
    expect(add('foo', 'Bar')).to.equal('fooBar')
  })

  it('fixes webpack loader source-map paths', () => {
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

    expect(coverage).to.deep.eq({
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
