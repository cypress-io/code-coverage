import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'

// Simulate Windows: tinyglobby always returns forward slashes, while the
// OS-native separator (and what instrumented entries use) is a backslash
vi.mock('path', async () => {
  const actual = await vi.importActual<typeof import('path')>('path')
  return { ...actual.win32, default: actual.win32 }
})

vi.mock('tinyglobby', () => ({
  globSync: () => ['C:/project/src/covered.js', 'C:/project/src/missing.js']
}))

const { includeAllFiles } = await import('../../lib/task-utils')

describe('includeAllFiles on Windows', () => {
  let dir: string
  let nycFilename: string

  beforeEach(() => {
    dir = mkdtempSync(`${tmpdir()}/include-all-files-`)
    nycFilename = `${dir}/out.json`
    const coveredPath = 'C:\\project\\src\\covered.js'
    writeFileSync(
      nycFilename,
      JSON.stringify({
        [coveredPath]: {
          path: coveredPath,
          statementMap: {},
          fnMap: {},
          branchMap: {},
          s: {},
          f: {},
          b: {}
        }
      })
    )
  })

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true })
  })

  it('adds placeholders with native separators and skips covered files', () => {
    includeAllFiles(nycFilename, { all: true, extension: ['.js'] })

    const coverage = JSON.parse(readFileSync(nycFilename, 'utf8'))
    expect(Object.keys(coverage)).toEqual([
      'C:\\project\\src\\covered.js',
      'C:\\project\\src\\missing.js'
    ])
    expect(coverage['C:\\project\\src\\missing.js'].path).toBe(
      'C:\\project\\src\\missing.js'
    )
  })
})
