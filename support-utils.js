// @ts-check
// helper functions that are safe to use in the browser
// from support.js file - no file system access

/**
 * remove coverage for the spec files themselves,
 * only keep "external" application source file coverage
 */
const filterSpecsFromCoverage = (totalCoverage, config = Cypress.config) => {
  const integrationFolder = config('integrationFolder')
  /** @type {string} Cypress run-time config has test files string pattern */
  // @ts-ignore
  const testFilePattern = config('testFiles')

  // test files chould be:
  //  wild card string "**/*.*" (default)
  //  wild card string "**/*spec.js"
  //  list of wild card strings or names ["**/*spec.js", "spec-one.js"]
  const testFilePatterns = Array.isArray(testFilePattern)
    ? testFilePattern
    : [testFilePattern]

  const isUsingDefaultTestPattern = testFilePattern === '**/*.*'

  const isTestFile = (filename) => {
    const matchedPattern = testFilePatterns.some((specPattern) =>
      Cypress.minimatch(filename, specPattern)
    )
    const matchedEndOfPath = testFilePatterns.some((specPattern) =>
      filename.endsWith(specPattern)
    )
    return matchedPattern || matchedEndOfPath
  }

  const isInIntegrationFolder = (filename) =>
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
function fixSourcePaths(coverage) {
  Object.values(coverage).forEach((file) => {
    const { path: absolutePath, inputSourceMap } = file
    const fileName = /([^\/\\]+)$/.exec(absolutePath)[1]
    if (!inputSourceMap || !fileName) return

    if (inputSourceMap.sourceRoot) inputSourceMap.sourceRoot = ''
    inputSourceMap.sources = inputSourceMap.sources.map((source) =>
      source.includes(fileName) ? absolutePath : source
    )
  })
}

module.exports = {
  fixSourcePaths,
  filterSpecsFromCoverage
}
