// enables intelligent code completion for Cypress commands
// https://on.cypress.io/intelligent-code-completion
/// <reference types="Cypress" />

import { add } from '../../unit'

context('Page test', () => {
  beforeEach(() => {
    cy.visit('/', {
      onBeforeLoad(win) {
        cy.spy(win.console, 'log').as('log')
      }
    })
  })

  it('logs names', function() {
    cy.get('@log')
      .should('have.been.calledOnce')
      .should('have.been.calledWith', 'just names', ['joe', 'mary'])
  })

  it('loads About page', () => {
    cy.contains('About').click()
    cy.url().should('match', /\/about/)
    cy.contains('h2', 'About')
    cy.contains('Est. 2019')
  })
})

context('Unit tests', () => {
  it('adds numbers', () => {
    expect(add(2, 3)).to.equal(5)
  })

  it('concatenates strings', () => {
    expect(add('foo', 'Bar')).to.equal('fooBar')
  })

})
