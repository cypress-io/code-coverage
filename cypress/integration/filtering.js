const { filterSpecsFromCoverage } = require('../../support-utils')

describe('minimatch', () => {
  it('string matches', () => {
    expect(
      Cypress.minimatch('/path/to/specA.js', '/path/to/specA.js'),
      'matches full strings'
    ).to.be.true

    expect(
      Cypress.minimatch('/path/to/specA.js', 'specA.js'),
      'does not match just the end'
    ).to.be.false

    expect(
      Cypress.minimatch('/path/to/specA.js', '**/specA.js'),
      'matches using **'
    ).to.be.true
  })
})

describe('filtering specs', () => {
  it('filters list of specs by single string', () => {
    const config = cy.stub()
    config.withArgs('testFiles').returns(['specA.js'])
    config.withArgs('integrationFolder').returns('/path/to/integration/')

    const totalCoverage = {
      '/path/to/specA.js': {},
      '/path/to/specB.js': {}
    }
    const result = filterSpecsFromCoverage(totalCoverage, config)
    expect(result).to.deep.equal({
      '/path/to/specB.js': {}
    })
  })

  it('filters list of specs by pattern', () => {
    const config = cy.stub()
    config.withArgs('testFiles').returns(['**/*B.js'])
    config.withArgs('integrationFolder').returns('/path/to/integration/')

    const totalCoverage = {
      '/path/to/specA.js': {},
      '/path/to/specB.js': {}
    }
    const result = filterSpecsFromCoverage(totalCoverage, config)
    expect(result).to.deep.equal({
      '/path/to/specA.js': {}
    })
  })

  it('filters list of specs by pattern and single spec', () => {
    const config = cy.stub()
    config.withArgs('testFiles').returns(['**/*B.js', 'specA.js'])
    config.withArgs('integrationFolder').returns('/path/to/integration/')

    const totalCoverage = {
      '/path/to/specA.js': {},
      '/path/to/specB.js': {}
    }
    const result = filterSpecsFromCoverage(totalCoverage, config)
    expect(result, 'all specs have been filtered out').to.deep.equal({})
  })

  it('filters list of specs in integration folder', () => {
    const config = cy.stub()
    config.withArgs('testFiles').returns('**/*.*') // default pattern
    config.withArgs('integrationFolder').returns('/path/to/integration/')

    const totalCoverage = {
      '/path/to/specA.js': {},
      '/path/to/specB.js': {},
      // these files should be removed
      '/path/to/integration/spec1.js': {},
      '/path/to/integration/spec2.js': {}
    }
    const result = filterSpecsFromCoverage(totalCoverage, config)
    expect(result).to.deep.equal({
      '/path/to/specA.js': {},
      '/path/to/specB.js': {}
    })
  })
})
