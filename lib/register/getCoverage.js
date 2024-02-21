// @ts-check
const { session } = require('./register-node')
const { convertProfileCoverageToIstanbul } = require('../common/v8ToIstanbul')

/**
 * @see https://github.com/bcoe/c8/issues/376
 * @see https://github.com/tapjs/processinfo/blob/33c72e547139630cde35a4126bb4575ad7157065/lib/register-coverage.cjs
 */
const getCoverage = async () => {
  return new Promise((resolve, reject) => {
    session.post('Profiler.takePreciseCoverage', async (er, cov) => {
      /* istanbul ignore next - something very strange and bad happened */
      if (er) {
        reject(er)
        return
      }

      resolve(convertProfileCoverageToIstanbul(cov))
    })
  })
}

module.exports = {
  getCoverage
}
