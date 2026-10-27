/// <reference types="cypress" />
it('works', () => {
  cy.visit('/')
  cy.contains('Page body')

  cy.window()
    .invoke('reverse', 'super')
    .should('equal', 'repus')

  cy.window().should('have.property', '__coverage__')
})

