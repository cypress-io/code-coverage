it('shows the sum', () => {
  cy.visit('/')
  cy.contains('#result', '2 + 3 = 5')
})
