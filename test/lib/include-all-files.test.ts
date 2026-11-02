import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'

// Simulate Windows: tinyglobby always returns forward slashes, while the
// OS-native separator is a backslash
vi.mock('path', async () => {
  const actual = await vi.importActual<typeof import('path')>('path')
  return { ...actual.win32, default: actual.win32 }
})

vi.mock('tinyglobby', () => ({
  globSync: () => ['C:/project/src/covered.js', 'C:/project/src/missing.js']
}))

const { includeAllFiles } = await import('../../lib/task-utils')

const emptyEntry = (path: string) => ({
  path,
  statementMap: {},
  fnMap: {},
  branchMap: {},
  s: {},
  f: {},
  b: {}
})

describe('includeAllFiles on Windows', () => {
  let dir: string
  let nycFilename: string

  const run = (coveredPaths: string[]) => {
    const coverage = Object.fromEntries(
      coveredPaths.map((p) => [p, emptyEntry(p)])
    )
    writeFileSync(nycFilename, JSON.stringify(coverage))
    includeAllFiles(nycFilename, { all: true, extension: ['.js'] })
    return JSON.parse(readFileSync(nycFilename, 'utf8'))
  }

  beforeEach(() => {
    dir = mkdtempSync(`${tmpdir()}/include-all-files-`)
    nycFilename = `${dir}/out.json`
  })

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true })
  })

  it('uses backslashes when covered entries use backslashes', () => {
    const coverage = run(['C:\\project\\src\\covered.js'])

    expect(Object.keys(coverage)).toEqual([
      'C:\\project\\src\\covered.js',
      'C:\\project\\src\\missing.js'
    ])
    expect(coverage['C:\\project\\src\\missing.js'].path).toBe(
      'C:\\project\\src\\missing.js'
    )
  })

  it('keeps forward slashes when covered entries use forward slashes', () => {
    const coverage = run(['C:/project/src/covered.js'])

    expect(Object.keys(coverage)).toEqual([
      'C:/project/src/covered.js',
      'C:/project/src/missing.js'
    ])
    expect(coverage['C:/project/src/missing.js'].path).toBe(
      'C:/project/src/missing.js'
    )
  })

  it('falls back to backslashes when nothing is covered yet', () => {
    const coverage = run([])

    expect(Object.keys(coverage)).toEqual([
      'C:\\project\\src\\covered.js',
      'C:\\project\\src\\missing.js'
    ])
  })
})
