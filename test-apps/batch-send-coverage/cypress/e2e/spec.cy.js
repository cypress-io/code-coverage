/// <reference types="cypress" />
it('works', () => {
  cy.visit('/')
  cy.contains('Page body')

  cy.window()
    .invoke('reverse', 'super')
    .should('equal', 'repus')
  
  cy.window()
    .invoke('numsTimesTwo', [1, 2, 3])
    .should('deep.equal', [2, 4, 6])

  cy.window()
    .invoke('add', 2, 3)
    .should('equal', 5)

  cy.window()
    .invoke('sub', 5, 2)
    .should('equal', 3)

  // application's code should be instrumented
  cy.window().should('have.property', '__coverage__')
})
