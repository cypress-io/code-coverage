/// <reference types="Cypress" />
it('has backend code coverage', () => {
  cy.visit('/')
  cy.request('/hello')
})

// https://github.com/cypress-io/code-coverage/issues/906
// As the last test, its `baseUrl: null` is what the after() hooks see
it('still collects backend coverage after visiting a local file', { baseUrl: null }, () => {
  cy.visit('cypress/local-page.html')
  cy.contains('local page')
})
