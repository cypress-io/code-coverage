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

// Tags each message so users can tell it comes from this plugin
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

  const saveCoverageObject = (win: Window): void => {
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
      // Reading __coverage__ from a cross-origin window throws, and we don't
      // collect coverage for code we don't control
    }

    if (!applicationSourceCoverage) {
      return
    }

    const existingCoverage = Cypress._.find(windowCoverageObjects, {
      coverage: applicationSourceCoverage
    })
    if (existingCoverage) {
      // Both `window:load` and `cy.window()` can report the same window, and
      // navigating away and back creates a new object for the same page. The
      // old object stops updating, so keep the latest one.
      existingCoverage.coverage = applicationSourceCoverage
      return
    }

    windowCoverageObjects.push({
      coverage: applicationSourceCoverage,
      pathname: win.location.pathname
    })
  }

  beforeEach(() => {
    windowCoverageObjects = []

    cy.on('window:load', saveCoverageObject)

    // Some apps only create `__coverage__` after `window:load`, for example
    // when a framework runs component code during hydration, so read each
    // page again before it goes away
    cy.on('window:before:unload', (event: BeforeUnloadEvent) => {
      saveCoverageObject(event.currentTarget as Window)
    })

    // Catches a page visited in a before() hook, which loaded before the
    // `window:load` listener existed
    cy.window({ log: false }).then(saveCoverageObject)
  })

  afterEach(() => {
    // The last page never unloads during the test
    cy.window({ log: false }).then(saveCoverageObject)

    // Send after the test so the counters include everything it ran
    cy.then(() => {
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
  })

  after(function collectBackendCoverage() {
    // Backend counters accumulate across tests, so fetch them once at the end
    const baseUrl =
      // @ts-ignore - state is a runtime property
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
      // Without an app server under test there is no backend to ask
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
    // The spec iframe isn't reset between tests, so an instrumented spec
    // bundle's coverage is complete only once all tests have finished
    // @ts-ignore - __coverage__ is added by instrumentation
    const unitTestCoverage = (
      window as typeof window & { __coverage__?: unknown }
    ).__coverage__
    if (unitTestCoverage) {
      sendCoverage(unitTestCoverage, 'unit')
    }
  })

  after(function generateReport() {
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

// `cypress run --expose coverage=false` skips the hooks to save time.
// Keys are lowercased so `coverage` matches regardless of case.
const exposedValues = Object.fromEntries(
  Object.entries(Cypress.expose()).map(([key, value]) => [
    key.toLowerCase(),
    value
  ])
)

if (exposedValues.coverage === false) {
  console.log('Skipping code coverage hooks')
} else if (Cypress.expose('codeCoverageTasksRegistered') !== true) {
  // cy.log only works inside a hook or test
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
