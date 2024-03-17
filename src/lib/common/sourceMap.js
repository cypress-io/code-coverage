const { readFileSync } = require('fs')
const { findSourceMap } = require('module')
const { debug } = require('./common-utils')

/**
 * @param {string} f
 */
const lineLengths = (f) =>
  readFileSync(f, 'utf8')
    .split(/\n|\u2028|\u2029/)
    .map((l) => l.length)

/**
 * @typedef {{
 *   source: string,
 *   originalSource?: string,
 *   sourceMap?: { sourcemap: import('module').SourceMapPayload },
 * }} SourceMap
 */

/**
 * @param {string} filePath
 * @param {string} url
 * @param {Record<string, SourceMap>} sourceMapCache
 * @returns
 */
function getSources(filePath, url, sourceMapCache = {}) {
  if (sourceMapCache[url]) {
    return sourceMapCache[url]
  }
  // debug(`SOURCE MAP: ${url}`)
  // see if it has a source map
  const s = findSourceMap(filePath)

  if (url.includes('.next/')) {
    console.warn(
      {
        s,
        f: filePath,
        url
      },
      'SOURCE MAP'
    )
  }
  if (s) {
    const { payload } = s
    /**
     * @type {SourceMap}
     */
    const sources = { source: '' }
    /**
     * @type {{data: import('module').SourceMapPayload, lineLengths: number[]}}
     */
    let sourceMapAndLineLengths = Object.assign(Object.create(null), {
      lineLengths: lineLengths(filePath),
      data: payload
    })

    // See: https://github.com/nodejs/node/pull/34305
    if (sourceMapAndLineLengths?.data) {
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
    sourceMapCache[url] = sources
    return sources
  }
}

module.exports = {
  getSources
}
