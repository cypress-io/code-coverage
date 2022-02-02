/// <reference types="cypress" />
describe('ts-example', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('calls add', () => {
    cy.window()
      .invoke('add', 2, 3)
      .should('equal', 5)
  })

  it('calls sub', () => {
    cy.window()
      .invoke('sub', 2, 3)
      .should('equal', -1)
  })

  it('calls abs twice', () => {
    cy.window()
      .invoke('abs', 2)
      .should('equal', 2)

    cy.window()
      .invoke('abs', -5)
      .should('equal', 5)
  })
})
