import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  mkdtempSync,
  readFileSync,
  rmSync,
  utimesSync,
  writeFileSync
} from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { createCoverageMap } from 'istanbul-lib-coverage'
import {
  comparablePath,
  includeAllFiles,
  initialFileCoverage,
  parserPluginsFor
} from '../../lib/task-utils'
import { defaultNycOptions, type NycOptions } from '../../lib/common-utils'

const fixturesFolder = join(__dirname, '__fixtures__', 'all-files')
const jsFile = join(fixturesFolder, 'not-loaded.js')
const tsFile = join(fixturesFolder, 'not-loaded.ts')
const vueFile = join(fixturesFolder, 'not-loaded.vue')
const decoratedFile = join(fixturesFolder, 'decorated.js')

const allZero = (counters: Record<string, number>): boolean =>
  Object.values(counters).every((count) => count === 0)

const statementCount = (coverage: { statementMap: object }): number =>
  Object.keys(coverage.statementMap).length

describe('parserPluginsFor', () => {
  it('keeps the nyc defaults when adding configured plugins', () => {
    const plugins = parserPluginsFor(jsFile, {
      'parser-plugins': ['decorators-legacy']
    })
    expect(plugins).toContain('topLevelAwait')
    expect(plugins).toContain('decorators-legacy')
    expect(plugins).toContain('jsx')
  })

  it('reads the camelCase "parserPlugins" option', () => {
    const plugins = parserPluginsFor(jsFile, {
      parserPlugins: ['decorators-legacy']
    })
    expect(plugins).toContain('decorators-legacy')
  })

  it('removes "jsx" and "flow" for .ts files', () => {
    const plugins = parserPluginsFor(tsFile, {
      'parser-plugins': ['jsx', 'flow', ['decorators', { version: '2023-11' }]]
    })
    expect(plugins).not.toContain('jsx')
    expect(plugins).not.toContain('flow')
    expect(plugins).toContain('typescript')
    expect(plugins).toContainEqual(['decorators', { version: '2023-11' }])
  })

  it('does not repeat plugins', () => {
    const plugins = parserPluginsFor(jsFile, {
      'parser-plugins': ['jsx', 'topLevelAwait']
    })
    expect(plugins.filter((p) => p === 'jsx')).toHaveLength(1)
    expect(plugins.filter((p) => p === 'topLevelAwait')).toHaveLength(1)
  })
})

describe('comparablePath', () => {
  it('uses forward slashes', () => {
    expect(comparablePath('src\\app\\main.js', 'linux')).toBe('src/app/main.js')
  })

  it('ignores the case of Windows paths', () => {
    expect(comparablePath('c:\\app\\Main.js', 'win32')).toBe(
      comparablePath('C:/app/main.js', 'win32')
    )
  })

  it('keeps the case of other paths', () => {
    expect(comparablePath('/app/Main.js', 'linux')).toBe('/app/Main.js')
  })
})

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

  it('parses a TypeScript file when "jsx" is a configured plugin', () => {
    const coverage = initialFileCoverage(tsFile, {
      ...defaultNycOptions,
      'parser-plugins': ['jsx']
    })
    expect(statementCount(coverage)).toBeGreaterThan(0)
  })

  it('uses the configured camelCase "parserPlugins"', () => {
    expect(
      statementCount(initialFileCoverage(decoratedFile, defaultNycOptions))
    ).toBe(0)
    const coverage = initialFileCoverage(decoratedFile, {
      ...defaultNycOptions,
      parserPlugins: ['decorators-legacy']
    })
    expect(statementCount(coverage)).toBeGreaterThan(0)
  })

  it('returns a new copy of the cached coverage each time', () => {
    const first = initialFileCoverage(jsFile, defaultNycOptions)
    first.s['0'] = 5
    const second = initialFileCoverage(jsFile, defaultNycOptions)
    expect(second.s['0']).toBe(0)
  })

  it('instruments the file again after it changes', () => {
    const tempFolder = mkdtempSync(join(tmpdir(), 'code-coverage-'))
    try {
      const file = join(tempFolder, 'changes.js')
      writeFileSync(file, 'export const a = 1\n')
      expect(statementCount(initialFileCoverage(file, defaultNycOptions))).toBe(
        1
      )

      writeFileSync(file, 'export const a = 1\nexport const b = 2\n')
      // make sure the modified time differs even on coarse file systems
      const later = new Date(Date.now() + 10_000)
      utimesSync(file, later, later)
      expect(statementCount(initialFileCoverage(file, defaultNycOptions))).toBe(
        2
      )
    } finally {
      rmSync(tempFolder, { recursive: true, force: true })
    }
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
