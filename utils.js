/// <reference types="cypress" />

/**
 * remove coverage for the spec files themselves,
 * only keep "external" application source file coverage
 */
const filterSpecsFromCoverage = (totalCoverage, config = Cypress.config) => {
  const integrationFolder = config('integrationFolder')
  const testFilePattern = config('testFiles')

  // test files chould be:
  //  wild card string "**/*.*" (default)
  //  wild card string "**/*spec.js"
  //  list of wild card strings or names ["**/*spec.js", "spec-one.js"]
  const testFilePatterns = Array.isArray(testFilePattern)
    ? testFilePattern
    : [testFilePattern]

  const isUsingDefaultTestPattern = testFilePattern === '**/*.*'

  const isTestFile = filename => {
    const matchedPattern = testFilePatterns.some(specPattern =>
      Cypress.minimatch(filename, specPattern)
    )
    const matchedEndOfPath = testFilePatterns.some(specPattern =>
      filename.endsWith(specPattern)
    )
    return matchedPattern || matchedEndOfPath
  }

  const isInIntegrationFolder = filename =>
    filename.startsWith(integrationFolder)

  const isA = (fileCoverge, filename) => isInIntegrationFolder(filename)
  const isB = (fileCoverge, filename) => isTestFile(filename)

  const isTestFileFilter = isUsingDefaultTestPattern ? isA : isB

  const coverage = Cypress._.omitBy(totalCoverage, isTestFileFilter)
  return coverage
}

/**
 * Replace source-map's path by the corresponding absolute file path
 * (coverage report wouldn't work with source-map path being relative
 * or containing Webpack loaders and query parameters)
 */
function fixSourcePathes(coverage) {
  Object.values(coverage).forEach(file => {
    const { path: absolutePath, inputSourceMap } = file
    const fileName = /([^\/\\]+)$/.exec(absolutePath)[1]
    if (!inputSourceMap || !fileName) return

    if (inputSourceMap.sourceRoot) inputSourceMap.sourceRoot = ''
    inputSourceMap.sources = inputSourceMap.sources.map(source =>
      source.includes(fileName) ? absolutePath : source
    )
  })
}

/**
 * A small debug utility to inspect paths saved in NYC output JSON file
 */
function showNycInfo(nycFilename) {
  const nycCoverage = JSON.parse(readFileSync(nycFilename, 'utf8'))

  const coverageKeys = Object.keys(nycCoverage)
  if (!coverageKeys.length) {
    console.error('⚠️ file %s has no coverage information', nycFilename)
    return
  }
  debug('NYC file %s has %d key(s)', nycFilename, coverageKeys.length)

  const maxPrintKeys = 3
  const showKeys = coverageKeys.slice(0, maxPrintKeys)

  showKeys.forEach((key, k) => {
    const coverage = nycCoverage[key]

    // printing a few found keys and file paths from the coverage file
    // will make debugging any problems much much easier
    if (k < maxPrintKeys) {
      debug('%d key %s file path %s', k + 1, key, coverage.path)
    }
  })
}

module.exports = {
  fixSourcePathes,
  filterSpecsFromCoverage,
  showNycInfo
}
