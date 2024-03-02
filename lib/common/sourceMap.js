const { readFileSync } = require('fs')
const { findSourceMap } = require('module')

const lineLengths = (f) =>
  readFileSync(f, 'utf8')
    .split(/\n|\u2028|\u2029/)
    .map((l) => l.length)

function getSources(f, url, sourceMapCache = {}) {
  if (sourceMapCache[url]) {
    return sourceMapCache[url]
  }
  // see if it has a source map
  const s = findSourceMap(f)
  if (s) {
    const { payload } = s
    const sources = {}
    let sourceMapAndLineLengths = Object.assign(Object.create(null), {
      lineLengths: lineLengths(f),
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
  getSources,
}