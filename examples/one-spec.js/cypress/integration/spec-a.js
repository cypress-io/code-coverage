/// <reference types="cypress" />
it('spec a', () => {
  cy.visit('/')
  cy.contains('Page body')
})
