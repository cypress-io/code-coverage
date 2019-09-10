/// <reference types="cypress" />

// to disable code coverage commands and save time
// pass environment variable coverage=false
//  cypress run --env coverage=false
// see https://on.cypress.io/environment-variables
if (Cypress.env('coverage') === false) {
  console.log('Skipping code coverage hooks')
} else {
  const sendCoverageObject = (coverage) => {
    if (!coverage) {
      return
    }
    cy.task('combineCoverage', coverage).then(response => {
      cy.log(`**${response.covered.s}**/**${response.total.s}** statements`)
      cy.log(`**${response.covered.f}**/**${response.total.f}** functions`)
      cy.log(`**${response.covered.b}**/**${response.total.b}** branches`)
    })
  }

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
    cy.window({log: false}).then(win => {
      // if application code has been instrumented, the app iframe "window" has an object
      sendCoverageObject(win.__coverage__)
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
        .then(sendCoverageObject)
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
      sendCoverageObject(coverage)
    }

    // when all tests finish, lets generate the coverage report
    cy.task('coverageReport')
  })
}
