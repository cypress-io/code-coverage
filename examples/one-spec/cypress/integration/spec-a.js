/// <reference types="cypress" />
it('spec a', () => {
  cy.visit('index.html')
  cy.contains('Page body')
})
