const { isCoverageEnabled } = require('../lib/common/isEnabled')
const { debug } = require('../lib/common/common-utils')

/**
 * for Koa
 *
 * @example Use like
 *
 * ```ts
 * require('cypress-code-coverage-v8/dist/register');
 * const Koa = require('koa')
 * const app = new Koa();
 * // @see https://github.com/rohit-gohri/cypress-code-coverage-v8
 * require('cypress-code-coverage-v8/dist/middleware/koa')(app)
 * ```
 *
 * Then add to your cypress.json an environment variable pointing at the API
 * ```json
 * {
 *   "baseUrl": "http://localhost:3000",
 *   "env": {
 *     "codeCoverage": {
 *       "api": "http://localhost:4000/api/__coverage__"
 *     }
 *   }
 * }
 * ```
 *
 * @param {import('koa')} app
 */
module.exports = (app) => {
  if (!isCoverageEnabled()) {
    debug('skipping koa middleware, code coverage is not enabled')
    return
  }
  debug('adding koa middleware, code coverage is enabled')

  const { takePreciseCoverage } = require('../lib/register/v8Interface')
  // expose "GET __coverage__" endpoint that just returns
  // global coverage information (if the application has been instrumented)
  app.use(async (ctx, next) => {
    if (ctx.path !== '/__coverage__' && ctx.method !== 'GET') {
      return next()
    }

    debug('taking precise coverage')

    ctx.body = {
      coverage: (await takePreciseCoverage()) || null
    }
  })
}
