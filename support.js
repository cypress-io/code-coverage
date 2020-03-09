/// <reference types="cypress" />

/**
 * Sends collected code coverage object to the backend code
 * via "cy.task".
 */
const sendCoverage = (coverage, pathname = '/') => {
  logMessage(`Saving code coverage for **${pathname}**`)
  // stringify coverage object for speed
  cy.task('combineCoverage', JSON.stringify(coverage), {
    log: false
  })
}

/**
 * Consistently logs the given string to the Command Log
 * so the user knows the log message is coming from this plugin.
 * @param {string} s Message to log.
 */
const logMessage = s => {
  cy.log(`${s} \`[@cypress/code-coverage]\``)
}

// to disable code coverage commands and save time
// pass environment variable coverage=false
//  cypress run --env coverage=false
// see https://on.cypress.io/environment-variables
if (Cypress.env('coverage') === false) {
  console.log('Skipping code coverage hooks')
} else {
  let windowCoverageObjects

  const hasE2ECoverage = () => Boolean(windowCoverageObjects.length)

  const hasUnitTestCoverage = () => Boolean(window.__coverage__)

  before(() => {
    // we need to reset the coverage when running
    // in the interactive mode, otherwise the counters will
    // keep increasing every time we rerun the tests
    cy.task('resetCoverage', { isInteractive: Cypress.config('isInteractive') })
  })

  beforeEach(() => {
    // each object will have the coverage and url pathname
    // to let the user know the coverage has been collected
    windowCoverageObjects = []

    const saveCoverageObject = win => {
      // if application code has been instrumented, the app iframe "window" has an object
      const applicationSourceCoverage = win.__coverage__
      if (!applicationSourceCoverage) {
        return
      }

      if (
        Cypress._.find(windowCoverageObjects, {
          coverage: applicationSourceCoverage
        })
      ) {
        // this application code coverage object is already known
        // which can happen when combining `window:load` and `before` callbacks
        return
      }

      windowCoverageObjects.push({
        coverage: applicationSourceCoverage,
        pathname: win.location.pathname
      })
    }

    // save reference to coverage for each app window loaded in the test
    cy.on('window:load', saveCoverageObject)

    // save reference if visiting a page inside a before() hook
    cy.window().then(saveCoverageObject)
  })

  afterEach(() => {
    // save coverage after the test
    // because now the window coverage objects have been updated
    windowCoverageObjects.forEach(cover => {
      sendCoverage(cover.coverage, cover.pathname)
    })

    if (!hasE2ECoverage()) {
      if (hasUnitTestCoverage()) {
        logMessage(`👉 Only found unit test code coverage.`)
      } else {
        logMessage(`
          ⚠️ Could not find any coverage information in your application
          by looking at the window coverage object.
          Did you forget to instrument your application?
          See [code-coverage#instrument-your-application](https://github.com/cypress-io/code-coverage#instrument-your-application)
        `)
      }
    }
  })

  after(function collectBackendCoverage() {
    // I wish I could fail the tests if there is no code coverage information
    // but throwing an error here does not fail the test run due to
    // https://github.com/cypress-io/cypress/issues/2296

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
          sendCoverage(coverage, 'backend')
        })
    }
  })

  after(function mergeUnitTestCoverage() {
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

      // does this handle unset support file?
      const isTestFile = (fileCoverage, filename) =>
        filename.startsWith(specFolder) || filename.startsWith(supportFolder)
      const coverage = Cypress._.omitBy(window.__coverage__, isTestFile)
      sendCoverage(coverage, 'unit')
    }
  })

  after(function generateReport() {
    // when all tests finish, lets generate the coverage report
    cy.task('coverageReport', {
      timeout: Cypress.moment.duration(3, 'minutes').asMilliseconds()
    })
  })
}
