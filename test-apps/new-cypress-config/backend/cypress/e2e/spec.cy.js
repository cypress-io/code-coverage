/// <reference types="Cypress" />
it('has backend code coverage', () => {
  cy.visit('/')
  cy.request('/hello')
})
