/// <reference types="Cypress" />

// load extra files to instrument on the fly
const { reverse } = require('../../string-utils')

it('uses frontend code and calls backend', () => {
  cy.visit('/')
  cy.contains('Page body').should('be.visible')

  cy.window()
    .invoke('add', 2, 3)
    .should('equal', 5)

  cy.window()
    .invoke('sub', 2, 3)
    .should('equal', -1)

  cy.log('**backend request**')
  cy.request('/hello')

  cy.log('**unit test**')
  expect(reverse('Hello')).to.equal('olleH')
})
