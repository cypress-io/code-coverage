// @ts-check
/**
 * Based on
 * @see https://github.com/leftyio/v8-cypress-coverage-plugin/blob/master/src/plugin.js
 */
const path = require('path')
const ChromeRemoteInterface = require('chrome-remote-interface')
const {
  convertProfileCoverageToIstanbul
} = require('../common/v8ToIstanbul')
const { debug } = require('../common/common-utils');


/**
 * @type {ChromeRemoteInterface.Client | null}
 */
let client = null

export function browserLaunchHandler(browser, launchOptions) {
  if (browser.name !== 'chrome') {
    return debug(
      ` Warning: An unsupported browser is used, output will not be logged to console: ${browser.name}`
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

export async function startPreciseCoverage() {
  if (!client) {
    return
  }

  await client.Profiler.enable()
  await client.Runtime.enable()
  await client.Profiler.startPreciseCoverage({
    callCount: true,
    detailed: true
  })
}

export function takePreciseCoverage() {
  if (!client) {
    return null
  }

  return client.Profiler.takePreciseCoverage().then((cov) =>
    convertProfileCoverageToIstanbul(cov, {
      filename: path.join('reports', 'v8_out.json')
    })
  )
}

export function stopPreciseCoverage() {
  if (!client) {
    return
  }
  return client.Profiler.stopPreciseCoverage()
}
