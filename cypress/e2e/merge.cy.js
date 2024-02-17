/// <reference types="Cypress" />
const istanbul = require('istanbul-lib-coverage')
const coverage = require('../fixtures/coverage.json')
const {
  fileCoveragePlaceholder,
  removePlaceholders
} = require('../../lib/common/common-utils')

/**
 * Extracts just the data from the coverage map object
 * @param {*} cm
 */
const coverageMapToCoverage = (cm) => {
  return JSON.parse(JSON.stringify(cm))
}

describe('merging coverage', () => {
  const filename = '/src/index.js'

  before(() => {
    expect(coverage, 'initial coverage has this file').to.have.property(
      filename
    )
  })

  it('combines an empty coverage object', () => {
    const previous = istanbul.createCoverageMap({})
    const coverageMap = istanbul.createCoverageMap(previous)
    coverageMap.merge(Cypress._.cloneDeep(coverage))

    const merged = coverageMapToCoverage(coverageMap)

    expect(merged, 'merged coverage').to.deep.equal(coverage)
  })

  it('combines the same full coverage twice', () => {
    const previous = istanbul.createCoverageMap(Cypress._.cloneDeep(coverage))
    const coverageMap = istanbul.createCoverageMap(previous)
    coverageMap.merge(Cypress._.cloneDeep(coverage))

    const merged = coverageMapToCoverage(coverageMap)
    // it is almost the same - only the statement count has been doubled
    const expected = Cypress._.cloneDeep(coverage)
    expected[filename].s[0] = 2
    expect(merged, 'merged coverage').to.deep.equal(expected)
  })

  it('does not merge correctly placeholders', () => {
    const coverageWithPlaceHolder = Cypress._.cloneDeep(coverage)
    const placeholder = fileCoveragePlaceholder(filename)
    coverageWithPlaceHolder[filename] = placeholder

    expect(coverageWithPlaceHolder, 'placeholder').to.deep.equal({
      [filename]: placeholder
    })

    // now lets merge full info
    const previous = istanbul.createCoverageMap(coverageWithPlaceHolder)
    const coverageMap = istanbul.createCoverageMap(previous)
    coverageMap.merge(coverage)

    const merged = coverageMapToCoverage(coverageMap)
    const expected = Cypress._.cloneDeep(coverage)
    // the merge against the placeholder without valid statement map
    // removes the statement map and sets the counter to null
    expected[filename].s = { 0: null }
    expected[filename].statementMap = {}
    // and no hashes :(
    delete expected[filename].hash
    delete expected[filename]._coverageSchema
    expect(merged).to.deep.equal(expected)
  })

  it('removes placeholders', () => {
    const inputCoverage = Cypress._.cloneDeep(coverage)
    removePlaceholders(inputCoverage)
    expect(inputCoverage, 'nothing to remove').to.deep.equal(coverage)

    // add placeholder
    const placeholder = fileCoveragePlaceholder(filename)
    inputCoverage[filename] = placeholder

    removePlaceholders(inputCoverage)
    expect(inputCoverage, 'the placeholder has been removed').to.deep.equal({})
  })
})
