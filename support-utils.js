// @ts-check
// helper functions that are safe to use in the browser
// from support.js file - no file system access

/** excludes files that shouldn't be in code coverage report */
const filterFilesFromCoverage = (
  totalCoverage,
  config = Cypress.config,
  env = Cypress.env,
  spec = Cypress.spec
) => {
  const withoutSpecs = filterSpecsFromCoverage(totalCoverage, config, env, spec)
  const appCoverageOnly = filterSupportFilesFromCoverage(withoutSpecs, config)
  return appCoverageOnly
}

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
  const testFilePatterns = getCypressExcludePatterns(config, env, spec)

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
function getCypressExcludePatterns(config, env, spec) {
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
  let integrationFolder = config('integrationFolder')
  if (integrationFolder) {
    const workingDir = spec.absolute.replace(spec.relative, '')
    integrationFolder = integrationFolder.replace(workingDir, '')
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
 * Removes support file from the coverage object.
 * If there are more files loaded from support folder, also removes them
 */
const filterSupportFilesFromCoverage = (
  totalCoverage,
  config = Cypress.config
) => {
  const integrationFolder = config('integrationFolder')

  /**
   * Cypress v10 doesn't have an integrationFolder config value any more, so we nope out here if its undefined.
   * Instead, we rely on the new exclude option logic done in the getCypressExcludePatterns function.
   */
  if (!integrationFolder) {
    return totalCoverage
  }

  const supportFile = config('supportFile')

  /** @type {string} Cypress run-time config has the support folder string */
  // @ts-ignore
  const supportFolder = config('supportFolder')

  const isSupportFile = (filename) => filename === supportFile

  let coverage = Cypress._.omitBy(totalCoverage, (fileCoverage, filename) =>
    isSupportFile(filename)
  )

  // check the edge case
  //   if we have files from support folder AND the support folder is not same
  //   as the integration, or its prefix (this might remove all app source files)
  //   then remove all files from the support folder
  if (!integrationFolder.startsWith(supportFolder)) {
    // remove all covered files from support folder
    coverage = Cypress._.omitBy(totalCoverage, (fileCoverage, filename) =>
      filename.startsWith(supportFolder)
    )
  }
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
    if (!inputSourceMap) return
    const fileName = /([^\/\\]+)$/.exec(absolutePath)[1]
    if (!fileName) return

    if (inputSourceMap.sourceRoot) inputSourceMap.sourceRoot = ''
    inputSourceMap.sources = inputSourceMap.sources.map((source) =>
      source.includes(fileName) ? absolutePath : source
    )
  })
}

module.exports = {
  fixSourcePaths,
  filterFilesFromCoverage
}
