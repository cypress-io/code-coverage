const { isCoverageEnabled } = require('../lib/common/isEnabled')

if (isCoverageEnabled()) {
  require('../lib/register/register-node')
}

/**
 * Middleware for returning server-side code coverage
 * for Next.js API route. To use, create new `pages/api/coverage.js` file
 * and re-export this default middleware function.
 *
 * @example in your pages/api/__coverage__.js
 * ```ts
 * import coverageHandler from 'cypress-code-coverage-v8/dist/middleware/nextjs';
 * export default coverageHandler;
 * ```
 *
 * Then add to your cypress.json an environment variable pointing at the API
 * ```json
 * {
 *   "baseUrl": "http://localhost:3000",
 *   "env": {
 *     "codeCoverage": {
 *       "ssr": "/api/__coverage__"
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
  const coverage = await takePreciseCoverage()

  if (!coverage) {
    // only GET is supported
    res.status(200).json({
      coverage: null
    })
  } else {
    // TODO: Convert webpack paths to files, convert package alias to file path
    // example:
    res.status(200).json({
      coverage
    })
  }
}
