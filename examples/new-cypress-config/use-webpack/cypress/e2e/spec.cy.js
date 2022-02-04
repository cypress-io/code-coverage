/// <reference types="cypress" />
import { add } from '../../src/calc'

describe('Webpack example', () => {
  it('loads', () => {
    cy.visit('/')
    cy.contains('Webpack page').should('be.visible')
    cy.get('#user-input').type('Hello{enter}')
    cy.contains('olleH').should('be.visible')
  })

  it('has add function', () => {
    // test "add" via this unit test
    expect(add(2, 3)).to.equal(5)
  })
})
