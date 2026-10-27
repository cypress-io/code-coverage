import { describe, it, expect } from 'vitest'
import { canRequestUrl } from '../../lib/support-utils'

describe('canRequestUrl', () => {
  it('allows an absolute url without a baseUrl or page origin', () => {
    expect(
      canRequestUrl('http://localhost:3000/__coverage__', null, 'null')
    ).toBe(true)
    expect(
      canRequestUrl('https://example.com/__coverage__', undefined, '')
    ).toBe(true)
  })

  it('allows a host without a protocol, which cy.request qualifies', () => {
    expect(canRequestUrl('localhost:3000/__coverage__', null, '')).toBe(true)
  })

  it('allows a path when baseUrl is set', () => {
    expect(
      canRequestUrl('/__coverage__', 'http://localhost:1234', 'null')
    ).toBe(true)
  })

  it('allows a path when the page has an http origin', () => {
    expect(canRequestUrl('/__coverage__', null, 'http://localhost:1234')).toBe(
      true
    )
  })

  it('rejects a path without a baseUrl or page origin', () => {
    expect(canRequestUrl('/__coverage__', null, 'null')).toBe(false)
    expect(canRequestUrl('/__coverage__', undefined, '')).toBe(false)
  })

  it('treats a protocol-relative url as absolute', () => {
    expect(canRequestUrl('//localhost:3000/__coverage__', null, '')).toBe(true)
  })
})
