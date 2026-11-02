import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { createCoverageMap, type FileCoverageData } from 'istanbul-lib-coverage'

import { includeAllFiles, initialFileCoverage } from '../../lib/task-utils'

const fixturesFolder = join(__dirname, '__fixtures__', 'all-files').replace(
  /\\/g,
  '/'
)
const fixture = (name: string) => `${fixturesFolder}/${name}`

function expectZeroCoverage(coverage: FileCoverageData | null) {
  expect(coverage).not.toBeNull()
  const statements = Object.values(coverage!.s)
  expect(statements.length).toBeGreaterThan(0)
  expect(statements.every((count) => count === 0)).toBe(true)
  expect(Object.values(coverage!.f).every((count) => count === 0)).toBe(true)
}

describe('initialFileCoverage', () => {
  it('returns zero counters for a JavaScript file', () => {
    const coverage = initialFileCoverage(fixture('not-loaded.js'), {})
    expectZeroCoverage(coverage)
    expect(coverage!.path).toBe(fixture('not-loaded.js'))
    expect(Object.keys(coverage!.fnMap)).toHaveLength(1)
    expect(Object.keys(coverage!.branchMap)).toHaveLength(1)
  })

  it('returns zero counters for a TypeScript file with a generic arrow function', () => {
    const coverage = initialFileCoverage(fixture('not-loaded.ts'), {})
    expectZeroCoverage(coverage)
    expect(Object.keys(coverage!.fnMap)).toHaveLength(2)
  })

  it('returns zero counters for a TSX file', () => {
    expectZeroCoverage(initialFileCoverage(fixture('not-loaded.tsx'), {}))
  })

  it('uses the NYC parser plugins when they are set', () => {
    expect(initialFileCoverage(fixture('decorated.js'), {})).toBeNull()
    expectZeroCoverage(
      initialFileCoverage(fixture('decorated.js'), {
        'parser-plugins': ['decorators-legacy']
      })
    )
  })

  it('returns null for a file it cannot parse', () => {
    expect(initialFileCoverage(fixture('not-loaded.vue'), {})).toBeNull()
  })
})

describe('includeAllFiles', () => {
  let tempFolder: string
  let nycFilename: string

  const nycOptions = {
    all: true,
    extension: ['.js', '.ts', '.vue'],
    include: [`${fixturesFolder}/*.{js,ts,vue}`]
  }

  const readCoverage = (): Record<string, FileCoverageData> =>
    JSON.parse(readFileSync(nycFilename, 'utf8'))

  beforeEach(() => {
    tempFolder = mkdtempSync(join(tmpdir(), 'include-all-files-'))
    nycFilename = join(tempFolder, 'out.json')

    const loaded = initialFileCoverage(fixture('loaded.js'), {})!
    Object.keys(loaded.s).forEach((key) => (loaded.s[key] = 1))
    Object.keys(loaded.f).forEach((key) => (loaded.f[key] = 1))
    writeFileSync(nycFilename, JSON.stringify({ [loaded.path]: loaded }))
  })

  afterEach(() => {
    rmSync(tempFolder, { recursive: true, force: true })
  })

  it('adds empty placeholders for files no test loaded by default', () => {
    includeAllFiles(nycFilename, nycOptions)

    const coverage = readCoverage()
    expect(coverage[fixture('not-loaded.js')].statementMap).toEqual({})
    expect(coverage[fixture('not-loaded.ts')].statementMap).toEqual({})
    expect(createCoverageMap(coverage).getCoverageSummary().lines.pct).toBe(100)
  })

  it('adds zero coverage for files no test loaded with instrumentUnloadedFiles', () => {
    includeAllFiles(nycFilename, nycOptions, { instrumentUnloadedFiles: true })

    const coverage = readCoverage()
    expect(Object.values(coverage[fixture('loaded.js')].s)).not.toContain(0)
    expectZeroCoverage(coverage[fixture('not-loaded.js')])
    expectZeroCoverage(coverage[fixture('not-loaded.ts')])
    expect(coverage[fixture('not-loaded.vue')].statementMap).toEqual({})

    const summary = createCoverageMap(coverage).getCoverageSummary()
    expect(summary.lines.covered).toBe(1)
    expect(summary.lines.pct).toBeLessThan(100)
  })
})
