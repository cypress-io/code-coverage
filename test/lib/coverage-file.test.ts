import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  mkdtempSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync
} from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { readCoverageFile, writeFileAtomic } from '../../lib/task-utils'
import coverage from './__fixtures__/coverage.json'

describe('coverage file helpers', () => {
  let folder: string
  let filename: string

  beforeEach(() => {
    folder = mkdtempSync(join(tmpdir(), 'code-coverage-'))
    filename = join(folder, 'out.json')
  })

  afterEach(() => {
    rmSync(folder, { recursive: true, force: true })
    vi.restoreAllMocks()
  })

  describe('writeFileAtomic', () => {
    it('writes the file without leaving a temporary file behind', () => {
      writeFileAtomic(filename, JSON.stringify(coverage))

      expect(JSON.parse(readFileSync(filename, 'utf8'))).toEqual(coverage)
      expect(readdirSync(folder)).toEqual(['out.json'])
    })

    it('replaces an existing file', () => {
      writeFileSync(filename, '{"old": true}')

      writeFileAtomic(filename, JSON.stringify(coverage))

      expect(JSON.parse(readFileSync(filename, 'utf8'))).toEqual(coverage)
    })

    it('leaves the existing file untouched when the write fails', () => {
      const previous = JSON.stringify(coverage)
      writeFileSync(filename, previous)
      // a folder where the temporary file should go makes the write fail
      mkdirSync(`${filename}.${process.pid}.tmp`)

      expect(() => writeFileAtomic(filename, '{"partial":')).toThrow()

      expect(readFileSync(filename, 'utf8')).toEqual(previous)
    })
  })

  describe('readCoverageFile', () => {
    it('returns an empty object when the file does not exist', () => {
      expect(readCoverageFile(filename)).toEqual({})
    })

    it('returns the saved coverage', () => {
      writeFileSync(filename, JSON.stringify(coverage))

      expect(readCoverageFile(filename)).toEqual(coverage)
    })

    it('warns and returns an empty object for a truncated file', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      writeFileSync(filename, JSON.stringify(coverage).slice(0, 50))

      expect(readCoverageFile(filename)).toEqual({})
      expect(warn).toHaveBeenCalledOnce()
      expect(warn.mock.calls[0][1]).toEqual(filename)
    })
  })
})
