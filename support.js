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
    // if application code has been instrumented, the app iframe "window" has an object
    const applicationSourceCoverage = win.__coverage__

    if (applicationSourceCoverage) {
      cy.task('combineCoverage', applicationSourceCoverage)
    }
  })
})

after(() => {
  const specFolder = Cypress.config('integrationFolder')
  const supportFolder = Cypress.config('supportFolder')

  // if spec bundle has been instrumented (using Cypress preprocessor)
  // then we will have unit test coverage
  // NOTE: spec iframe is NOT reset between the tests, so we can grab
  // the coverage information only once after all tests have finished
  const unitTestCoverage = window.__coverage__
  if (unitTestCoverage) {
    // remove coverage for the spec files themselves,
    // only keep "external" application source file coverage
    const coverage = Cypress._.omitBy(
      window.__coverage__,
      (fileCoverage, filename) =>
        filename.startsWith(specFolder) || filename.startsWith(supportFolder)
    )
    cy.task('combineCoverage', coverage)
  }

  // when all tests finish, lets generate the coverage report
  cy.task('coverageReport')
})
