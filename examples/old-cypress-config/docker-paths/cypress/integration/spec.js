/// <reference types="cypress" />
describe('docker-paths', () => {
  it('works', () => {
    cy.visit('dist/index.html')
    cy.contains('Page body')

    cy.window()
      .invoke('reverse', 'super')
      .should('equal', 'repus')
  })
})
