// @ts-check
const fs = require('fs/promises')
const { fileURLToPath } = require('url')
const libCoverage = require('istanbul-lib-coverage')
const v8toIstanbul = require('v8-to-istanbul')
const { getSources } = require('./sourceMap')
const { debug } = require('./common-utils');

async function convertToIstanbul(obj, sourceMapCache = {}) {
  const file = fileURLToPath(obj.url)
  const sources = getSources(file, obj.url, sourceMapCache)
  const converter = v8toIstanbul(file, undefined, sources)
  await converter.load()
  converter.applyCoverage(obj.functions)
  const coverage = converter.toIstanbul()
  converter.destroy()
  return coverage
}

function exists(filename) {
  return fs
    .access(filename, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false)
}

/**
 * @see https://github.com/bcoe/c8/issues/376
 * @see https://github.com/tapjs/processinfo/blob/33c72e547139630cde35a4126bb4575ad7157065/lib/register-coverage.cjs
 */
async function convertProfileCoverageToIstanbul(cov) {
  const map = libCoverage.createCoverageMap()
  const sourceMapCache = (cov['source-map-cache'] = {})

  const coverages = await Promise.all(
    cov.result.map(async (obj) => {
      if (!/^file:/.test(obj.url)) {
        return false
      }
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
