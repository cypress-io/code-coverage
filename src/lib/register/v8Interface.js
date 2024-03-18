const { session } = require('./register-node')
const { convertProfileCoverageToIstanbul } = require('../common/v8ToIstanbul')
const { debug } = require('../common/common-utils')

/**
 * @see https://github.com/bcoe/c8/issues/376
 * @see https://github.com/tapjs/processinfo/blob/33c72e547139630cde35a4126bb4575ad7157065/lib/register-coverage.cjs
 * @returns {Promise<import('istanbul-lib-coverage').CoverageMapData>}
 */
const takePreciseCoverage = async () => {
  return new Promise((resolve, reject) => {
    session.post('Profiler.takePreciseCoverage', async (err, cov) => {
      /* istanbul ignore next - something very strange and bad happened */
      if (err) {
        reject(err)
        return
      }
      const res = await convertProfileCoverageToIstanbul(cov)
      // debug('v8 coverage', cov, res)
      resolve(res)
    })
  })
}

/**
 * @returns  {Promise<null>}
 */
const stopPreciseCoverage = async () => {
  return new Promise((resolve, reject) => {
    session.post('Profiler.stopPreciseCoverage', async (err) => {
      /* istanbul ignore next - something very strange and bad happened */
      if (err) {
        reject(err)
        return
      }
      resolve(null)
    })
  })
}

module.exports = {
  takePreciseCoverage,
  stopPreciseCoverage
}
