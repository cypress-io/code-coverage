const istanbul = require('istanbul-lib-coverage')
const { join } = require('path')
const { existsSync, mkdirSync, readFileSync, writeFileSync } = require('fs')
const execa = require('execa')

// these are standard folder and file names used by NYC tools
const outputFolder = '.nyc_output'
const coverageFolder = join(process.cwd(), outputFolder)
const nycFilename = join(coverageFolder, 'out.json')

function saveCoverage (coverage) {
  if (!existsSync(coverageFolder)) {
    mkdirSync(coverageFolder)
    console.log('created folder %s for output coverage', coverageFolder)
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
  resetCoverage ({ isInteractive }) {
    if (isInteractive) {
      console.log('reset code coverage in interactive mode')
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
   */
  combineCoverage (coverage) {
    const previous = existsSync(nycFilename)
      ? JSON.parse(readFileSync(nycFilename))
      : istanbul.createCoverageMap({})
    const coverageMap = istanbul.createCoverageMap(previous)
    coverageMap.merge(coverage)
    saveCoverage(coverageMap)
    console.log('wrote coverage file %s', nycFilename)

    return null
  },

  /**
   * Saves coverage information as a JSON file and calls
   * NPM script to generate HTML report
   */
  coverageReport () {
    if (!existsSync(nycFilename)) {
      console.warn('Cannot find coverage file %s', nycFilename)
      console.warn('Skipping coverage report')
      return null
    }
    console.log('saving coverage report')
    // should we generate report via NYC module API?
    return execa('nyc', ['report', '--reporter=html'], { stdio: 'inherit' })
  }
}
