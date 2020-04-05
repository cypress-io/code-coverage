/// <reference types="cypress" />
it('works', () => {
  cy.visit('/')
  cy.contains('Page body')
})
