/// <reference types="cypress" />
const itsName = require('its-name')

let codeCoveragePerTest = new Map()

before(() => {
  // we need to reset the coverage when running
  // in the interactive mode, otherwise the counters will
  // keep increasing every time we rerun the tests
  const isInteractive = Cypress.config('isInteractive')

  cy.task('resetCoverage', { isInteractive })

  if (isInteractive) {
    codeCoveragePerTest = new Map()
  }
})

// use "function () {...}" callback to get "this" pointing
// at the right context
afterEach(function () {
  // save coverage after each test
  // because the entire "window" object is about
  // to be recycled by Cypress before next test
  cy.window().then(win => {
    if (win.__coverage__) {
      // only keep track of code coverage per test in the interactive mode
      if (Cypress.config('isInteractive')) {
        // testName will be an array of strings
        const testName = itsName(this.currentTest)
        console.log('test that finished', testName)

        codeCoveragePerTest[testName] = win.__coverage__
      }

      cy.task('combineCoverage', win.__coverage__)
    }
  })
})

after(() => {
  // when all tests finish, lets generate the coverage report
  cy.task('coverageReport')

  console.log(
    'after all tests finished, coverage per test is',
    codeCoveragePerTest
  )
})
