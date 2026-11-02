import { describe, it, expect, afterEach } from 'vitest'
import { EventEmitter } from 'events'
import { mkdtempSync, readFileSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import path from 'path'
import preprocessor from '../../lib/use-babelrc'

const fixtures = path.join(__dirname, '__fixtures__', 'use-babelrc-ts')

describe('use-babelrc', () => {
  let outDir: string | undefined

  afterEach(() => {
    if (outDir) {
      rmSync(outDir, { recursive: true, force: true })
      outDir = undefined
    }
  })

  it('bundles TypeScript specs and instruments the .ts files they import', async () => {
    outDir = mkdtempSync(path.join(tmpdir(), 'use-babelrc-'))
    const file = Object.assign(new EventEmitter(), {
      filePath: path.join(fixtures, 'spec.ts'),
      outputPath: path.join(outDir, 'spec.js'),
      shouldWatch: false
    }) as unknown as Cypress.FileObject

    const bundle = readFileSync(await preprocessor(file), 'utf8')

    expect(bundle).toContain('__coverage__')
    expect(bundle).toContain(JSON.stringify(path.join(fixtures, 'math.ts')))
  }, 60_000)
})
