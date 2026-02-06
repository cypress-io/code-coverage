import { describe, it, expect, beforeAll } from 'vitest'
import istanbul from 'istanbul-lib-coverage'
import _ from 'lodash'
import coverage from './fixtures/coverage.json'
import {
  fileCoveragePlaceholder,
  removePlaceholders
} from '../common-utils.js'

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

  it('merges placeholders with full coverage', () => {
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
    // istanbul-lib-coverage now correctly merges placeholders with full coverage
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

