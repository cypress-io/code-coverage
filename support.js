/// <reference types="cypress" />
const itsName = require('its-name')

let codeCoveragePerTest = new Map()
// let sources = new Map()

before(() => {
  // we need to reset the coverage when running
  // in the interactive mode, otherwise the counters will
  // keep increasing every time we rerun the tests
  const isInteractive = Cypress.config('isInteractive')

  cy.task('resetCoverage', { isInteractive })

  if (isInteractive) {
    codeCoveragePerTest = new Map()
  }
})

// use "function () {...}" callback to get "this" pointing
// at the right context
afterEach(function () {
  // save coverage after each test
  // because the entire "window" object is about
  // to be recycled by Cypress before next test
  cy.window().then(win => {
    if (win.__coverage__) {
      // only keep track of code coverage per test in the interactive mode
      if (Cypress.config('isInteractive')) {
        // testName will be an array of strings
        const testName = itsName(this.currentTest)
        console.log('test that finished', testName)

        codeCoveragePerTest[testName] = win.__coverage__
      }

      cy.task('combineCoverage', win.__coverage__)
    }
  })
})

after(() => {
  // when all tests finish, lets generate the coverage report
  cy.task('coverageReport')

  console.log(
    'after all tests finished, coverage per test is',
    codeCoveragePerTest
  )
})

const ws = new WebSocket('ws://localhost:8765')

beforeEach(() => {
  assert(ws.readyState === WebSocket.OPEN, 'Watch & Reload is ready')

  const onChangedApplicationFile = (filename, source, changedLines) => {
    console.log('file "%s" has changed', filename)
    // console.log('new source')
    // console.log(source)
    console.log('changed lines', changedLines)

    // find all tests that cover each changed line
    const testsToRun = []
    Object.entries(codeCoveragePerTest).forEach(([testName, coverage]) => {
      // console.log('test name', testName)
      // console.log('coverage', coverage)
      const fileCoverage = coverage[filename]
      if (!fileCoverage) {
        return
      }
      // note that statement map starts at line 1
      console.log(fileCoverage)
      const testCoversLine = Object.values(fileCoverage.statementMap).some(
        (s, k) => {
          if (!fileCoverage.s[k]) {
            return // the statement is NOT hit by the test
          }
          return changedLines.some(line => {
            return s.start.line === line + 1 && s.end.line === line + 1
          })
        }
      )
      if (testCoversLine) {
        console.log(
          'test',
          testName,
          'covers one of the changed lines',
          changedLines,
          'in file',
          filename
        )
        testsToRun.push(testName)
      }
    })

    if (testsToRun.length) {
      console.log('only running tests', testsToRun)
    }
  }

  const fn = Cypress._.debounce(onChangedApplicationFile, 2000)

  ws.onmessage = ev => {
    console.log('message from OS')
    console.log(ev)
    if (ev.type === 'message' && ev.data) {
      try {
        const data = JSON.parse(ev.data)
        if (data.command === 'changed' && data.filename && data.source) {
          fn(data.filename, data.source, data.changedLines)
          // window.top.document.querySelector('.reporter .restart').click()
        }
      } catch (e) {
        console.error('Could not parse message from plugin')
        console.error(e.message)
        console.error('original text')
        console.error(ev.data)
      }
    }
  }
})
