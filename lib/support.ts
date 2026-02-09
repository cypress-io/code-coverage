/// <reference types="cypress" />
/// <reference lib="dom" />
import type { CoverageObject } from './support-utils'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import {
  filterFilesFromCoverage,
  getSendCoverageBatchSize
} from './support-utils'

dayjs.extend(duration)

interface WindowCoverageObject {
  coverage: unknown
  pathname: string
}

/**
 * Sends collected code coverage object to the backend code
 * via "cy.task".
 */
function sendCoverage(coverage: unknown, pathname = '/'): void {
  logMessage(`Saving code coverage for **${pathname}**`)

  const totalCoverage = filterFilesFromCoverage(coverage as CoverageObject)

  const batchSize = getSendCoverageBatchSize()
  const keys = Object.keys(totalCoverage)

  if (batchSize && batchSize < keys.length) {
    sendBatchCoverage(totalCoverage, batchSize)
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
function sendBatchCoverage(
  totalCoverage: Record<string, unknown>,
  batchSize: number
): void {
  const keys = Object.keys(totalCoverage)

  for (let i = 0; i < keys.length; i += batchSize) {
    const batchKeys = keys.slice(i, i + batchSize)
    const batchCoverage: Record<string, unknown> = {}

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
 * @param s Message to log.
 */
function logMessage(s: string): void {
  cy.log(`${s} \`[@cypress/code-coverage]\``)
}

function registerHooks(): void {
  let windowCoverageObjects: WindowCoverageObject[] = []

  const hasE2ECoverage = (): boolean => Boolean(windowCoverageObjects.length)

  // @ts-ignore - __coverage__ is a global added by instrumentation
  const hasUnitTestCoverage = (): boolean =>
    Boolean((window as typeof window & { __coverage__?: unknown }).__coverage__)

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
        // @ts-ignore - isInteractive is a runtime property
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

    const saveCoverageObject = (win: Window): void => {
      // if the application code has been instrumented, then the app iframe "win.__coverage__" will be available,
      // in addition, accessing win.__coverage__ can throw when testing cross-origin code,
      // because we don't control the cross-origin code, we can safely return
      let applicationSourceCoverage: unknown
      try {
        // Note that we are purposefully not supporting the optional chaining syntax here to
        // support a wide range of projects (some of which are not set up to support the optional
        // chaining syntax due to current Cypress limitations). See:
        // https://github.com/cypress-io/cypress/issues/20753
        if (win) {
          // @ts-ignore - __coverage__ is added by instrumentation
          applicationSourceCoverage = (
            win as typeof win & { __coverage__?: unknown }
          ).__coverage__
        }
      } catch {
        // ignore cross-origin errors
      }

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
          Cypress.expose('codeCoverage'),
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
    // @ts-ignore - state is a runtime property
    const baseUrl =
      Cypress.config('baseUrl') || (cy.state('window') as Window).origin
    // @ts-ignore - proxyUrl is a runtime property
    const runningEndToEndTests = baseUrl !== Cypress.config('proxyUrl')
    const expectFrontendCoverageOnly = Cypress._.get(
      Cypress.expose('codeCoverage'),
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
        Cypress.expose('codeCoverage'),
        'url',
        '/__coverage__'
      )
      function captureCoverage(url: string, suffix = ''): void {
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
                Cypress.expose('codeCoverage'),
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
    // @ts-ignore - __coverage__ is added by instrumentation
    const unitTestCoverage = (
      window as typeof window & { __coverage__?: unknown }
    ).__coverage__
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
// pass exposed variable coverage=false
//  cypress run --expose coverage=false
// see https://on.cypress.io/environment-variables

// to avoid "coverage" variable being case-sensitive, convert to lowercase
const exposedValues = Object.fromEntries(
  Object.entries(Cypress.expose()).map(([key, value]) => [
    key.toLowerCase(),
    value
  ])
)

if (exposedValues.coverage === false) {
  console.log('Skipping code coverage hooks')
} else if (Cypress.expose('codeCoverageTasksRegistered') !== true) {
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
