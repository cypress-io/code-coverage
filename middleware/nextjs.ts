/**
 * Middleware for returning server-side code coverage
 * for Next.js API route. To use, create new `pages/api/coverage.js` file
 * and re-export this default middleware function.
 *
  ```
  // in your pages/api/coverage.js
  module.exports = require('@cypress/code-coverage/middleware/nextjs')
  // then add an exposed config variable that points to the API to your cypress.json
  {
    "baseUrl": "http://localhost:3000",
    "expose": {
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

export default function returnCodeCoverageNext(req: any, res: any): void {
  // only GET is supported
  res.status(200).json({
    coverage: (global as typeof globalThis & { __coverage__?: unknown }).__coverage__ || null
  })
}

