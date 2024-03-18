const fs = require('fs/promises')
const libCoverage = require('istanbul-lib-coverage')
const v8toIstanbul = require('v8-to-istanbul')
const { getSources } = require('./sourceMap')
const { debug, exists, cacheDir } = require('./common-utils')

/**
 * @param {import('devtools-protocol').Protocol.Profiler.TakePreciseCoverageResponse['result'][number]} obj
 */
async function convertToIstanbul(obj, hostToProjectMap, sourceMapCache = {}) {
  let res = await getSources(obj.url, hostToProjectMap, sourceMapCache)
  if (!res) {
    return null
  }
  const { filePath, sources } = res
  const converter = v8toIstanbul(filePath, undefined, sources, (path) => {
    if (
      path.includes('/node_modules/') ||
      path.includes('/__cypress/') ||
      path.includes('/__/assets/')
    ) {
      return true
    }
    return false
  })
  await converter.load()
  converter.applyCoverage(obj.functions)
  const coverage = converter.toIstanbul()
  converter.destroy()
  return coverage
}

/**
 * @see https://github.com/bcoe/c8/issues/376
 * @see https://github.com/tapjs/processinfo/blob/33c72e547139630cde35a4126bb4575ad7157065/lib/register-coverage.cjs
 * @param {Omit<import('devtools-protocol').Protocol.Profiler.TakePreciseCoverageResponse, 'timestamp'>} cov
 * @param {Record<string, string>} hostToProjectMap
 */
async function convertProfileCoverageToIstanbul(cov, hostToProjectMap = {}) {
  // @ts-ignore
  const sourceMapCache = (cov['source-map-cache'] = {})

  if (!(await exists(cacheDir))) {
    await fs.mkdir(cacheDir, { recursive: true })
  }

  const coverages = await Promise.all(
    cov.result.map(async (obj) => {
      if (!/^file:/.test(obj.url) && !/^https?:/.test(obj.url)) {
        return null
      }
      if (
        obj.url.includes('/node_modules/') ||
        obj.url.includes('/__cypress/') ||
        obj.url.includes('/__/assets/')
      ) {
        return null
      }
      return convertToIstanbul(obj, hostToProjectMap, sourceMapCache).catch(
        (err) => {
          console.error(err, `could not convert to istanbul - ${obj.url}`)
          return null
        }
      )
    })
  )

  const map = libCoverage.createCoverageMap()
  coverages.reduce((_, coverage) => {
    if (coverage) {
      map.merge(coverage)
    }
    return null
  }, null)

  const result = map.toJSON()
  // if (filename) {
  //   await fs.writeFile(filename, JSON.stringify(result, null, 2), 'utf8')
  // }
  return result
}

module.exports = {
  convertProfileCoverageToIstanbul
}
