const { isCoverageEnabled } = require('../lib/common/isEnabled')
const { debug } = require('../lib/common/common-utils')

/**
 * for Hapi.js
 *
 *  * @example Use like
 * ```ts
 * require('cypress-code-coverage-v8/dist/register');
 * const Hapi = require('@hapi/hapi');
 * const coverageRoutes = require('cypress-code-coverage-v8/dist/middleware/hapi');
 *
 * const init = async () => {
 *   const server = Hapi.server({
 *     port: 3000,
 *     host: 'localhost'
 *   });
 *
 *   // @see https://github.com/rohit-gohri/cypress-code-coverage-v8
 *   coverageRoutes(server);
 *
 *   await server.start();
 *   console.log('Server running on %s', server.info.uri);
 * };
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
 * @param {import('@hapi/hapi').Server} server
 */
module.exports = (server) => {
  if (!isCoverageEnabled()) {
    debug('skipping hapi middleware, code coverage is not enabled')
    return
  }

  const { takePreciseCoverage } = require('../lib/register/v8Interface')

  // expose "GET __coverage__" endpoint that just returns
  // global coverage information (if the application has been instrumented)

  // https://hapijs.com/tutorials/routing?lang=en_US
  server.route({
    method: 'GET',
    path: '/__coverage__',
    async handler() {
      return { coverage: (await takePreciseCoverage()) || null }
    }
  })
}
