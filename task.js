// @ts-check
const istanbul = require('istanbul-lib-coverage')
const { join, resolve } = require('path')
const { existsSync, mkdirSync, readFileSync, writeFileSync } = require('fs')
const execa = require('execa')
const fs = require('fs')
const { fixSourcePathes } = require('./utils')
const NYC = require('nyc')

const debug = require('debug')('code-coverage')

// these are standard folder and file names used by NYC tools
const processWorkingDirectory = process.cwd()
const outputFolder = '.nyc_output'
const coverageFolder = join(processWorkingDirectory, outputFolder)
const nycFilename = join(coverageFolder, 'out.json')

// there might be custom "nyc" options in the user package.json
// see https://github.com/istanbuljs/nyc#configuring-nyc
// potentially there might be "nyc" options in other configuration files
// it allows, but for now ignore those options
const pkgFilename = join(processWorkingDirectory, 'package.json')
const pkg = fs.existsSync(pkgFilename)
  ? JSON.parse(fs.readFileSync(pkgFilename, 'utf8'))
  : {}
const nycOptions = pkg.nyc || {}
const scripts = pkg.scripts || {}
const DEFAULT_CUSTOM_COVERAGE_SCRIPT_NAME = 'coverage:report'
const customNycReportScript = scripts[DEFAULT_CUSTOM_COVERAGE_SCRIPT_NAME]

function saveCoverage(coverage) {
  if (!existsSync(coverageFolder)) {
    mkdirSync(coverageFolder)
    debug('created folder %s for output coverage', coverageFolder)
  }

  writeFileSync(nycFilename, JSON.stringify(coverage, null, 2))
}

module.exports = {
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
      const coverageMap = istanbul.createCoverageMap({})
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

    fixSourcePathes(coverage)
    const previous = existsSync(nycFilename)
      ? JSON.parse(readFileSync(nycFilename, 'utf8'))
      : istanbul.createCoverageMap({})
    const coverageMap = istanbul.createCoverageMap(previous)
    coverageMap.merge(coverage)
    saveCoverage(coverageMap)
    debug('wrote coverage file %s', nycFilename)

    return null
  },

  /**
   * Saves coverage information as a JSON file and calls
   * NPM script to generate HTML report
   */
  coverageReport() {
    if (!existsSync(nycFilename)) {
      console.warn('Cannot find coverage file %s', nycFilename)
      console.warn('Skipping coverage report')
      return null
    }

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

    const reportFolder = nycOptions['report-dir'] || './coverage'
    const reportDir = resolve(reportFolder)
    const reporter = nycOptions['reporter'] || ['lcov', 'clover', 'json']

    // TODO we could look at how NYC is parsing its CLI arguments
    // I am mostly worried about additional NYC options that are stored in
    // package.json and .nycrc resource files.
    // for now let's just camel case all options
    const nycReportOptions = {
      reportDir,
      tempDir: coverageFolder,
      reporter: [].concat(reporter) // make sure this is a list
    }
    debug('calling NYC reporter with options %o', nycReportOptions)
    debug('current working directory is %s', process.cwd())
    const nyc = new NYC(nycReportOptions)

    const returnReportFolder = () => {
      debug('after reporting, returning the report folder name %s', reportDir)
      return reportDir
    }
    return nyc.report().then(returnReportFolder)
  }
}
