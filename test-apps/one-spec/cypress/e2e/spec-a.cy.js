/// <reference types="cypress" />
it('spec a', () => {
  cy.visit('/')
  cy.contains('Page body')

  cy.window()
    .invoke('add', 2, 3)
    .should('equal', 5)

  cy.window()
    .invoke('sub', 2, 3)
    .should('equal', -1)

  // some runtimes (e.g. a dynamically imported wasm module) add keys that are
  // not file paths to the coverage object's prototype; they must be ignored
  // https://github.com/cypress-io/code-coverage/issues/908
  cy.window().then((win) => {
    Object.setPrototypeOf(win.__coverage__, {
      notAFile: 0,
      [Symbol('wasm type')]: 0
    })
  })
})
