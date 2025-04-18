/// <reference types="cypress" />
// @ts-check

const dayjs = require('dayjs')
var duration = require('dayjs/plugin/duration')
const {
  filterFilesFromCoverage,
  getSendCoverageBatchSize
} = require('./support-utils')

dayjs.extend(duration)

/**
 * Sends collected code coverage object to the backend code
 * via "cy.task".
 */
const sendCoverage = (coverage, pathname = '/') => {
  logMessage(`Saving code coverage for **${pathname}**`)

  const totalCoverage = filterFilesFromCoverage(coverage)

  const envBatchSize = getSendCoverageBatchSize()
  const keys = Object.keys(totalCoverage)

  if (envBatchSize && envBatchSize < keys.length) {
    sendBatchCoverage(totalCoverage, envBatchSize)
  } else {
    cy.task('combineCoverage', JSON.stringify(totalCoverage), {
      log: false
    })
  }
}

/**
 * Sends collected code coverage object to the backend code
 * in batches via "cy.task".
 */
const sendBatchCoverage = (totalCoverage, batchSize) => {
  const keys = Object.keys(totalCoverage)

  for (let i = 0; i < keys.length; i += batchSize) {
    const batchKeys = keys.slice(i, i + batchSize)
    const batchCoverage = {}

    batchKeys.forEach((key) => {
      batchCoverage[key] = totalCoverage[key]
    })

    cy.task('combineCoverage', JSON.stringify(batchCoverage), {
      log: false
    })
  }
}

/**
 * Consistently logs the given string to the Command Log
 * so the user knows the log message is coming from this plugin.
 * @param {string} s Message to log.
 */
const logMessage = (s) => {
  cy.log(`${s} \`[@cypress/code-coverage]\``)
}

