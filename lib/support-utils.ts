/// <reference types="cypress" />
/// <reference lib="dom" />

// Runs in the browser, so these helpers must not touch the file system

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

export function filterFilesFromCoverage(
  totalCoverage: CoverageObject,
  config: typeof Cypress.config = Cypress.config,
  expose: typeof Cypress.expose = Cypress.expose,
  spec: typeof Cypress.spec = Cypress.spec
): CoverageObject {
  const fileCoverage = ownFileCoverage(totalCoverage)
  const withoutSpecs = filterSpecsFromCoverage(
    fileCoverage,
    config,
    expose,
    spec
  )
  const appCoverageOnly = filterSupportFilesFromCoverage(withoutSpecs, config)
  return appCoverageOnly
}

/**
 * Copies only the coverage object's own string keys, which are the file paths.
 * The object can also carry inherited or Symbol keys added by the page's
 * runtime (for example a dynamically imported wasm module), and lodash omitBy
 * would visit those and copy inherited ones into the result.
 * https://github.com/cypress-io/code-coverage/issues/908
 */
function ownFileCoverage(totalCoverage: CoverageObject): CoverageObject {
  const coverage: CoverageObject = {}
  for (const filePath of Object.keys(totalCoverage)) {
    coverage[filePath] = totalCoverage[filePath]
  }
  return coverage
}

/** Converts Windows path separators so paths can be matched against globs */
function toForwardSlashes(filePath: string): string {
  return filePath.replace(/\\/g, '/')
}

function filterSpecsFromCoverage(
  totalCoverage: CoverageObject,
  config: typeof Cypress.config = Cypress.config,
  expose: typeof Cypress.expose = Cypress.expose,
  spec: typeof Cypress.spec = Cypress.spec
): CoverageObject {
  const testFilePatterns = getCypressExcludePatterns(config, expose)

  const absoluteSpec = toForwardSlashes(spec.absolute)
  const relativeSpec = toForwardSlashes(spec.relative)
  const workingDir = absoluteSpec.endsWith(relativeSpec)
    ? absoluteSpec.slice(0, absoluteSpec.length - relativeSpec.length)
    : ''

  const isTestFile = (_: unknown, filePath: string): boolean => {
    const normalizedPath = toForwardSlashes(filePath)
    const filename =
      workingDir && normalizedPath.startsWith(workingDir)
        ? normalizedPath.slice(workingDir.length)
        : normalizedPath
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
    for (const p of testFilePattern) {
      if (p !== undefined && typeof p === 'string') {
        testFilePatterns.push(p)
      }
    }
  } else if (testFilePattern && typeof testFilePattern === 'string') {
    testFilePatterns = [testFilePattern]
  }

  if (Array.isArray(excludePattern)) {
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

export function getSendCoverageBatchSize(): number | null {
  const batchSize = Cypress.expose('sendCoverageBatchSize')
  const parsedBatchSize = parseInt(String(batchSize), 10)
  const isValid = !isNaN(parsedBatchSize) && parsedBatchSize > 0
  return isValid ? parsedBatchSize : null
}
