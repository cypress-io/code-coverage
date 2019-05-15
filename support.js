/// <reference types="cypress" />
before(() => {
  // we need to reset the coverage when running
  // in the interactive mode, otherwise the counters will
  // keep increasing every time we rerun the tests
  cy.task('resetCoverage', { isInteractive: Cypress.config('isInteractive') })
})

afterEach(() => {
  // save coverage after each test
  // because the entire "window" object is about
  // to be recycled by Cypress before next test
  cy.window().then(win => {
    if (win.__coverage__) {
      cy.task('combineCoverage', win.__coverage__)
    }
  })
})

after(() => {
  // when all tests finish, lets generate the coverage report
  cy.task('coverageReport')
})
