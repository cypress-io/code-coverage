/**
 * Based on
 * @see https://github.com/leftyio/v8-cypress-coverage-plugin/blob/master/src/plugin.js
 */
const ChromeRemoteInterface = require('chrome-remote-interface')
const { convertProfileCoverageToIstanbul } = require('../common/v8ToIstanbul')
const { debug } = require('../common/common-utils')

/**
 * @typedef {Awaited<ReturnType<typeof takePreciseCoverage>>} ClientCoverageResult
 */

/**
 * @type {ChromeRemoteInterface.Client | null}
 */
let client = null

/**
 *
 * @param {Cypress.Browser} browser
 * @param {Cypress.BeforeBrowserLaunchOptions} launchOptions
 * @returns
 */
function browserLaunchHandler(browser, launchOptions) {
  if (browser.name !== 'chrome') {
    return debug(
      `Warning: An unsupported browser is used, output will not be logged to console: ${browser.name}`
    )
  }
  // find how Cypress is going to control Chrome browser
  const rdpArgument = launchOptions.args.find((arg) =>
    arg.startsWith('--remote-debugging-port')
  )
  if (!rdpArgument) {
    return debug(
      `Could not find launch argument that starts with --remote-debugging-port`
    )
  }
  const rdpPort = Number.parseInt(rdpArgument.split('=')[1])
  const tryConnect = () => {
    return ChromeRemoteInterface({
      port: rdpPort
    })
      .then((newClient) => {
        client = newClient
        client.on('disconnect', () => {
          client = null
        })
      })
      .catch(() => {
        client = null
        setTimeout(tryConnect, 100)
      })
  }

  tryConnect()
}

async function startPreciseCoverage() {
  if (!client) {
    debug('no chrome client')
    return null
  }

  await client.Profiler.enable()
  await client.Runtime.enable()
  return client.Profiler.startPreciseCoverage({
    callCount: true,
    detailed: true
  })
}

function takePreciseCoverage({ hostToProjectMap = {} } = {}) {
  if (!client) {
    debug('no chrome client')
    return null
  }

  return client.Profiler.takePreciseCoverage()
    .then(async (cov) => {
      const res = await convertProfileCoverageToIstanbul(cov, hostToProjectMap)
      debug('chrome coverage', cov, res)
      return res
    })
    .catch((err) => {
      console.error(err, err.stack, 'could not take coverage')
      return null
    })
}

function stopPreciseCoverage() {
  if (!client) {
    debug('no chrome client')
    return null
  }
  return client.Profiler.stopPreciseCoverage()
}

module.exports = {
  browserLaunchHandler,
  startPreciseCoverage,
  takePreciseCoverage,
  stopPreciseCoverage
}
