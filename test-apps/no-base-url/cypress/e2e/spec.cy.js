/// <reference types="cypress" />
it('visits the app', () => {
  cy.visit('http://localhost:1234')
  cy.contains('Page body')

  cy.window().invoke('add', 2, 3).should('equal', 5)
  cy.window().invoke('sub', 2, 3).should('equal', -1)
})

// Test isolation leaves this test on about:blank, so the plugin's after hook
// has no baseUrl or page origin to request the backend coverage from
// https://github.com/cypress-io/code-coverage/issues/777
it('does not visit the app', () => {
  expect(true).to.be.true
})
