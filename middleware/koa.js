// @ts-check
const { isCoverageEnabled } = require('../lib/common/isEnabled')

/**
 * for Express.js
 *
 * @example Use like
 * ```ts
 * require('cypress-code-coverage-v8/register');
 * const Koa = require('koa')
 * const app = new Koa();
 * // @see https://github.com/rohit-gohri/cypress-code-coverage-v8
 * require('cypress-code-coverage-v8/middleware/koa')(app)
 * ```
 *
 * @param {import('koa')} app
 */
module.exports = (app) => {
  // expose "GET __coverage__" endpoint that just returns
  // global coverage information (if the application has been instrumented)
  app.use(async (ctx, next) => {
    if (ctx.path !== '/__coverage__' && ctx.method !== 'GET') {
      return next()
    }

    if (!isCoverageEnabled()) {
      ctx.body = {
        coverage: null
      }
      return
    }

    const { getCoverage } = require('../lib/register/getCoverage')
    ctx.body = {
      coverage: (await getCoverage()) || null
    }
  })
}
