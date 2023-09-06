/// <reference types="cypress" />

import Stepper from './Stepper'

describe('Stepper.cy.js', () => {
  const stepperSelector = '[data-testid=stepper]'
  const incrementSelector = '[aria-label=increment]'
  const decrementSelector = '[aria-label=decrement]'

  it('playground', () => {
    cy.mount(<Stepper />)
  })

  it('stepper should default to 0', () => {
    // Arrange
    cy.mount(<Stepper />)
    // Assert
    cy.get(stepperSelector).should('contain.text', 0)
  })

  it('can be incremented', () => {
    // Arrange
    cy.mount(<Stepper />)
    // Act
    cy.get(incrementSelector).click()
    // Assert
    cy.get(stepperSelector).should('contain.text', 1)
  })

  it('can be decremented', () => {
    // Arrange
    cy.mount(<Stepper />)
    // Act
    cy.get(decrementSelector).click()
    // Assert
    cy.get(stepperSelector).should('contain.text', -1)
  })
})
