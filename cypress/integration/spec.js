// enables intelligent code completion for Cypress commands
// https://on.cypress.io/intelligent-code-completion
/// <reference types="Cypress" />

import { add } from '../unit'
const { fixSourcePathes } = require('../../utils')

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

  it('fixes webpack loader source-map path', () => {
    const coverage = {
      '/folder/module.js': {
        inputSourceMap: {
          sources: ['/folder/module.js']
        }
      },
      '/folder/component.vue': {
        inputSourceMap: {
          sources: [
            '/folder/node_modules/cache-loader/dist/cjs.js??ref--0-0!/folder/node_modules/vue-loader/lib/index.js??vue-loader-options!/folder/component.vue?vue&type=script&lang=ts&'
          ]
        }
      },
      '/folder/module-without-sourcemap.js': {
        path: '/folder/module-without-sourcemap.js'
      }
    }

    fixSourcePathes(coverage)

    expect(coverage['/folder/module.js'].inputSourceMap.sources)
      .to.deep.equal(['/folder/module.js'])
    expect(coverage['/folder/component.vue'].inputSourceMap.sources)
      .to.deep.equal(['/folder/component.vue'])
    expect(coverage['/folder/module-without-sourcemap.js'].path)
      .to.eq('/folder/module-without-sourcemap.js')
  })
})
