it('visits two pages', () => {
  cy.visit('/')
  cy.contains('#result', '2 + 3 = 5')
  cy.visit('/?second')
  cy.contains('#result', 'second page')
})
