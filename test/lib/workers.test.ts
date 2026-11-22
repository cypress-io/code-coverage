import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { existsSync, mkdtempSync, readdirSync, realpathSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import partialCoverage from './__fixtures__/partial-coverage.json'

type Register = (
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions
) => Cypress.PluginConfigOptions

describe('cypress run --workers', () => {
  const originalCwd = process.cwd()
  let projectRoot: string

  beforeEach(() => {
    // realpath, since process.cwd() resolves the macOS /var -> /private/var link
    projectRoot = realpathSync(
      mkdtempSync(join(tmpdir(), 'code-coverage-workers-'))
    )
    // task.ts reads nyc options and the output folder from the cwd when it loads
    process.chdir(projectRoot)
    vi.resetModules()
  })

  afterEach(() => {
    process.chdir(originalCwd)
    rmSync(projectRoot, { recursive: true, force: true })
  })

  const register = async (config: Record<string, unknown>) => {
    const { default: registerCodeCoverageTasks } = (await import(
      '../../lib/task'
    )) as unknown as { default: Register }
    const events: Record<string, any> = {}
    const on = ((event: string, handler: unknown) => {
      events[event] = handler
    }) as Cypress.PluginEvents

    registerCodeCoverageTasks(on, {
      expose: {},
      ...config
    } as unknown as Cypress.PluginConfigOptions)

    return events
  }

  it('saves each worker coverage to its own file and leaves the report to after:run', async () => {
    const events = await register({ workerIndex: 1 })

    events.task.combineCoverage(JSON.stringify(partialCoverage))

    await expect(events.task.coverageReport()).resolves.toBeNull()
    expect(readdirSync(join(projectRoot, '.nyc_output'))).toEqual([
      'out-1.json'
    ])
    expect(existsSync(join(projectRoot, 'coverage'))).toBe(false)
    expect(events['after:run']).toBeTypeOf('function')
  })

  it('saves to out.json and reports after each spec without --workers', async () => {
    const events = await register({ workerIndex: null })

    events.task.combineCoverage(JSON.stringify(partialCoverage))

    await expect(events.task.coverageReport()).resolves.toBe(
      join(projectRoot, 'coverage')
    )
    expect(readdirSync(join(projectRoot, '.nyc_output'))).toEqual(['out.json'])
    expect(events['after:run']).toBeUndefined()
  })
})
