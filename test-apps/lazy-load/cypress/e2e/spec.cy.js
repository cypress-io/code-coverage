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

  // the plugin reads "window.__coverage__" again after each test,
  // which must not fail when the test ends on another origin
  it('does not fail when the test ends on another origin', () => {
    cy.visit('/')
    cy.window().then((win) => {
      win.location.href = 'http://127.0.0.1:1234/'
    })
    cy.origin('http://127.0.0.1:1234', () => {
      cy.get('#load-remote').should('exist')
    })
  })
})