const registerHooks = () => {
  let windowCoverageObjects

  const hasE2ECoverage = () => Boolean(windowCoverageObjects.length)

  // @ts-ignore
  const hasUnitTestCoverage = () => Boolean(window.__coverage__)

  before(() => {
    // we need to reset the coverage when running
    // in the interactive mode, otherwise the counters will
    // keep increasing every time we rerun the tests
    const logInstance = Cypress.log({
      name: 'Coverage',
      message: ['Reset [@cypress/code-coverage]']
    })

    cy.task(
      'resetCoverage',
      {
        // @ts-ignore
        isInteractive: Cypress.config('isInteractive')
      },
      { log: false }
    ).then(() => {
      logInstance.end()
    })
  })

  beforeEach(() => {
    // each object will have the coverage and url pathname
    // to let the user know the coverage has been collected
    windowCoverageObjects = []

    const saveCoverageObject = (win) => {
      // if the application code has been instrumented, then the app iframe "win.__coverage__" will be available,
      // in addition, accessing win.__coverage__ can throw when testing cross-origin code,
      // because we don't control the cross-origin code, we can safely return
      let applicationSourceCoverage
      try {
        // Note that we are purposefully not supporting the optional chaining syntax here to
        // support a wide range of projects (some of which are not set up to support the optional
        // chaining syntax due to current Cypress limitations). See:
        // https://github.com/cypress-io/cypress/issues/20753
        if (win) {
          applicationSourceCoverage = win.__coverage__
        }
      } catch {}

      if (!applicationSourceCoverage) {
        return
      }

      const existingCoverage = Cypress._.find(windowCoverageObjects, {
        coverage: applicationSourceCoverage
      })
      if (existingCoverage) {
        // this application code coverage object is already known
        // which can happen when combining `window:load` and `before` callbacks,
        // it can also happen when the user navigates away and then returns to the page
        // in which case we need to use new applicationSourceCoverage, because the old will not be updated anymore.
        existingCoverage.coverage = applicationSourceCoverage
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
    cy.window({ log: false }).then(saveCoverageObject)
  })

  afterEach(() => {
    // save coverage after the test
    // because now the window coverage objects have been updated
    windowCoverageObjects.forEach((cover) => {
      sendCoverage(cover.coverage, cover.pathname)
    })

    if (!hasE2ECoverage()) {
      if (hasUnitTestCoverage()) {
        logMessage(`👉 Only found unit test code coverage.`)
      } else {
        const expectBackendCoverageOnly = Cypress._.get(
          Cypress.env('codeCoverage'),
          'expectBackendCoverageOnly',
          false
        )
        if (!expectBackendCoverageOnly) {
          logMessage(`
            ⚠️ Could not find any coverage information in your application
            by looking at the window coverage object.
            Did you forget to instrument your application?
            See [code-coverage#instrument-your-application](https://github.com/cypress-io/code-coverage#instrument-your-application)
          `)
        }
      }
    }
  })

  after(function collectBackendCoverage() {
    // I wish I could fail the tests if there is no code coverage information
    // but throwing an error here does not fail the test run due to
    // https://github.com/cypress-io/cypress/issues/2296

    // there might be server-side code coverage information
    // we should grab it once after all tests finish
    // @ts-ignore
    const baseUrl = Cypress.config('baseUrl') || cy.state('window').origin
    // @ts-ignore
    const runningEndToEndTests = baseUrl !== Cypress.config('proxyUrl')
    const expectFrontendCoverageOnly = Cypress._.get(
      Cypress.env('codeCoverage'),
      'expectFrontendCoverageOnly',
      false
    )
    const specType = Cypress._.get(Cypress.spec, 'specType', 'integration')
    const isIntegrationSpec = specType === 'integration'

    if (
      !expectFrontendCoverageOnly &&
      runningEndToEndTests &&
      isIntegrationSpec
    ) {
      // we can only request server-side code coverage
      // if we are running end-to-end tests,
      // otherwise where do we send the request?
      const captureUrls = Cypress._.get(
        Cypress.env('codeCoverage'),
        'url',
        '/__coverage__'
      )
      function captureCoverage(url, suffix = '') {
        cy.request({
          url,
          log: false,
          failOnStatusCode: false
        })
          .then((r) => {
            return Cypress._.get(r, 'body.coverage', null)
          })
          .then((coverage) => {
            if (!coverage) {
              // we did not get code coverage - this is the
              // original failed request
              const expectBackendCoverageOnly = Cypress._.get(
                Cypress.env('codeCoverage'),
                'expectBackendCoverageOnly',
                false
              )
              if (expectBackendCoverageOnly) {
                throw new Error(
                  `Expected to collect backend code coverage from ${url}`
                )
              } else {
                // we did not really expect to collect the backend code coverage
                return
              }
            }
            sendCoverage(coverage, `backend${suffix}`)
          })
      }

      if (Array.isArray(captureUrls)) {
        for (const [index, url] of captureUrls.entries()) {
          captureCoverage(url, `_${index}`)
        }
      } else {
        captureCoverage(captureUrls)
      }
    }
  })

  after(function mergeUnitTestCoverage() {
    // collect and merge frontend coverage

    // if spec bundle has been instrumented (using Cypress preprocessor)
    // then we will have unit test coverage
    // NOTE: spec iframe is NOT reset between the tests, so we can grab
    // the coverage information only once after all tests have finished
    // @ts-ignore
    const unitTestCoverage = window.__coverage__
    if (unitTestCoverage) {
      sendCoverage(unitTestCoverage, 'unit')
    }
  })

  after(function generateReport() {
    // when all tests finish, lets generate the coverage report
    const logInstance = Cypress.log({
      name: 'Coverage',
      message: ['Generating report [@cypress/code-coverage]']
    })
    cy.task('coverageReport', null, {
      timeout: dayjs.duration(3, 'minutes').asMilliseconds(),
      log: false
    }).then((coverageReportFolder) => {
      logInstance.set('consoleProps', () => ({
        'coverage report folder': coverageReportFolder
      }))
      logInstance.end()
      return coverageReportFolder
    })
  })
}

// to disable code coverage commands and save time
// pass environment variable coverage=false
//  cypress run --env coverage=false
// or
//  CYPRESS_COVERAGE=false cypress run
// see https://on.cypress.io/environment-variables

// to avoid "coverage" env variable being case-sensitive, convert to lowercase
const cyEnvs = Cypress._.mapKeys(Cypress.env(), (value, key) =>
  key.toLowerCase()
)

if (cyEnvs.coverage === false) {
  console.log('Skipping code coverage hooks')
} else if (Cypress.env('codeCoverageTasksRegistered') !== true) {
  // register a hook just to log a message
  before(() => {
    logMessage(`
      ⚠️ Code coverage tasks were not registered by the plugins file.
      See [support issue](https://github.com/cypress-io/code-coverage/issues/179)
      for possible workarounds.
    `)
  })
} else {
  registerHooks()
}
