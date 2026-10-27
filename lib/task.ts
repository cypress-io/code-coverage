/// <reference types="node" />
import {
  createCoverageMap,
  CoverageMap as IstanbulCoverageMap
} from 'istanbul-lib-coverage'
import { join, resolve } from 'path'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import execa from 'execa'
import {
  showNycInfo,
  resolveRelativePaths,
  checkAllPathsNotFound,
  tryFindingLocalFiles,
  readNycOptions,
  includeAllFiles,
  checkCoverageThresholds
} from './task-utils'
import { fixSourcePaths } from './support-utils'
import debug from 'debug'

const log = debug('code-coverage')

const processWorkingDirectory = process.cwd()

// A "coverage:report" script in the user's package.json replaces the built-in
// nyc report and threshold check
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
    nycReportOptions['temp-dir'] = resolve(
      nycReportOptions['temp-dir'] as string
    )
  } else {
    nycReportOptions['temp-dir'] = join(processWorkingDirectory, '.nyc_output')
  }

  nycReportOptions.tempDir = nycReportOptions['temp-dir']

  if (nycReportOptions['report-dir']) {
    nycReportOptions['report-dir'] = resolve(
      nycReportOptions['report-dir'] as string
    )
  }
  // nyc's API reads the camelCase names
  nycReportOptions.reportDir = nycReportOptions['report-dir']

  return nycReportOptions
})()

const nycFilename = join(nycReportOptions['temp-dir'] as string, 'out.json')

let coverageMap: IstanbulCoverageMap = (() => {
  const previousCoverage = existsSync(nycFilename)
    ? JSON.parse(readFileSync(nycFilename, 'utf8'))
    : {}
  return createCoverageMap(previousCoverage)
})()

function saveCoverage(coverage: unknown): void {
  if (!existsSync(nycReportOptions.tempDir as string)) {
    mkdirSync(nycReportOptions.tempDir as string, { recursive: true })
    log('created folder %s for output coverage', nycReportOptions.tempDir)
  }

  writeFileSync(nycFilename, JSON.stringify(coverage, null, 2))
}

function maybePrintFinalCoverageFiles(folder: string): void {
  const jsonReportFilename = join(folder, 'coverage-final.json')
  if (!existsSync(jsonReportFilename)) {
    log('Did not find final coverage file %s', jsonReportFilename)
    return
  }

  log('Final coverage in %s', jsonReportFilename)
  const finalCoverage: Record<string, { s?: Record<string, number> }> =
    JSON.parse(readFileSync(jsonReportFilename, 'utf8'))
  const finalCoverageKeys = Object.keys(finalCoverage)
  log('There are %d key(s) in %s', finalCoverageKeys.length, jsonReportFilename)

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

    log(
      '%s %s statements covered %d/%d',
      coverageStatus,
      key,
      coveredStatements,
      totalStatements
    )
  })
}

/**
 * Checks the final coverage against the thresholds in the NYC options.
 * Runs once at the end of "cypress run", after the last spec's report.
 */
async function checkCoverageAfterRun(): Promise<void> {
  if (customNycReportScript) {
    log(
      'skipping coverage threshold check, using script "%s" from package.json',
      DEFAULT_CUSTOM_COVERAGE_SCRIPT_NAME
    )
    return
  }
  if (!existsSync(nycFilename)) {
    log('skipping coverage threshold check, cannot find %s', nycFilename)
    return
  }

  const NYC = require('nyc')
  const nyc = new NYC(nycReportOptions)
  const finalCoverageMap: IstanbulCoverageMap =
    await nyc.getCoverageMapFromAllCoverageFiles()
  const errors = checkCoverageThresholds(finalCoverageMap, nycReportOptions)
  if (errors.length) {
    throw new Error(
      `Code coverage is below the threshold:\n${errors.join('\n')}`
    )
  }
  log('coverage meets the thresholds')
}

interface TaskParams {
  isInteractive?: boolean
}

const tasks = {
  /**
   * Clears accumulated code coverage information.
   *
   * Interactive mode with "cypress open"
   *    - running a single spec or "Run all specs" needs to reset coverage
   * Headless mode with "cypress run"
   *    - runs EACH spec separately, so we cannot reset the coverage
   *      or we will lose the coverage from previous specs. The user is
   *      expected to delete .nyc_output before "cypress run" instead.
   */
  resetCoverage({ isInteractive }: TaskParams): null {
    if (isInteractive) {
      log('reset code coverage in interactive mode')
      coverageMap = createCoverageMap({})
      saveCoverage(coverageMap)
    }

    return null
  },

  /**
   * Merges a test's coverage into the coverage collected so far.
   *
   * @param sentCoverage Stringified coverage object sent by the test runner
   */
  combineCoverage(sentCoverage: string): null {
    const coverage = JSON.parse(sentCoverage)
    log('parsed sent coverage')

    fixSourcePaths(coverage)

    coverageMap.merge(coverage)

    return null
  },

  /**
   * Saves the coverage to the nyc output file and generates the report,
   * using the "coverage:report" script when package.json has one
   */
  coverageReport(): Promise<string | null> {
    saveCoverage(coverageMap)

    showNycInfo(nycFilename)

    const allSourceFilesMissing = checkAllPathsNotFound(nycFilename)
    if (allSourceFilesMissing) {
      tryFindingLocalFiles(nycFilename)
    }

    resolveRelativePaths(nycFilename)

    if (customNycReportScript) {
      log(
        'saving coverage report using script "%s" from package.json, command: %s',
        DEFAULT_CUSTOM_COVERAGE_SCRIPT_NAME,
        customNycReportScript
      )
      log('current working directory is %s', process.cwd())
      return execa('npm', ['run', DEFAULT_CUSTOM_COVERAGE_SCRIPT_NAME], {
        stdio: 'inherit'
      }).then(() => null)
    }

    if (nycReportOptions.all) {
      log('nyc needs to report on all included files')
      includeAllFiles(nycFilename, nycReportOptions)
    }

    log('calling NYC reporter with options %o', nycReportOptions)
    log('current working directory is %s', process.cwd())
    const NYC = require('nyc')
    const nyc = new NYC(nycReportOptions)

    const returnReportFolder = (): string => {
      const reportFolder = nycReportOptions['report-dir'] as string
      log('after reporting, returning the report folder name %s', reportFolder)

      maybePrintFinalCoverageFiles(reportFolder)

      return reportFolder
    }
    return nyc.report().then(returnReportFolder)
  }
}

/**
 * Registers code coverage collection and reporting tasks.
 * @example
  ```
    setupNodeEvents(on, config) {
      require('@cypress/code-coverage/task')(on, config)
      // the browser only sees the flag set below if the config is returned
      return config
    }
  ```
*/
export = function registerCodeCoverageTasks(
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions
): Cypress.PluginConfigOptions {
  on('task', tasks)

  const codeCoverageConfig = config.expose.codeCoverage as
    | { checkCoverage?: boolean }
    | undefined
  if (codeCoverageConfig?.checkCoverage === true) {
    on('after:run', checkCoverageAfterRun)
  } else if (
    nycReportOptions['check-coverage'] ||
    nycReportOptions.checkCoverage
  ) {
    console.warn(
      'NYC option "check-coverage" is ignored. To enforce coverage thresholds, set "expose.codeCoverage.checkCoverage" to true in your Cypress config'
    )
  }

  // support.ts skips its hooks unless it sees this, since cy.task would fail
  config.expose.codeCoverageTasksRegistered = true

  return config
}
