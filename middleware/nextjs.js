/**
 * Middleware for returning server-side code coverage
 * for Next.js API route. To use, create new `pages/api/coverage.js` file
 * and re-export this default middleware function.
 *
  ```
  // in your pages/api/coverage.js
  module.exports = require('@cypress/code-coverage/middleware/nextjs')
  // then add to your cypress.json an environment variable pointing at the API
  {
    "baseUrl": "http://localhost:3000",
    "env": {
      "codeCoverage": {
        "url": "/api/coverage"
      }
    }
  }
  ```
 *
 * @see https://nextjs.org/docs#api-routes
 * @see https://github.com/cypress-io/code-coverage
 */
module.exports = function returnCodeCoverageNext (req, res) {
  // only GET is supported
  res.status(200).json({
    coverage: global.__coverage__ || null
  })
}
