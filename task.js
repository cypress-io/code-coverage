// @ts-check
const istanbul = require('istanbul-lib-coverage')
const { join, resolve, isAbsolute } = require('path')
const { existsSync, mkdirSync, readFileSync, writeFileSync } = require('fs')
const execa = require('execa')
const path = require('path')
const { fixSourcePathes, showNycInfo } = require('./utils')
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
const pkg = existsSync(pkgFilename)
  ? JSON.parse(readFileSync(pkgFilename, 'utf8'))
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

/**
 * @param {string[]} filepaths
 * @returns {string | undefined} common prefix that corresponds to current folder
 */
function findCommonRoot(filepaths) {
  if (!filepaths.length) {
    debug('cannot find common root without any files')
    return
  }

  // assuming / as file separator
  const splitParts = filepaths.map(name => name.split('/'))
  const lengths = splitParts.map(arr => arr.length)
  const shortestLength = Math.min.apply(null, lengths)
  debug('shorted file path has %d parts', shortestLength)

  const cwd = process.cwd()
  let commonPrefix = []
  let foundCurrentFolder

  for (let k = 0; k < shortestLength; k += 1) {
    const part = splitParts[0][k]
    const prefix = commonPrefix.concat(part).join('/')
    debug('testing prefix %o', prefix)
    const allFilesStart = filepaths.every(name => name.startsWith(prefix))
    if (!allFilesStart) {
      debug('stopped at non-common prefix %s', prefix)
      break
    }

    commonPrefix.push(part)

    const removedPrefixNames = filepaths.map(filepath =>
      filepath.slice(prefix.length)
    )
    debug('removedPrefix %o', removedPrefixNames)
    const foundAllPaths = removedPrefixNames.every(filepath =>
      existsSync(path.join(cwd, filepath))
    )
    debug('all files found at %s? %o', prefix, foundAllPaths)
    if (foundAllPaths) {
      debug('found prefix that matches current folder: %s', prefix)
      foundCurrentFolder = prefix
      break
    }
  }

  return foundCurrentFolder
}

function tryFindingLocalFiles(nycFilename) {
  const nycCoverage = JSON.parse(readFileSync(nycFilename, 'utf8'))
  const coverageKeys = Object.keys(nycCoverage)
  const filenames = coverageKeys.map(key => nycCoverage[key].path)
  const commonFolder = findCommonRoot(filenames)
  if (!commonFolder) {
    debug('could not find common folder %s', commonFolder)
    return
  }
  const cwd = process.cwd()
  debug(
    'found common folder %s that matches current working directory %s',
    commonFolder,
    cwd
  )
  const length = commonFolder.length
  let changed

  coverageKeys.forEach(key => {
    const from = nycCoverage[key].path
    if (from.startsWith(commonFolder)) {
      const to = path.join(cwd, from.slice(length))
      nycCoverage[key].path = to
      debug('replaced %s -> %s', from, to)
      changed = true
    }
  })

  if (changed) {
    debug('saving updated file %s', nycFilename)
    writeFileSync(
      nycFilename,
      JSON.stringify(nycCoverage, null, 2) + '\n',
      'utf8'
    )
  }
}

function checkAllPathsNotFound(nycFilename) {
  const nycCoverage = JSON.parse(readFileSync(nycFilename, 'utf8'))

  const coverageKeys = Object.keys(nycCoverage)
  if (!coverageKeys.length) {
    console.error('⚠️ file %s has no coverage information', nycFilename)
    return
  }

  const allFilesAreMissing = coverageKeys.every((key, k) => {
    const coverage = nycCoverage[key]
    return !existsSync(coverage.path)
  })

  debug(
    'in file %s all files are not found? %o',
    nycFilename,
    allFilesAreMissing
  )
  return allFilesAreMissing
}

/**
 * Looks at all coverage objects in the given JSON coverage file
 * and if the file is relative, and exists, changes its path to
 * be absolute.
 */
function resolveRelativePaths(nycFilename) {
  const nycCoverage = JSON.parse(readFileSync(nycFilename, 'utf8'))

  const coverageKeys = Object.keys(nycCoverage)
  if (!coverageKeys.length) {
    console.error('⚠️ file %s has no coverage information', nycFilename)
    return
  }
  debug('NYC file %s has %d key(s)', nycFilename, coverageKeys.length)

  let changed

  coverageKeys.forEach((key, k) => {
    const coverage = nycCoverage[key]

    if (!coverage.path) {
      debug('key %s does not have path', key)
      return
    }

    if (!isAbsolute(coverage.path)) {
      if (existsSync(coverage.path)) {
        debug('resolving path %s', coverage.path)
        coverage.path = resolve(coverage.path)
        changed = true
      }
      return
    }

    // path is absolute, let's check if it exists
    if (!existsSync(coverage.path)) {
      debug('⚠️ cannot find file %s with hash %s', coverage.path, coverage.hash)
    }
  })

  if (changed) {
    debug('saving updated file %s', nycFilename)
    writeFileSync(
      nycFilename,
      JSON.stringify(nycCoverage, null, 2) + '\n',
      'utf8'
    )
  }
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

    const reportFolder = nycOptions['report-dir'] || './coverage'
    const reportDir = resolve(reportFolder)
    const reporter = nycOptions['reporter'] || ['lcov', 'clover', 'json']

    // TODO we could look at how NYC is parsing its CLI arguments
    // I am mostly worried about additional NYC options that are stored in
    // package.json and .nycrc resource files.
    // for now let's just camel case all options
    // https://github.com/istanbuljs/nyc#common-configuration-options
    const nycReportOptions = {
      reportDir,
      tempDir: coverageFolder,
      reporter: [].concat(reporter), // make sure this is a list
      include: nycOptions.include,
      exclude: nycOptions.exclude,
      // from working with TypeScript code seems we need these settings too
      excludeAfterRemap: true,
      extension: nycOptions.extension || [
        '.js',
        '.cjs',
        '.mjs',
        '.ts',
        '.tsx',
        '.jsx'
      ],
      all: nycOptions.all
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
