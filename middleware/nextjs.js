// @ts-check
const { isCoverageEnabled } = require('../lib/common/isEnabled')

if (isCoverageEnabled()) {
  require('../lib/register/register-node')
}

/**
 * Middleware for returning server-side code coverage
 * for Next.js API route. To use, create new `pages/api/coverage.js` file
 * and re-export this default middleware function.
 *
 * @example in your pages/api/coverage.js
 * ```ts
 * module.exports = require('cypress-code-coverage-v8/middleware/nextjs')
 * ```
 * 
 * Then add to your cypress.json an environment variable pointing at the API
 * ```json
 * {
 *   "baseUrl": "http://localhost:3000",
 *   "env": {
 *     "codeCoverage": {
 *       "ssr": "/api/coverage"
 *     }
 *   }
 * }
 * ```
 *
 * @see https://nextjs.org/docs#api-routes
 * @see https://github.com/rohit-gohri/cypress-code-coverage-v8
 * 
 * @param {import('next').NextApiRequest} _req
 * @param {import('next').NextApiResponse} res
 */
module.exports = async function returnCodeCoverageNext(_req, res) {
  if (!isCoverageEnabled()) {
    res.status(200).json({
      coverage: null
    })
    return
  }

  const { takePreciseCoverage } = require('../lib/register/v8Interface')

  // only GET is supported
  res.status(200).json({
    coverage: (await takePreciseCoverage()) || null
  })
}
