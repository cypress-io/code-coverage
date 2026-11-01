/// <reference types="cypress" />
import { add } from '../../src/calc'

describe('Webpack TypeScript example', () => {
  it('reverses the input', () => {
    cy.visit('/')
    cy.contains('Webpack TypeScript page').should('be.visible')
    cy.get('#user-input').type('Hello{enter}')
    cy.contains('olleH').should('be.visible')
  })

  it('adds numbers', () => {
    expect(add(2, 3)).to.equal(5)
  })
})
