/// <reference types="cypress" />

/**
 * Sends collected code coverage object to the backend code
 * via "cy.task".
 */
const sendCoverage = coverage => {
  cy.log('Saving code coverage')
  // stringify coverage object for speed
  cy.task('combineCoverage', JSON.stringify(coverage), {
    log: false
  })
}

// to disable code coverage commands and save time
// pass environment variable coverage=false
//  cypress run --env coverage=false
// see https://on.cypress.io/environment-variables
if (Cypress.env('coverage') === false) {
  console.log('Skipping code coverage hooks')
} else {
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
        sendCoverage(applicationSourceCoverage)
      }
    })
  })

  after(() => {
    // there might be server-side code coverage information
    // we should grab it once after all tests finish
    const baseUrl = Cypress.config('baseUrl') || cy.state('window').origin
    const runningEndToEndTests = baseUrl !== Cypress.config('proxyUrl')
    if (runningEndToEndTests) {
      // we can only request server-side code coverage
      // if we are running end-to-end tests,
      // otherwise where do we send the request?
      const url = Cypress._.get(
        Cypress.env('codeCoverage'),
        'url',
        '/__coverage__'
      )
      cy.request({
        url,
        log: false,
        failOnStatusCode: false
      })
        .then(r => Cypress._.get(r, 'body.coverage', null), { log: false })
        .then(coverage => {
          if (!coverage) {
            // we did not get code coverage - this is the
            // original failed request
            return
          }
          sendCoverage(coverage)
        })
    }

    // collect and merge frontend coverage
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
      sendCoverage(coverage)
    }

    // when all tests finish, lets generate the coverage report
    cy.task('coverageReport')
  })
}
