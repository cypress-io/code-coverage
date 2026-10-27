/// <reference types="cypress" />
it('collects coverage created after load from a page the test leaves', () => {
  cy.visit('/')
  cy.contains('#app', 'Hello, lazy chunk')
  cy.window().invoke('farewell', 'Cypress').should('equal', 'Goodbye, Cypress')

  // leave before the next page loads its lazy chunk,
  // so only the first page has the "farewell" coverage
  cy.visit('/?second')
  cy.contains('#app', 'Loading...')
})
