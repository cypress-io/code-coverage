const { isCoverageEnabled } = require('../lib/common/isEnabled')

/**
 * Middleware for returning server-side code coverage
 * for Next.js API route. To use, create new `pages/api/coverage.js` file
 * and re-export this default middleware function.
 *
  ```
  // in your pages/api/coverage.js
  module.exports = require('cypress-code-coverage-v8/middleware/nextjs')
  
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
 * @see https://github.com/rohit-gohri/cypress-code-coverage-v8
 */
module.exports = async function returnCodeCoverageNext(req, res) {
  if (!isCoverageEnabled()) {
    res.status(200).json({
      coverage: null
    })
    return
  }

  const { getCoverage } = require('../lib/register/getCoverage')

  // only GET is supported
  res.status(200).json({
    coverage: (await getCoverage()) || null
  })
}
