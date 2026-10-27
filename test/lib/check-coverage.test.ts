import { describe, it, expect } from 'vitest'
import { createCoverageMap } from 'istanbul-lib-coverage'
import {
  checkCoverageThresholds,
  getCoverageThresholds
} from '../../lib/task-utils'
import partialCoverage from './__fixtures__/partial-coverage.json'

// one file fully covered, one file not covered at all: 50% overall
const coverageMap = () => createCoverageMap(partialCoverage)

describe('getCoverageThresholds', () => {
  it('uses the nyc defaults', () => {
    expect(getCoverageThresholds({})).toEqual({
      lines: 90,
      functions: 0,
      branches: 0,
      statements: 0
    })
  })

  it('reads thresholds from NYC options', () => {
    expect(
      getCoverageThresholds({ lines: 80, functions: '70', branches: 60 })
    ).toEqual({
      lines: 80,
      functions: 70,
      branches: 60,
      statements: 0
    })
  })

  it('rejects a threshold that is not a number', () => {
    expect(() => getCoverageThresholds({ lines: '80%' })).toThrow(
      'Expected NYC option "lines" to be a number, got "80%"'
    )
  })
})

describe('checkCoverageThresholds', () => {
  it('returns no errors when coverage meets the thresholds', () => {
    const errors = checkCoverageThresholds(coverageMap(), {
      lines: 50,
      functions: 50,
      statements: 50
    })
    expect(errors).toEqual([])
  })

  it('reports each global threshold that is not met', () => {
    const errors = checkCoverageThresholds(coverageMap(), {
      lines: 100,
      functions: 80,
      branches: 100,
      statements: 40
    })
    expect(errors).toEqual([
      'Coverage for lines (50%) does not meet global threshold (100%)',
      'Coverage for functions (50%) does not meet global threshold (80%)'
    ])
  })

  it('applies the default 90% line threshold', () => {
    const errors = checkCoverageThresholds(coverageMap(), {})
    expect(errors).toEqual([
      'Coverage for lines (50%) does not meet global threshold (90%)'
    ])
  })

  it('checks each file with "per-file"', () => {
    const errors = checkCoverageThresholds(coverageMap(), {
      'per-file': true,
      lines: 50
    })
    expect(errors).toEqual([
      'Coverage for lines (0%) does not meet threshold (50%) for /src/uncovered.js'
    ])
  })
})
