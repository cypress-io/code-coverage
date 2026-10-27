import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { createCoverageMap } from 'istanbul-lib-coverage'
import { includeAllFiles, initialFileCoverage } from '../../lib/task-utils'
import { defaultNycOptions, type NycOptions } from '../../lib/common-utils'

const fixturesFolder = join(__dirname, '__fixtures__', 'all-files')
const jsFile = join(fixturesFolder, 'not-loaded.js')
const tsFile = join(fixturesFolder, 'not-loaded.ts')
const vueFile = join(fixturesFolder, 'not-loaded.vue')

const allZero = (counters: Record<string, number>): boolean =>
  Object.values(counters).every((count) => count === 0)

describe('initialFileCoverage', () => {
  it('returns zero coverage for a JavaScript file', () => {
    const coverage = initialFileCoverage(jsFile, defaultNycOptions)
    expect(coverage.path).toBe(jsFile)
    expect(Object.keys(coverage.statementMap).length).toBeGreaterThan(0)
    expect(Object.keys(coverage.fnMap)).toHaveLength(2)
    expect(Object.keys(coverage.branchMap)).toHaveLength(1)
    expect(allZero(coverage.s)).toBe(true)
    expect(allZero(coverage.f)).toBe(true)
    expect(coverage.b).toEqual({ 0: [0, 0] })
  })

  it('returns zero coverage for a TypeScript file', () => {
    const coverage = initialFileCoverage(tsFile, defaultNycOptions)
    expect(coverage.path).toBe(tsFile)
    expect(Object.keys(coverage.statementMap).length).toBeGreaterThan(0)
    expect(Object.keys(coverage.fnMap)).toHaveLength(1)
    expect(allZero(coverage.s)).toBe(true)
    expect(allZero(coverage.f)).toBe(true)
  })

  it('reports the file at 0% lines', () => {
    const coverageMap = createCoverageMap({
      [jsFile]: initialFileCoverage(jsFile, defaultNycOptions)
    })
    const summary = coverageMap.fileCoverageFor(jsFile).toSummary()
    expect(summary.lines.total).toBeGreaterThan(0)
    expect(summary.lines.covered).toBe(0)
  })

  it('is replaced by real coverage when merged', () => {
    const initial = initialFileCoverage(jsFile, defaultNycOptions)
    // real coverage from the browser can map statements differently,
    // for example when the app code is transpiled before instrumenting
    const real = {
      path: jsFile,
      statementMap: {
        0: { start: { line: 2, column: 2 }, end: { line: 2, column: 15 } }
      },
      fnMap: {},
      branchMap: {},
      s: { 0: 1 },
      f: {},
      b: {}
    }

    const coverageMap = createCoverageMap({ [jsFile]: initial })
    coverageMap.merge({ [jsFile]: real })
    const merged = coverageMap.fileCoverageFor(jsFile)
    expect(merged.statementMap).toEqual(real.statementMap)
    expect(merged.s).toEqual({ 0: 1 })
  })

  it('falls back to a placeholder if the file cannot be parsed (Vue SFC)', () => {
    const coverage = initialFileCoverage(vueFile, defaultNycOptions)
    expect(coverage).toEqual({
      path: vueFile,
      statementMap: {},
      fnMap: {},
      branchMap: {},
      s: {},
      f: {},
      b: {}
    })
  })
})

describe('includeAllFiles', () => {
  let tempFolder: string
  let nycFilename: string
  const nycOptions: NycOptions = {
    ...defaultNycOptions,
    all: true,
    include: [jsFile, tsFile]
  }

  beforeEach(() => {
    tempFolder = mkdtempSync(join(tmpdir(), 'code-coverage-'))
    nycFilename = join(tempFolder, 'out.json')
    writeFileSync(nycFilename, '{}')
  })

  afterEach(() => {
    rmSync(tempFolder, { recursive: true, force: true })
  })

  const readCoverage = () => JSON.parse(readFileSync(nycFilename, 'utf8'))

  it('adds empty placeholders by default', () => {
    includeAllFiles(nycFilename, nycOptions)
    const coverage = readCoverage()
    expect(Object.keys(coverage).sort()).toEqual([jsFile, tsFile])
    expect(coverage[jsFile].statementMap).toEqual({})
    expect(coverage[tsFile].statementMap).toEqual({})
  })

  it('adds zero coverage with the "instrument" option', () => {
    includeAllFiles(nycFilename, nycOptions, { instrument: true })
    const coverage = readCoverage()
    expect(Object.keys(coverage).sort()).toEqual([jsFile, tsFile])
    expect(Object.keys(coverage[jsFile].statementMap).length).toBeGreaterThan(0)
    expect(Object.keys(coverage[tsFile].statementMap).length).toBeGreaterThan(0)
    expect(allZero(coverage[jsFile].s)).toBe(true)
    expect(allZero(coverage[tsFile].s)).toBe(true)
  })
})
