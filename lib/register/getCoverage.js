// @ts-check
const { readFileSync } = require('fs')
const { fileURLToPath } = require('url')
const { findSourceMap } = require('module')
const libCoverage = require('istanbul-lib-coverage')
const { session } = require('./register-node')
const { convertToIstanbul } = require('../common/v8ToIstanbul')

const lineLengths = (f) =>
  readFileSync(f, 'utf8')
    .split(/\n|\u2028|\u2029/)
    .map((l) => l.length)

/**
 * @see https://github.com/bcoe/c8/issues/376
 * @see https://github.com/tapjs/processinfo/blob/33c72e547139630cde35a4126bb4575ad7157065/lib/register-coverage.cjs
 */
const getCoverage = async () => {
  const map = libCoverage.createCoverageMap()

  await new Promise((resolve, reject) => {
    session.post('Profiler.takePreciseCoverage', async (er, cov) => {
      /* istanbul ignore next - something very strange and bad happened */
      if (er) {
        reject(er)
        return
      }
      const sourceMapCache = (cov['source-map-cache'] = {})
      await Promise.all(
        cov.result.map(async (obj) => {
          if (!/^file:/.test(obj.url)) {
            return false
          }
          if (obj.url.includes('/node_modules/')) {
            return false
          }

          const f = fileURLToPath(obj.url)
          if (!sourceMapCache[obj.url]) {
            // see if it has a source map
            const s = findSourceMap(f)
            if (s) {
              const { payload } = s
              sourceMapCache[obj.url] = Object.assign(Object.create(null), {
                lineLengths: lineLengths(f),
                data: payload
              })
            }
          }

          const sources = {}
          const sourceMapAndLineLengths = sourceMapCache[obj.url]
          if (sourceMapAndLineLengths) {
            // See: https://github.com/nodejs/node/pull/34305
            if (!sourceMapAndLineLengths.data) return
            sources.sourceMap = {
              sourcemap: sourceMapAndLineLengths.data
            }
            if (sourceMapAndLineLengths.lineLengths) {
              let source = ''
              sourceMapAndLineLengths.lineLengths.forEach((length) => {
                source += `${''.padEnd(length, '.')}\n`
              })
              sources.source = source
            }
          }
          map.merge(await convertToIstanbul(f, sources, obj.functions))
        })
      )
      resolve(null)
    })
  })

  return map.toJSON()
}

module.exports = {
  getCoverage
}
