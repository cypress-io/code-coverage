import { describe, it, expect, beforeAll } from 'vitest'
import _ from 'lodash'
import { createCoverageMap, CoverageMapData, FileCoverageData } from 'istanbul-lib-coverage'
import coverage from './__fixtures__/coverage.json'
import {
  fileCoveragePlaceholder,
  removePlaceholders,
  type FileCoveragePlaceholder
} from '../../lib/common-utils'


// CoverageMapData apparently has a getter that attempts to write to a property that only has a getter
// this getter is accessed during expect(), so we need to normalize the data to avoid it
function normalizeCoverageData(coverageData: CoverageMapData): CoverageMapData {
  return JSON.parse(JSON.stringify(coverageData))
}

describe('merging coverage', () => {
  const filename = '/src/index.js'
  const coverageFixture = coverage satisfies CoverageMapData

  beforeAll(() => {
    expect(coverageFixture).toHaveProperty(filename)
  })

  it('combines an empty coverage object', () => {
    const previous = createCoverageMap({})
    const coverageMap = createCoverageMap(previous)
    coverageMap.merge(coverageFixture)

    const mergedData = normalizeCoverageData(coverageMap.data)

    expect(mergedData).toEqual(coverageFixture)
  })

  it('combines the same full coverage twice', () => {
    const previous = createCoverageMap(_.cloneDeep(coverageFixture))
    const coverageMap = createCoverageMap(previous)
    coverageMap.merge(_.cloneDeep(coverageFixture))

    const merged = normalizeCoverageData(coverageMap.data)
    // it is almost the same - only the statement count has been doubled
    const expected = _.cloneDeep(coverageFixture)
    expected[filename].s[0] = 2
    expect(merged).toEqual(expected)
  })

  // This test is skipped in the vitest migration. It is testing internals
  // of nyc that have changed with nyc 17. This needs fixed before we can
  // finalize v4 of @cypress/code-coverage.
  it('does not merge correctly placeholders', () => {
    const coverageWithPlaceHolder = _.cloneDeep(coverageFixture)
    const placeholder = fileCoveragePlaceholder(filename)
    ;(coverageWithPlaceHolder as Record<string, FileCoveragePlaceholder | FileCoverageData>)[filename] = placeholder

    expect(coverageWithPlaceHolder).toEqual({
      [filename]: placeholder
    })

    // now lets merge full info
    const previous = createCoverageMap(coverageWithPlaceHolder)
    const coverageMap = createCoverageMap(previous)
    coverageMap.merge(coverageFixture)

    const merged = normalizeCoverageData(coverageMap.data)
    const expected = _.cloneDeep(coverageFixture)
    // the merge against the placeholder without valid statement map
    // has no hashes 
    delete (expected[filename] as any).hash
    delete (expected[filename] as any)._coverageSchema
    expect(merged).toEqual(expected)
  })

  it('removes placeholders', () => {
    const inputCoverage = _.cloneDeep(coverageFixture)
    removePlaceholders(inputCoverage)
    expect(inputCoverage).toEqual(coverageFixture)

    // add placeholder
    const placeholder = fileCoveragePlaceholder(filename)
    ;(inputCoverage as Record<string, FileCoveragePlaceholder | FileCoverageData>)[filename] = placeholder

    removePlaceholders(inputCoverage)
    expect(inputCoverage).toEqual({})
  })
})

