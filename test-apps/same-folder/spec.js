/// <reference types="cypress" />

import { reverse } from './unit-utils'

describe('coverage information', () => {
  beforeEach(() => {
    cy.log('visiting /')
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

  it('reverses a string', () => {
    expect(reverse('Hello')).to.equal('olleH')
  })
})
