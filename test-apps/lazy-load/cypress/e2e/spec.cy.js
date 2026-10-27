/// <reference types="cypress" />
describe('lazy-loaded code', () => {
  it('collects coverage created after the page loads', () => {
    cy.visit('/')
    // "window.__coverage__" does not exist yet
    cy.window().should('not.have.property', '__coverage__')

    cy.get('#load-remote').click()
    cy.get('body').should('have.attr', 'data-remote', 'loaded')
    cy.window().should('have.property', '__coverage__')
    cy.window().invoke('multiply', 2, 3).should('equal', 6)
  })
})
