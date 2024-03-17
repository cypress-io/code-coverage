const fs = require('fs/promises')
const { fileURLToPath } = require('url')
const libCoverage = require('istanbul-lib-coverage')
const v8toIstanbul = require('v8-to-istanbul')
const { getSources } = require('./sourceMap')
const { debug } = require('./common-utils');

/**
* @param {import('devtools-protocol').Protocol.Profiler.TakePreciseCoverageResponse['result'][number]} obj
 */
async function convertToIstanbul(obj, sourceMapCache = {}) {
  let filePath;
  let sources;
  if (/^file:/.test(obj.url)) {
  filePath = fileURLToPath(obj.url)
  sources = getSources(filePath, obj.url, sourceMapCache)
  }
  else if (/^https?:/.test(obj.url)) {

  }

  if (!filePath) {
    return null;
  }

  const converter = v8toIstanbul(filePath, undefined, sources)
  await converter.load()
  converter.applyCoverage(obj.functions)
  const coverage = converter.toIstanbul()
  converter.destroy()
  return coverage
}

/**
 * @param {string} filename 
 */
function exists(filename) {
  return fs
    .access(filename, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false)
}

/**
 * @see https://github.com/bcoe/c8/issues/376
 * @see https://github.com/tapjs/processinfo/blob/33c72e547139630cde35a4126bb4575ad7157065/lib/register-coverage.cjs
 * @param {Omit<import('devtools-protocol').Protocol.Profiler.TakePreciseCoverageResponse, 'timestamp'>} cov
 */
async function convertProfileCoverageToIstanbul(cov) {
  const map = libCoverage.createCoverageMap()
  // @ts-ignore
  const sourceMapCache = (cov['source-map-cache'] = {})

  const coverages = await Promise.all(
    cov.result.map(async (obj) => {
      if (!/^file:/.test(obj.url)) {
        if (obj.url.includes('/__cypress/') || obj.url.includes('/__/assets/')) {
          return false
        }
      }
      // TODO
      if (obj.url.includes('/node_modules/')) {
        return false
      }
      return convertToIstanbul(obj, sourceMapCache)
    })
  )

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
  convertToIstanbul,
  convertProfileCoverageToIstanbul
}
