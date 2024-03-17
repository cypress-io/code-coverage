const { isCoverageEnabled } = require('../lib/common/isEnabled')
const { debug } = require('../lib/common/common-utils')

/**
 * for Express.js
 *
 * @example Use like
 * ```ts
 * require('cypress-code-coverage-v8/dist/register');
 * const express = require('express')
 * const app = express()
 * // @see https://github.com/rohit-gohri/cypress-code-coverage-v8
 * require('cypress-code-coverage-v8/dist/middleware/express')(app)
 * ```
 *
 * Then add to your cypress.json an environment variable pointing at the API
 * ```json
 * {
 *   "baseUrl": "http://localhost:3000",
 *   "env": {
 *     "codeCoverage": {
 *       "api": "http://localhost:4000/__coverage__"
 *     }
 *   }
 * }
 * ```
 *
 * @param {import('express').Application} app
 */
module.exports = (app) => {
  if (!isCoverageEnabled()) {
    debug('skipping express middleware, code coverage is not enabled')
    return
  }

  const { takePreciseCoverage } = require('../lib/register/v8Interface')

  // expose "GET __coverage__" endpoint that just returns
  // global coverage information (if the application has been instrumented)
  app.get('/__coverage__', async (req, res, next) => {
    try {
      res.json({
        coverage: (await takePreciseCoverage()) || null
      })
    } catch (error) {
      return next(error)
    }
  })
}
