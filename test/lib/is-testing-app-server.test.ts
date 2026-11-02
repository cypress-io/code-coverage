import { describe, it, expect } from 'vitest'

import { isTestingAppServer } from '../../lib/support-utils'

const proxyUrl = 'http://localhost:54321'

describe('isTestingAppServer', () => {
  it('is true when a baseUrl is set', () => {
    expect(
      isTestingAppServer('http://localhost:3003', proxyUrl, proxyUrl)
    ).toBe(true)
  })

  it('is true without a baseUrl when the page is on another origin', () => {
    expect(isTestingAppServer(null, 'http://localhost:3003', proxyUrl)).toBe(
      true
    )
  })

  it('is false without a baseUrl when a local file was visited', () => {
    expect(isTestingAppServer(null, proxyUrl, proxyUrl)).toBe(false)
  })

  it('is false when the baseUrl is the Cypress proxy', () => {
    expect(isTestingAppServer(proxyUrl, undefined, proxyUrl)).toBe(false)
  })
})
