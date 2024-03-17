/**
 * @see https://github.com/bcoe/c8/issues/376
 * @see https://github.com/tapjs/processinfo/blob/33c72e547139630cde35a4126bb4575ad7157065/lib/register-coverage.cjs
 */
process.setSourceMapsEnabled(true)
const inspector = require('inspector')
const session = new inspector.Session()
session.connect()
session.post('Profiler.enable')
session.post('Runtime.enable')
session.post('Profiler.startPreciseCoverage', {
  callCount: true,
  detailed: true
})

module.exports = {
  session
}
