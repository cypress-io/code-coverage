// @ts-check
const { isCoverageEnabled } = require('../lib/common/isEnabled')

/**
 * for Express.js
 *
 * @example Use like
 * ```ts
 * const express = require('express')
 * const app = express()
 * // @see https://github.com/rohit-gohri/cypress-code-coverage-v8
 * require('cypress-code-coverage-v8/middleware/express')(app)
 * ```
 *
 * @param {import('express').Application} app
 */
module.exports = (app) => {
  // expose "GET __coverage__" endpoint that just returns
  // global coverage information (if the application has been instrumented)
  app.get('/__coverage__', async (req, res, next) => {
    if (!isCoverageEnabled()) {
      res.json({
        coverage: null
      })
      return
    }

    const { getCoverage } = require('../lib/register/getCoverage')

    try {
      res.json({
        coverage: (await getCoverage()) || null
      })
    } catch (error) {
      return next(error)
    }
  })
}
