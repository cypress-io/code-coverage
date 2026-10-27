/// <reference types="cypress" />
/// <reference lib="dom" />

// helper functions that are safe to use in the browser
// from support.js file - no file system access

export interface CoverageObject {
  [key: string]: {
    path?: string
    inputSourceMap?: {
      sources: string[]
      sourceRoot?: string
    }
    [key: string]: unknown
  }
}

export interface WindowCoverageObject {
  coverage: unknown
  pathname: string
}

/**
 * Saves a reference to the application window's "__coverage__" object,
 * unless an equal coverage object has already been saved.
 * Safe to call several times per test, for example on "window:load"
 * and again after the test, to pick up coverage created by lazy-loaded code.
 */
export function saveWindowCoverageObject(
  win: Window | undefined,
  windowCoverageObjects: WindowCoverageObject[]
): void {
  // if the application code has been instrumented, then the app iframe "win.__coverage__" will be available,
  // in addition, accessing win.__coverage__ can throw when testing cross-origin code,
  // because we don't control the cross-origin code, we can safely return
  let applicationSourceCoverage: unknown
  try {
    // Note that we are purposefully not supporting the optional chaining syntax here to
    // support a wide range of projects (some of which are not set up to support the optional
    // chaining syntax due to current Cypress limitations). See:
    // https://github.com/cypress-io/cypress/issues/20753
    if (win) {
      applicationSourceCoverage = (
        win as typeof win & { __coverage__?: unknown }
      ).__coverage__
    }
  } catch {
    // ignore cross-origin errors
  }

  if (!win || !applicationSourceCoverage) {
    return
  }

  const existingCoverage = Cypress._.find(windowCoverageObjects, {
    coverage: applicationSourceCoverage
  })
  if (existingCoverage) {
    // this application code coverage object is already known
    // which can happen when combining `window:load` and `before` callbacks,
    // it can also happen when the user navigates away and then returns to the page
    // in which case we need to use new applicationSourceCoverage, because the old will not be updated anymore.
    existingCoverage.coverage = applicationSourceCoverage
    return
  }

  windowCoverageObjects.push({
    coverage: applicationSourceCoverage,
    pathname: win.location.pathname
  })
}

/** excludes files that shouldn't be in code coverage report */
export function filterFilesFromCoverage(
  totalCoverage: CoverageObject,
  config: typeof Cypress.config = Cypress.config,
  expose: typeof Cypress.expose = Cypress.expose,
  spec: typeof Cypress.spec = Cypress.spec
): CoverageObject {
  const withoutSpecs = filterSpecsFromCoverage(
    totalCoverage,
    config,
    expose,
    spec
  )
  const appCoverageOnly = filterSupportFilesFromCoverage(withoutSpecs, config)
  return appCoverageOnly
}

/**
 * remove coverage for the spec files themselves,
 * only keep "external" application source file coverage
 */
function filterSpecsFromCoverage(
  totalCoverage: CoverageObject,
  config: typeof Cypress.config = Cypress.config,
  expose: typeof Cypress.expose = Cypress.expose,
  spec: typeof Cypress.spec = Cypress.spec
): CoverageObject {
  const testFilePatterns = getCypressExcludePatterns(config, expose)

  const isTestFile = (_: unknown, filePath: string): boolean => {
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
 */
function getCypressExcludePatterns(
  config: typeof Cypress.config,
  expose: typeof Cypress.expose
): string[] {
  const testFilePattern = config('specPattern')
  const codeCoverageConfig = expose().codeCoverage as
    | { exclude?: string | string[] }
    | undefined
  const excludePattern = codeCoverageConfig?.exclude

  let testFilePatterns: string[] = []
  if (Array.isArray(testFilePattern)) {
    // Filter out any undefined values and ensure all are strings
    for (const p of testFilePattern) {
      if (p !== undefined && typeof p === 'string') {
        testFilePatterns.push(p)
      }
    }
  } else if (testFilePattern && typeof testFilePattern === 'string') {
    testFilePatterns = [testFilePattern]
  }

  // combine test files pattern and exclude patterns into single exclude pattern
  if (Array.isArray(excludePattern)) {
    // Filter out any undefined values and ensure all are strings
    for (const p of excludePattern) {
      if (p !== undefined && typeof p === 'string') {
        testFilePatterns.push(p)
      }
    }
  } else if (typeof excludePattern === 'string') {
    testFilePatterns.push(excludePattern)
  }

  return testFilePatterns
}

/**
 * Removes support file from the coverage object.
 * Support files are now handled via the exclude patterns in getCypressExcludePatterns.
 */
function filterSupportFilesFromCoverage(
  totalCoverage: CoverageObject,
  config: typeof Cypress.config = Cypress.config
): CoverageObject {
  const supportFile = config('supportFile') as string | undefined

  if (!supportFile) {
    return totalCoverage
  }

  const isSupportFile = (filename: string): boolean => filename === supportFile

  const coverage = Cypress._.omitBy(totalCoverage, (_fileCoverage, filename) =>
    isSupportFile(filename)
  )

  return coverage
}

/**
 * Replace source-map's path by the corresponding absolute file path
 * (coverage report wouldn't work with source-map path being relative
 * or containing Webpack loaders and query parameters)
 */
export function fixSourcePaths(coverage: CoverageObject): void {
  Object.values(coverage).forEach((file) => {
    const { path: absolutePath, inputSourceMap } = file
    if (!inputSourceMap || !absolutePath) return
    const fileNameMatch = /([^\/\\]+)$/.exec(absolutePath)
    if (!fileNameMatch) return
    const fileName = fileNameMatch[1]

    if (inputSourceMap.sourceRoot) inputSourceMap.sourceRoot = ''
    inputSourceMap.sources = inputSourceMap.sources.map((source) =>
      source.includes(fileName) ? absolutePath : source
    )
  })
}

/**
 * Validates and returns the configured batch size for
 * sending coverage to the backend
 */
export function getSendCoverageBatchSize(): number | null {
  const batchSize = Cypress.expose('sendCoverageBatchSize')
  const parsedBatchSize = parseInt(String(batchSize), 10)
  const isValid = !isNaN(parsedBatchSize) && parsedBatchSize > 0
  return isValid ? parsedBatchSize : null
}
