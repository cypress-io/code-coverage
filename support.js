/// <reference types="cypress" />
// @ts-check

const dayjs = require('dayjs')
var duration = require('dayjs/plugin/duration')
const { filterFilesFromCoverage } = require('./lib/support/support-utils')

dayjs.extend(duration)

/**
 * Consistently logs the given string to the Command Log
 * so the user knows the log message is coming from this plugin.
 * @param {string} s Message to log.
 */

const logMessage = (s) => {
  return Cypress.log({
    name: 'Coverage',
    message: `${s} \`[cypress-code-coverage-v8]\``
  })
}

/**
 * Sends collected code coverage object to the backend code
 * via "cy.task".
 */
const sendCoverage = (coverage, comment = '/') => {
  logMessage(`Saving code coverage for **${comment}**`)

  const totalCoverage = filterFilesFromCoverage(coverage)

  // stringify coverage object for speed
  return cy
    .task('combineCoverage', JSON.stringify(totalCoverage), {
      log: false
    })
    // .then((result) => {
    //   return JSON.parse(String(result))
    // })
}

const registerHooks = () => {
  /**
   * @type {{url: string}[]}
   */
  let hostObjects = []

  before(() => {
    // each object will have the url pathname
    // to let the user know the coverage will be collected
    hostObjects = []
    // we need to reset the coverage when running
    // in the interactive mode, otherwise the counters will
    // keep increasing every time we rerun the tests
    const logInstance = logMessage('Initialize')
    cy.task(
      'resetCoverage',
      {
        // @ts-ignore
        isInteractive: Cypress.config('isInteractive')
      },
      { log: false }
    )
    cy.task('startPreciseCoverage', null, { log: false }).then(() => {
      logInstance.end()
    })
  })

  beforeEach(() => {
    const ssr = Cypress._.get(Cypress.env('codeCoverage'), 'ssr')

    if (!ssr) {
      return
    }
    logMessage('Saving hosts for SSR coverage')

    /**
     * @param {Cypress.AUTWindow} win
     */
    const saveHost = (win) => {
      if (!win?.location?.host) {
        return
      }
      const url = `${win.location.protocol}//${win.location.host}${ssr}`
      const existingHost = Cypress._.find(hostObjects, {
        url
      })
      if (existingHost) {
        return
      }

      logMessage(`Saved "${url}" for SSR coverage`)
      hostObjects.push({
        url
      })
    }

    // save reference to coverage for each app window loaded in the test
    cy.on('window:load', saveHost)

    // save reference if visiting a page inside a before() hook
    cy.window({ log: false }).then(saveHost)
  })

  afterEach(function collectClientCoverage() {
    // collect and merge frontend coverage
    cy.task('takePreciseCoverage', null, {
      timeout: dayjs.duration(3, 'minutes').asMilliseconds(),
      log: false
    }).then((clientCoverage) => {
      cy.location({ log: false }).then((loc) => {
        if (clientCoverage) {
          sendCoverage(clientCoverage, `client - ${loc.href}`)
        }
      })
    })
  })

  after(() => {
    cy.task('stopPreciseCoverage', null, {
      timeout: dayjs.duration(3, 'minutes').asMilliseconds(),
      log: false
    })
  })

  after(async function collectBackendCoverage() {
    // I wish I could fail the tests if there is no code coverage information
    // but throwing an error here does not fail the test run due to
    // https://github.com/cypress-io/cypress/issues/2296

    // there might be server-side code coverage information
    // we should grab it once after all tests finish
    // @ts-ignore
    const baseUrl = Cypress.config('baseUrl') || cy.state('window').origin
    // @ts-ignore
    const runningEndToEndTests = baseUrl !== Cypress.config('proxyUrl')
    const specType = Cypress._.get(Cypress.spec, 'specType', 'integration')
    const isIntegrationSpec = specType === 'integration'

    if (runningEndToEndTests && isIntegrationSpec) {
      // we can only request server-side code coverage
      // if we are running end-to-end tests,
      // otherwise where do we send the request?
      // TODO: Support array of urls
      const backend = Cypress._.get(
        Cypress.env('codeCoverage'),
        'url',
        '/__coverage__'
      )

      /**
       * @type {string[]}
       */
      const finalUrls = [
        backend,
        ...hostObjects.map(({ url }) => {
          return url
        })
      ].filter(Boolean)

      await Cypress.Promise.mapSeries(finalUrls, (url) => {
        return new Cypress.Promise((resolve, reject) => {
          cy.request({
            url: String(url),
            log: true,
            failOnStatusCode: false
          })
            .then((r) => {
              return Cypress._.get(r, 'body.coverage', null)
            })
            .then((coverage) => {
              if (coverage) {
                sendCoverage(coverage, `server - ${url}`).then(() => {
                  resolve()
                })
                return
              }

              // we did not get code coverage
              const expectBackendCoverageOnly = Cypress._.get(
                Cypress.env('codeCoverage'),
                'expectBackendCoverageOnly',
                false
              )
              if (expectBackendCoverageOnly) {
                reject(
                  new Error(
                    `Expected to collect backend code coverage from ${url}`
                  )
                )
                return
              } else {
                resolve()
                // we did not really expect to collect the backend code coverage
                return
              }
            })
        })
      })
    }
  })

  after(function generateReport() {
    // when all tests finish, lets generate the coverage report
    const logInstance = logMessage('Generating report')
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
