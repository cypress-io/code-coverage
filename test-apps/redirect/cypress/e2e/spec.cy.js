/// <reference types="Cypress" />

context('Page test', () => {
  it('redirects back to the app', function() {
    cy.clearLocalStorage()
    cy.visit("http://localhost:1234")
    cy.contains("Returned to app")
  })
})
