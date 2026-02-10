import Button from './Button'

describe('Button', () => {
  it('should have text', () => {
    cy.mount(<Button>Click me!</Button>)
    cy.get('button').should('contain.text', 'Click me!')
  })
})
