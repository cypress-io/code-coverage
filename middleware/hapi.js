// @ts-check
const { isCoverageEnabled } = require('../lib/common/isEnabled')

/**
 * for Hapi.js
 *
 *  * @example Use like
 * ```ts
 * const Hapi = require('@hapi/hapi');
 * const coverageRoutes = require('cypress-code-coverage-v8/middleware/hapi');
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
 * @param {import('@hapi/hapi').Server} server
 */
module.exports = (server) => {
  // expose "GET __coverage__" endpoint that just returns
  // global coverage information (if the application has been instrumented)

  // https://hapijs.com/tutorials/routing?lang=en_US
  server.route({
    method: 'GET',
    path: '/__coverage__',
    async handler() {
      if (!isCoverageEnabled()) {
        return {
          coverage: null
        }
      }

      const { getCoverage } = require('../lib/register/getCoverage')

      return { coverage: (await getCoverage()) || null }
    }
  })
}
