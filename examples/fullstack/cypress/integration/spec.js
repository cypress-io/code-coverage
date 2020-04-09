/// <reference types="Cypress" />
it('uses frontend code and calls backend', () => {
  cy.visit('/')
  cy.contains('Page body').should('be.visible')

  cy.window()
    .invoke('add', 2, 3)
    .should('equal', 5)

  cy.window()
    .invoke('sub', 2, 3)
    .should('equal', -1)

  cy.log('** backend request **')
  cy.request('/hello')
})
