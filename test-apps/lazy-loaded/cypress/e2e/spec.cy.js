/// <reference types="cypress" />
it('collects coverage from code loaded after the window load event', () => {
  cy.visit('/')
  cy.contains('#app', 'Hello, lazy chunk')

  cy.window().invoke('greet', 'Cypress').should('equal', 'Hello, Cypress')
})
