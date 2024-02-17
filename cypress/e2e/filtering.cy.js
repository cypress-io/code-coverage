const { filterFilesFromCoverage } = require('../../lib/support/support-utils')

describe('minimatch', () => {
  it('string matches', () => {
    expect(
      Cypress.minimatch('/user/app/src/codeA.js', '/user/app/src/codeA.js'),
      'matches full strings'
    ).to.be.true

    expect(
      Cypress.minimatch('/user/app/src/codeA.js', 'codeA.js'),
      'does not match just the end'
    ).to.be.false

    expect(
      Cypress.minimatch('/user/app/src/codeA.js', '**/codeA.js'),
      'matches using **'
    ).to.be.true
  })
})

describe('filtering specs', () => {
  describe('using integrationFolder and testFiles in Cypress < v10', () => {
    let config
    let env
    let spec

    beforeEach(() => {
      config = cy.stub()
      config.withArgs('integrationFolder').returns('/user/app/cypress/integration')
      config
        .withArgs('supportFile')
        .returns('/user/app/cypress/support/index.js')
      config
        .withArgs('supportFolder')
        .returns('/user/app/cypress/support')

      env = cy.stub().returns({})

      spec = {
        absolute: '/user/app/cypress/integration/test.cy.js',
        relative: 'cypress/integration/test.cy.js'
      }
    })

    it('filters list of specs by single string', () => {
      config.withArgs('testFiles').returns('specA.js')
      const totalCoverage = {
        '/user/app/cypress/integration/specA.js': {},
        '/user/app/cypress/integration/specB.js': {}
      }
      const result = filterFilesFromCoverage(totalCoverage, config, env, spec)
      expect(result).to.deep.equal({
        '/user/app/cypress/integration/specB.js': {}
      })
    })

    it('filters list of specs by single string in array', () => {
      config.withArgs('testFiles').returns(['codeA.js'])
      const totalCoverage = {
        '/user/app/src/codeA.js': {},
        '/user/app/src/codeB.js': {}
      }
      const result = filterFilesFromCoverage(totalCoverage, config, env, spec)
      expect(result).to.deep.equal({
        '/user/app/src/codeB.js': {}
      })
    })

    it('filters list of specs by pattern', () => {
      config.withArgs('testFiles').returns(['**/*B.js'])

      const totalCoverage = {
        '/user/app/src/codeA.js': {},
        '/user/app/src/codeB.js': {}
      }
      const result = filterFilesFromCoverage(totalCoverage, config, env, spec)
      expect(result).to.deep.equal({
        '/user/app/src/codeA.js': {}
      })
    })

    it('filters list of specs by pattern and single spec', () => {
      config.withArgs('testFiles').returns(['**/*B.js', 'codeA.js'])

      const totalCoverage = {
        '/user/app/src/codeA.js': {},
        '/user/app/src/codeB.js': {}
      }
      const result = filterFilesFromCoverage(totalCoverage, config, env, spec)
      expect(result, 'all specs have been filtered out').to.deep.equal({})
    })

    it('filters specs from integration folder', () => {
      config.withArgs('testFiles').returns('**/*.*') // default pattern

      const totalCoverage = {
        '/user/app/src/codeA.js': {},
        '/user/app/src/codeB.js': {},
        // these files should be removed
        '/user/app/cypress/integration/spec1.js': {},
        '/user/app/cypress/integration/spec2.js': {}
      }
      const result = filterFilesFromCoverage(totalCoverage, config, env, spec)
      expect(result).to.deep.equal({
        '/user/app/src/codeA.js': {},
        '/user/app/src/codeB.js': {}
      })
    })

    it('filters list of specs when testFiles specifies folder', () => {
      config.withArgs('testFiles').returns(['cypress/integration/**.*'])

      const totalCoverage = {
        '/user/app/cypress/integration/specA.js': {},
        '/user/app/cypress/integration/specB.js': {},
        // This file should be included in coverage
        'src/my-code.js': {}
      }
      const result = filterFilesFromCoverage(totalCoverage, config, env, spec)
      expect(result).to.deep.equal({
        'src/my-code.js': {}
      })
    })

    it('filters files out of cypress support directory', () => {
      config.withArgs('testFiles').returns(['**/*.*']) // default pattern
      const totalCoverage = {
        '/user/app/cypress/support/index.js': {},
        '/user/app/cypress/support/command.js': {},
        '/user/app/cypress/integration/spec.js': {},
        // This file should be included in coverage
        'src/my-code.js': {}
      }
      const result = filterFilesFromCoverage(totalCoverage, config, env, spec)
      expect(result).to.deep.equal({
        'src/my-code.js': {}
      })
    })
  })

  describe('using codeCoverage.exclude and specPattern in Cypress >= v10', () => {
    let config
    let env
    let spec

    beforeEach(() => {
      config = cy.stub()

      env = cy.stub().returns({
        //filter out all files in the cypress folder
        codeCoverage: {
          exclude: 'cypress/**/*.*'
        }
      })

      spec = {
        absolute: '/user/app/cypress/integration/test.cy.js',
        relative: 'cypress/integration/test.cy.js'
      }
    })

    it('filters list of specs by single string', () => {
      config.withArgs('specPattern').returns('specA.cy.js')
      const totalCoverage = {
        '/user/app/src/specA.cy.js': {},
        '/user/app/src/specB.cy.js': {}
      }
      const result = filterFilesFromCoverage(totalCoverage, config, env, spec)
      expect(result).to.deep.equal({
        '/user/app/src/specB.cy.js': {}
      })
    })

    it('filters list of specs by single string in array', () => {
      config.withArgs('specPattern').returns(['specA.cy.js'])
      const totalCoverage = {
        '/user/app/src/specA.cy.js': {},
        '/user/app/src/specB.cy.js': {}
      }
      const result = filterFilesFromCoverage(totalCoverage, config, env, spec)
      expect(result).to.deep.equal({
        '/user/app/src/specB.cy.js': {}
      })
    })

    it('filters out file in codeCoverage.exclude', () => {
      config.withArgs('specPattern').returns(['**/*.cy.js'])
      const totalCoverage = {
        '/user/app/cypress/support/index.js': {},
        '/user/app/cypress/commands/index.js': {},
        //these files should be included
        '/user/app/src/codeA.js': {},
        '/user/app/src/codeB.js': {}
      }
      const result = filterFilesFromCoverage(totalCoverage, config, env, spec)
      expect(result).to.deep.equal({
        '/user/app/src/codeA.js': {},
        '/user/app/src/codeB.js': {}
      })
    })

    it('filters list of specs by pattern', () => {
      config.withArgs('specPattern').returns(['**/*B.js'])

      const totalCoverage = {
        '/user/app/src/codeA.js': {},
        '/user/app/src/codeB.js': {}
      }
      const result = filterFilesFromCoverage(totalCoverage, config, env, spec)
      expect(result).to.deep.equal({
        '/user/app/src/codeA.js': {}
      })
    })

    it('filters list of specs by pattern and single spec', () => {
      config.withArgs('specPattern').returns(['**/*B.js', 'codeA.js'])

      const totalCoverage = {
        '/user/app/src/codeA.js': {},
        '/user/app/src/codeB.js': {}
      }
      const result = filterFilesFromCoverage(totalCoverage, config, env, spec)
      expect(result, 'all specs have been filtered out').to.deep.equal({})
    })

    it('filters list of specs in integration folder', () => {
      config.withArgs('specPattern').returns('**/*.cy.{js,jsx,ts,tsx}') // default pattern

      const totalCoverage = {
        '/user/app/src/codeA.js': {},
        '/user/app/src/codeB.js': {},
        // these files should be removed
        '/user/app/cypress/integration/spec1.js': {},
        '/user/app/cypress/integration/spec2.js': {}
      }
      const result = filterFilesFromCoverage(totalCoverage, config, env, spec)
      expect(result).to.deep.equal({
        '/user/app/src/codeA.js': {},
        '/user/app/src/codeB.js': {}
      })
    })

    it('filters list of specs when specPattern specifies folder', () => {
      config.withArgs('specPattern').returns(['src/**/*.cy.js'])

      const totalCoverage = {
        '/user/app/src/specA.cy.js': {},
        '/user/app/src/specB.cy.js': {},
        // This file should be included in coverage
        'src/my-code.js': {}
      }
      const result = filterFilesFromCoverage(totalCoverage, config, env, spec)
      expect(result).to.deep.equal({
        'src/my-code.js': {}
      })
    })

    it('filters list of specs when exclude pattern is an array', () => {
      env = cy.stub().returns({
        //filter out a.js and b.js in cypress folder
        codeCoverage: {
          exclude: ['cypress/**/a.js', 'cypress/**/b.js']
        }
      })

      config.withArgs('specPattern').returns(['src/**/*.cy.js'])

      const totalCoverage = {
        '/user/app/cypress/a.js': {},
        '/user/app/cypress/b.js': {},
        // These files should be included in coverage
        '/user/app/cypress/c.js': {},
        'src/my-code.js': {}
      }
      const result = filterFilesFromCoverage(totalCoverage, config, env, spec)
      expect(result).to.deep.equal({
        '/user/app/cypress/c.js': {},
        'src/my-code.js': {}
      })
    })
  })
})
