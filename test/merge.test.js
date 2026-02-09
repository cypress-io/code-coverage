import { describe, it, expect, beforeAll } from 'vitest'
import _ from 'lodash'
const istanbul = require('istanbul-lib-coverage')
const coverage = require('../cypress/fixtures/coverage.json')
const {
  fileCoveragePlaceholder,
  removePlaceholders
} = require('../common-utils')

/**
 * Extracts just the data from the coverage map object
 * @param {*} cm
 */
const coverageMapToCoverage = (cm) => {
  return JSON.parse(JSON.stringify(cm))
}

describe('merging coverage', () => {
  const filename = '/src/index.js'

  beforeAll(() => {
    expect(coverage).toHaveProperty(filename)
  })

  it('combines an empty coverage object', () => {
    const previous = istanbul.createCoverageMap({})
    const coverageMap = istanbul.createCoverageMap(previous)
    coverageMap.merge(_.cloneDeep(coverage))

    const merged = coverageMapToCoverage(coverageMap)

    expect(merged).toEqual(coverage)
  })

  it('combines the same full coverage twice', () => {
    const previous = istanbul.createCoverageMap(_.cloneDeep(coverage))
    const coverageMap = istanbul.createCoverageMap(previous)
    coverageMap.merge(_.cloneDeep(coverage))

    const merged = coverageMapToCoverage(coverageMap)
    // it is almost the same - only the statement count has been doubled
    const expected = _.cloneDeep(coverage)
    expected[filename].s[0] = 2
    expect(merged).toEqual(expected)
  })

  // This test is skipped in the vitest migration. It is testing internals
  // of nyc that have changed with nyc 17. This needs fixed before we can
  // finalize v4 of @cypress/code-coverage.
  it.skip('does not merge correctly placeholders', () => {
    const coverageWithPlaceHolder = _.cloneDeep(coverage)
    const placeholder = fileCoveragePlaceholder(filename)
    coverageWithPlaceHolder[filename] = placeholder

    expect(coverageWithPlaceHolder).toEqual({
      [filename]: placeholder
    })

    // now lets merge full info
    const previous = istanbul.createCoverageMap(coverageWithPlaceHolder)
    const coverageMap = istanbul.createCoverageMap(previous)
    coverageMap.merge(coverage)

    const merged = coverageMapToCoverage(coverageMap)
    const expected = _.cloneDeep(coverage)
    // the merge against the placeholder without valid statement map
    // removes the statement map and sets the counter to null
    expected[filename].s = { 0: null }
    expected[filename].statementMap = {}
    // and no hashes :(
    delete expected[filename].hash
    delete expected[filename]._coverageSchema
    expect(merged).toEqual(expected)
  })

  it('removes placeholders', () => {
    const inputCoverage = _.cloneDeep(coverage)
    removePlaceholders(inputCoverage)
    expect(inputCoverage).toEqual(coverage)

    // add placeholder
    const placeholder = fileCoveragePlaceholder(filename)
    inputCoverage[filename] = placeholder

    removePlaceholders(inputCoverage)
    expect(inputCoverage).toEqual({})
  })
})

