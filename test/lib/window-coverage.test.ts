import { describe, it, expect, beforeEach, vi } from 'vitest'
import _ from 'lodash'

import {
  saveWindowCoverageObject,
  type WindowCoverageObject
} from '../../lib/support-utils'

vi.stubGlobal('Cypress', { _ })

const makeWindow = (pathname: string, coverage?: unknown): Window =>
  ({
    location: { pathname },
    __coverage__: coverage
  }) as unknown as Window

describe('saveWindowCoverageObject', () => {
  let windowCoverageObjects: WindowCoverageObject[]

  beforeEach(() => {
    windowCoverageObjects = []
  })

  it('saves the window coverage object with its pathname', () => {
    const coverage = { '/app/a.js': { s: { 0: 1 } } }

    saveWindowCoverageObject(
      makeWindow('/about', coverage),
      windowCoverageObjects
    )

    expect(windowCoverageObjects).toEqual([{ coverage, pathname: '/about' }])
    // keeps a reference, so counters updated later in the test are sent
    expect(windowCoverageObjects[0].coverage).toBe(coverage)
  })

  it('ignores a window without coverage', () => {
    saveWindowCoverageObject(makeWindow('/'), windowCoverageObjects)

    expect(windowCoverageObjects).toEqual([])
  })

  it('ignores a missing window', () => {
    saveWindowCoverageObject(undefined, windowCoverageObjects)

    expect(windowCoverageObjects).toEqual([])
  })

  it('ignores a cross-origin window that throws on access', () => {
    const win = {
      get __coverage__() {
        throw new Error('Blocked a frame with origin')
      },
      location: { pathname: '/' }
    } as unknown as Window

    expect(() =>
      saveWindowCoverageObject(win, windowCoverageObjects)
    ).not.toThrow()
    expect(windowCoverageObjects).toEqual([])
  })

  it('saves coverage created after the first read, like a micro-frontend (#616)', () => {
    const win = makeWindow('/')

    // on "window:load" the lazy-loaded code has not created the coverage yet
    saveWindowCoverageObject(win, windowCoverageObjects)
    expect(windowCoverageObjects).toEqual([])

    // the micro-frontend loads during the test
    const coverage = { '/remote/b.js': { s: { 0: 1 } } }
    ;(win as unknown as { __coverage__: unknown }).__coverage__ = coverage

    // read again after the test
    saveWindowCoverageObject(win, windowCoverageObjects)
    expect(windowCoverageObjects).toEqual([{ coverage, pathname: '/' }])
  })

  it('does not save the same coverage object twice', () => {
    const win = makeWindow('/', { '/app/a.js': { s: { 0: 1 } } })

    saveWindowCoverageObject(win, windowCoverageObjects)
    saveWindowCoverageObject(win, windowCoverageObjects)
    saveWindowCoverageObject(win, windowCoverageObjects)

    expect(windowCoverageObjects).toHaveLength(1)
  })

  it('replaces an equal coverage object with the newer one after navigating back', () => {
    const oldCoverage = { '/app/a.js': { s: { 0: 0 } } }
    const newCoverage = { '/app/a.js': { s: { 0: 0 } } }

    saveWindowCoverageObject(
      makeWindow('/', oldCoverage),
      windowCoverageObjects
    )
    saveWindowCoverageObject(
      makeWindow('/', newCoverage),
      windowCoverageObjects
    )

    expect(windowCoverageObjects).toHaveLength(1)
    expect(windowCoverageObjects[0].coverage).toBe(newCoverage)
  })

  it('saves different coverage objects from different pages', () => {
    const home = { '/app/a.js': { s: { 0: 1 } } }
    const about = { '/app/b.js': { s: { 0: 1 } } }

    saveWindowCoverageObject(makeWindow('/', home), windowCoverageObjects)
    saveWindowCoverageObject(makeWindow('/about', about), windowCoverageObjects)

    expect(windowCoverageObjects).toEqual([
      { coverage: home, pathname: '/' },
      { coverage: about, pathname: '/about' }
    ])
  })
})
