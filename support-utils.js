// @ts-check
// helper functions that are safe to use in the browser
// from support.js file - no file system access

/**
 * remove coverage for the spec files themselves,
 * only keep "external" application source file coverage
 */
const filterSpecsFromCoverage = (
  totalCoverage,
  config = Cypress.config,
  env = Cypress.env,
  spec = Cypress.spec
) => {
  const testFilePatterns = getCypressExcludePatterns(config, env)

  const isTestFile = (_, filePath) => {
    const workingDir = spec.absolute.replace(spec.relative, '')
    const filename = filePath.replace(workingDir, '')
    const matchedPattern = testFilePatterns.some((specPattern) =>
      Cypress.minimatch(filename, specPattern, { debug: false })
    )
    const matchedEndOfPath = testFilePatterns.some((specPattern) =>
      filename.endsWith(specPattern)
    )
    return matchedPattern || matchedEndOfPath
  }

  const coverage = Cypress._.omitBy(totalCoverage, isTestFile)
  return coverage
}

/**
 * Reads Cypress config and exclude patterns and combines them into one array
 * @param {*} config
 * @param {*} env
 * @returns string[]
 */
function getCypressExcludePatterns(config, env) {
  let testFilePatterns = []

  const testFilePattern = config('specPattern') || config('testFiles')
  const excludePattern = env().codeCoverage && env().codeCoverage.exclude

  if (Array.isArray(testFilePattern)) {
    testFilePatterns = testFilePattern
  } else {
    testFilePatterns = [testFilePattern]
  }

  // combine test files pattern and exclude patterns into single exclude pattern
  if (Array.isArray(excludePattern)) {
    testFilePatterns = [...testFilePatterns, ...excludePattern]
  } else if (excludePattern) {
    testFilePatterns = [...testFilePatterns, excludePattern]
  }

  // Cypress <v10 might have integration folder with default **/*.* pattern,
  // if so, exclude those files
  const integrationFolder = config('integrationFolder')
  if (integrationFolder) {
    testFilePatterns.forEach((pattern, idx) => {
      if (pattern === '**/*.*') {
        testFilePatterns[idx] = `${integrationFolder}/${pattern}`.replace(
          '//',
          '/'
        )
      }
    })
  }

  return testFilePatterns
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
