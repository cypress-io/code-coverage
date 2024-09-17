/// <reference types="Cypress" />
it('has multiple backends with code coverage', () => {
  cy.visit('/')
  cy.request('/hello')
  cy.request('http://localhost:3004/world')
})
