import { Counter } from './Counter'

describe('Counter', () => {
  it('starts at zero', () => {
    cy.mount(<Counter />)
    cy.contains('Zero')
  })

  it('increments', () => {
    cy.mount(<Counter initial={1} />)
    cy.contains('button', 'Increment').click()
    cy.contains('Count: 2')
  })
})
