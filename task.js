// @ts-check
const istanbul = require('istanbul-lib-coverage')
const { join, resolve } = require('path')
const { existsSync, mkdirSync, readFileSync, writeFileSync } = require('fs')
const execa = require('execa')
const {
  showNycInfo,
  resolveRelativePaths,
  checkAllPathsNotFound,
  tryFindingLocalFiles,
  readNycOptions,
  includeAllFiles
} = require('./task-utils')
const { fixSourcePaths } = require('./support-utils')

const debug = require('debug')('code-coverage')

// these are standard folder and file names used by NYC tools
const processWorkingDirectory = process.cwd()

// there might be custom "nyc" options in the user package.json
// see https://github.com/istanbuljs/nyc#configuring-nyc
// potentially there might be "nyc" options in other configuration files
// it allows, but for now ignore those options
const pkgFilename = join(processWorkingDirectory, 'package.json')
const pkg = existsSync(pkgFilename)
  ? JSON.parse(readFileSync(pkgFilename, 'utf8'))
  : {}
const scripts = pkg.scripts || {}
const DEFAULT_CUSTOM_COVERAGE_SCRIPT_NAME = 'coverage:report'
const customNycReportScript = scripts[DEFAULT_CUSTOM_COVERAGE_SCRIPT_NAME]

const nycReportOptions = (function getNycOption() {
  // https://github.com/istanbuljs/nyc#common-configuration-options
  const nycReportOptions = readNycOptions(processWorkingDirectory)

  if (nycReportOptions.exclude && !Array.isArray(nycReportOptions.exclude)) {
    console.error('NYC options: %o', nycReportOptions)
    throw new Error('Expected "exclude" to be an array')
  }

  if (nycReportOptions['temp-dir']) {
    nycReportOptions['temp-dir'] = resolve(nycReportOptions['temp-dir'])
  } else {
    nycReportOptions['temp-dir'] = join(processWorkingDirectory, '.nyc_output')
  }

  nycReportOptions.tempDir = nycReportOptions['temp-dir']

  if (nycReportOptions['report-dir']) {
    nycReportOptions['report-dir'] = resolve(nycReportOptions['report-dir'])
  }
  // seems nyc API really is using camel cased version
  nycReportOptions.reportDir = nycReportOptions['report-dir']

  return nycReportOptions
})()

const nycFilename = join(nycReportOptions['temp-dir'], 'out.json')

let coverageMap = (() => {
  const previousCoverage = existsSync(nycFilename)
    ? JSON.parse(readFileSync(nycFilename, 'utf8'))
    : {}
  return istanbul.createCoverageMap(previousCoverage)
})()

function saveCoverage(coverage) {
  if (!existsSync(nycReportOptions.tempDir)) {
    mkdirSync(nycReportOptions.tempDir, { recursive: true })
    debug('created folder %s for output coverage', nycReportOptions.tempDir)
  }

  writeFileSync(nycFilename, JSON.stringify(coverage, null, 2))
}

function maybePrintFinalCoverageFiles(folder) {
  const jsonReportFilename = join(folder, 'coverage-final.json')
  if (!existsSync(jsonReportFilename)) {
    debug('Did not find final coverage file %s', jsonReportFilename)
    return
  }

  debug('Final coverage in %s', jsonReportFilename)
  const finalCoverage = JSON.parse(readFileSync(jsonReportFilename, 'utf8'))
  const finalCoverageKeys = Object.keys(finalCoverage)
  debug(
    'There are %d key(s) in %s',
    finalCoverageKeys.length,
    jsonReportFilename
  )

  finalCoverageKeys.forEach((key) => {
    const s = finalCoverage[key].s || {}
    const statements = Object.keys(s)
    const totalStatements = statements.length
    let coveredStatements = 0
    statements.forEach((statementKey) => {
      if (s[statementKey]) {
        coveredStatements += 1
      }
    })

    const hasStatements = totalStatements > 0
    const allCovered = coveredStatements === totalStatements
    const coverageStatus = hasStatements ? (allCovered ? '✅' : '⚠️') : '❓'

    debug(
      '%s %s statements covered %d/%d',
      coverageStatus,
      key,
      coveredStatements,
      totalStatements
    )
  })
}

const tasks = {
  /**
   * Clears accumulated code coverage information.
   *
   * Interactive mode with "cypress open"
   *    - running a single spec or "Run all specs" needs to reset coverage
   * Headless mode with "cypress run"
   *    - runs EACH spec separately, so we cannot reset the coverage
   *      or we will lose the coverage from previous specs.
   */
  resetCoverage({ isInteractive }) {
    if (isInteractive) {
      debug('reset code coverage in interactive mode')
      coverageMap = istanbul.createCoverageMap({})
      saveCoverage(coverageMap)
    }
    /*
        Else:
          in headless mode, assume the coverage file was deleted
          before the `cypress run` command was called
          example: rm -rf .nyc_output || true
      */

    return null
  },

  /**
   * Combines coverage information from single test
   * with previously collected coverage.
   *
   * @param {string} sentCoverage Stringified coverage object sent by the test runner
   * @returns {null} Nothing is returned from this task
   */
  combineCoverage(sentCoverage) {
    const coverage = JSON.parse(sentCoverage)
    debug('parsed sent coverage')

    fixSourcePaths(coverage)

    coverageMap.merge(coverage)

    return null
  },

  /**
   * Saves coverage information as a JSON file and calls
   * NPM script to generate HTML report
   */
  coverageReport() {
    saveCoverage(coverageMap)
    if (!existsSync(nycFilename)) {
      console.warn('Cannot find coverage file %s', nycFilename)
      console.warn('Skipping coverage report')
      return null
    }

    showNycInfo(nycFilename)

    const allSourceFilesMissing = checkAllPathsNotFound(nycFilename)
    if (allSourceFilesMissing) {
      tryFindingLocalFiles(nycFilename)
    }

    resolveRelativePaths(nycFilename)

    if (customNycReportScript) {
      debug(
        'saving coverage report using script "%s" from package.json, command: %s',
        DEFAULT_CUSTOM_COVERAGE_SCRIPT_NAME,
        customNycReportScript
      )
      debug('current working directory is %s', process.cwd())
      return execa('npm', ['run', DEFAULT_CUSTOM_COVERAGE_SCRIPT_NAME], {
        stdio: 'inherit'
      })
    }

    if (nycReportOptions.all) {
      debug('nyc needs to report on all included files')
      includeAllFiles(nycFilename, nycReportOptions)
    }

    debug('calling NYC reporter with options %o', nycReportOptions)
    debug('current working directory is %s', process.cwd())
    const NYC = require('nyc')
    const nyc = new NYC(nycReportOptions)

    const returnReportFolder = () => {
      const reportFolder = nycReportOptions['report-dir']
      debug(
        'after reporting, returning the report folder name %s',
        reportFolder
      )

      maybePrintFinalCoverageFiles(reportFolder)

      return reportFolder
    }
    return nyc.report().then(returnReportFolder)
  }
}

/**
 * Registers code coverage collection and reporting tasks.
 * Sets an environment variable to tell the browser code that it can
 * send the coverage.
 * @example
  ```
    // your plugins file
    module.exports = (on, config) => {
      require('cypress/code-coverage/task')(on, config)
      // IMPORTANT to return the config object
      // with the any changed environment variables
      return config
    }
  ```
*/
function registerCodeCoverageTasks(on, config) {
  on('task', tasks)

  // set a variable to let the hooks running in the browser
  // know that they can send coverage commands
  config.env.codeCoverageTasksRegistered = true

  return config
}

module.exports = registerCodeCoverageTasks
