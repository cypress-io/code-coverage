/// <reference types="cypress" />

// With expectBackendCoverageOnly, skipping the backend request throws, which
// proves the after hook took the skip branch rather than requesting a page
// that happened to have no coverage
Cypress.expose('codeCoverage', {
  ...Cypress.expose('codeCoverage'),
  expectBackendCoverageOnly: true
})

let skippedBackendCoverage = false
Cypress.on('fail', (err) => {
  if (
    err.message.includes(
      'Expected to collect backend code coverage from /__coverage__, but there is no `baseUrl` or visited page'
    )
  ) {
    skippedBackendCoverage = true
    return
  }
  throw err
})

// Registered after the plugin's hooks, so it runs once they have finished
after(() => {
  expect(skippedBackendCoverage, 'skipped backend coverage').to.be.true
})

it('visits the app', () => {
  cy.visit('http://localhost:1234')
  cy.window().invoke('add', 2, 3).should('equal', 5)
})

it('does not visit the app', () => {
  expect(true).to.be.true
})
