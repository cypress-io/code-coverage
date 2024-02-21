// @ts-check
/**
 * Based on
 * @see https://github.com/leftyio/v8-cypress-coverage-plugin/blob/master/src/plugin.js
 */
const path = require('path')
const fs = require('fs')
const CDP = require('chrome-remote-interface')
const { execSync } = require('child_process')
const {
  convertProfileCoverageToIstanbul
} = require('./lib/common/v8ToIstanbul')
const istanbulCoverageFolder = './.nyc_output'

/**
 * @type {CDP.Client | null}
 */
let cdp = null

const config = {
  src_root: './',
  include_globs: ['*']
}

function v8BeforeTest() {
  if (cdp) {
    const callCount = true
    const detailed = true
    return Promise.all([
      cdp.Profiler.enable(),
      cdp.Profiler.startPreciseCoverage({
        callCount,
        detailed
      })
    ])
  }

  return null
}

function v8AfterTest() {
  if (cdp) {
    return cdp.Profiler.takePreciseCoverage()
      .then((cov) =>
        convertProfileCoverageToIstanbul(cov, {
          filename: path.join('reports', 'v8_out.json')
        })
      )
      .then(() => {
        return cdp?.Profiler.stopPreciseCoverage()
      })
  }
  return null
}

function log(msg) {
  // todo: put in place a correct way to log things
  //console.log(msg);
}

function browserLaunchHandler(browser, launchOptions) {
  if (browser.name !== 'chrome') {
    return log(
      ` Warning: An unsupported browser is used, output will not be logged to console: ${browser.name}`
    )
  }

  // find how Cypress is going to control Chrome browser
  const rdpArgument = launchOptions.args.find((arg) =>
    arg.startsWith('--remote-debugging-port')
  )
  if (!rdpArgument) {
    return log(
      `Could not find launch argument that starts with --remote-debugging-port`
    )
  }
  const rdp = parseInt(rdpArgument.split('=')[1])
  const tryConnect = () => {
    return CDP({
      port: rdp
    })
      .then((_cdp) => {
        cdp = _cdp
        cdp.on('disconnect', () => {
          cdp = null
        })
      })
      .catch(() => {
        cdp = null
        setTimeout(tryConnect, 100)
      })
  }

  tryConnect()
}

function v8ConvertCoverage([format, location]) {
  format = format ?? 'html'
  location = location ?? './coverage'
  console.log(
    'executing ',
    'npx nyc report ' + `--reporter=${format} --report-dir=${location}`
  )
  execSync('npx nyc report ' + `--reporter=${format} --report-dir=${location}`)
  return null
}

function v8CleanFiles() {
  const v8outfiles = path.join(istanbulCoverageFolder, 'v8_out.json')
  if (fs.existsSync(v8outfiles)) {
    fs.unlinkSync(v8outfiles)
  }
  return null
}

function register(on, cypress_config) {
  load_config(cypress_config)
  if (!cypress_config.env.v8_coverage.collect_coverage_timeout) {
    cypress_config.env.v8_coverage.collect_coverage_timeout = 60000
  }
  on('before:browser:launch', browserLaunchHandler)
  on('task', {
    v8BeforeTest,
    v8AfterTest,
    v8ConvertCoverage,
    v8CleanFiles
  })
  cypress_config.env.V8CodeCoverageRegistered = true
  cypress_config.env.V8CodeCoverageCollect =
    !cypress_config.env.v8_coverage.skip_coverage_collection
  return cypress_config
}

function load_config(cypress_config) {
  config.src_root = cypress_config.env.v8_coverage.src_root
  config.include_globs = cypress_config.env.v8_coverage.include
}

module.exports = register
module.exports.load_config = load_config
