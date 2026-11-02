import { describe, it, expect, vi } from 'vitest'
import { requestBackendCoverage, pickFileCoverage } from '../../lib/task-utils'

const coverage = {
  '/app/server.js': { path: '/app/server.js', s: { 0: 1 } },
  '/app/cypress/e2e/spec.cy.js': {
    path: '/app/cypress/e2e/spec.cy.js',
    s: { 0: 1 }
  }
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

describe('requestBackendCoverage', () => {
  it('returns the coverage from an absolute URL', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ coverage }))

    const result = await requestBackendCoverage(
      'http://localhost:3003/__coverage__',
      undefined,
      1000,
      fetchImpl as typeof fetch
    )

    expect(result).toEqual({ coverage })
    expect(String(fetchImpl.mock.calls[0][0])).toBe(
      'http://localhost:3003/__coverage__'
    )
  })

  it('resolves a relative URL against the base URL', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ coverage }))

    await requestBackendCoverage(
      '/__coverage__',
      'http://localhost:1234/app/',
      1000,
      fetchImpl as typeof fetch
    )

    expect(String(fetchImpl.mock.calls[0][0])).toBe(
      'http://localhost:1234/__coverage__'
    )
  })

  it('reports a relative URL without a base URL', async () => {
    const fetchImpl = vi.fn()

    const result = await requestBackendCoverage(
      '/__coverage__',
      undefined,
      1000,
      fetchImpl as typeof fetch
    )

    expect(result).toHaveProperty('reason')
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('reports an unreachable server', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError('fetch failed')
    })

    const result = await requestBackendCoverage(
      'http://localhost:3003/__coverage__',
      undefined,
      1000,
      fetchImpl as typeof fetch
    )

    expect(result).toEqual({
      reason: 'could not fetch http://localhost:3003/__coverage__: fetch failed'
    })
  })

  it('gives up on a server that never responds', async () => {
    const fetchImpl = vi.fn(
      (_url: URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () =>
            reject(init.signal?.reason)
          )
        })
    )

    const result = await requestBackendCoverage(
      'http://localhost:3003/__coverage__',
      undefined,
      50,
      fetchImpl as unknown as typeof fetch
    )

    expect(result).toHaveProperty('reason')
  })

  it('reports an error status, such as a backend that needs cookies', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({}, 401))

    const result = await requestBackendCoverage(
      'http://localhost:3003/__coverage__',
      undefined,
      1000,
      fetchImpl as typeof fetch
    )

    expect(result).toEqual({
      reason: 'http://localhost:3003/__coverage__ responded with 401'
    })
  })

  it('reports a response without coverage', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ coverage: null }))

    const result = await requestBackendCoverage(
      'http://localhost:3003/__coverage__',
      undefined,
      1000,
      fetchImpl as typeof fetch
    )

    expect(result).toHaveProperty('reason')
  })

  it('reports a response that is not JSON', async () => {
    const fetchImpl = vi.fn(async () => new Response('<html>Log in</html>'))

    const result = await requestBackendCoverage(
      'http://localhost:3003/__coverage__',
      undefined,
      1000,
      fetchImpl as typeof fetch
    )

    expect(result).toHaveProperty('reason')
  })
})

describe('pickFileCoverage', () => {
  it('keeps only the listed files', () => {
    expect(
      pickFileCoverage(coverage, ['/app/server.js', '/app/missing.js'])
    ).toEqual({ '/app/server.js': coverage['/app/server.js'] })
  })
})
