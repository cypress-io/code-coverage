const fs = require('fs/promises')
const { readFileSync } = require('fs')
const { fileURLToPath } = require('url')
const { findSourceMap } = require('module')
const { debug, cacheDir, exists } = require('./common-utils')
const path = require('path')

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

// Matches only the last occurrence of sourceMappingURL
const innerRegex = /\s*[#@]\s*sourceMappingURL\s*=\s*([^\s'"]*)\s*/

const sourceMappingURLRegex = RegExp(
  '(?:' +
    '/\\*' +
    '(?:\\s*\r?\n(?://)?)?' +
    '(?:' +
    innerRegex.source +
    ')' +
    '\\s*' +
    '\\*/' +
    '|' +
    '//(?:' +
    innerRegex.source +
    ')' +
    ')' +
    '\\s*'
)

/**
 * @see https://github.com/webpack-contrib/source-map-loader/blob/996368547e47a1a840f0d348b556084eb8442301/src/utils.js#L77
 * @param {string} code
 */
function getSourceMappingURL(code) {
  const lines = code.split(/^/m)
  let match

  for (let i = lines.length - 1; i >= 0; i--) {
    match = lines[i].match(sourceMappingURLRegex)
    if (match) {
      break
    }
  }

  const sourceMappingURL = match ? match[1] || match[2] || '' : null

  return {
    sourceMappingURL: sourceMappingURL
      ? decodeURI(sourceMappingURL)
      : sourceMappingURL,
    replacementString: match ? match[0] : null
  }
}

/**
 * @param {string} url
 * @returns
 */
async function getContentFromUrl(url) {
  let code
  let filePath
  if (/^file:/.test(url)) {
    filePath = fileURLToPath(url)
    code = await (await fs.readFile(filePath)).toString('utf-8')
  } else if (/^https?:/.test(url)) {
    const parsedUrl = new URL(url)
    code = await (await fetch(url)).text()
    filePath = path.join(cacheDir, parsedUrl.pathname)
    await fs.writeFile(filePath, code)
  } else {
    return undefined
  }
  return { code, filePath }
}

const cwd = process.cwd()

/**
 * @param {string} url
 * @param {Record<string, string>} hostToProjectMap
 * @param {Record<string, {filePath: string, sources: SourceMap}>} sourceMapCache
 * @returns
 */
async function getSources(url, hostToProjectMap, sourceMapCache = {}) {
  if (sourceMapCache[url]) {
    return sourceMapCache[url]
  }
  let projectDir = cwd

  let filePath
  let code
  let sourceMap
  if (/^file:/.test(url)) {
    filePath = fileURLToPath(url)
    code = (await fs.readFile(filePath)).toString('utf-8')

    let { sourceMappingURL } = getSourceMappingURL(code)
    if (!sourceMappingURL) {
      return
    }
    sourceMappingURL = path.join(path.dirname(filePath), sourceMappingURL)
    sourceMap = JSON.parse(
      (await fs.readFile(sourceMappingURL)).toString('utf-8')
    )
  } else if (/^https?:/.test(url)) {
    code = await (await fetch(url)).text()
    const parsedUrl = new URL(url)

    projectDir =
      hostToProjectMap?.[parsedUrl.hostname] ??
      hostToProjectMap?.[parsedUrl.host] ??
      hostToProjectMap?.[parsedUrl.origin] ??
      projectDir

    filePath = path.resolve(
      path.join(cacheDir, parsedUrl.hostname, parsedUrl.pathname)
    )
    if (!(await exists(path.dirname(filePath)))) {
      await fs.mkdir(path.dirname(filePath), { recursive: true })
    }
    await fs.writeFile(filePath, code)

    let { sourceMappingURL } = getSourceMappingURL(code)
    if (!sourceMappingURL) {
      return
    }
    if (!sourceMappingURL.startsWith('http')) {
      sourceMappingURL = new URL(sourceMappingURL, parsedUrl).href
    }
    const sourceMapString = await (await fetch(sourceMappingURL)).text()
    sourceMap = JSON.parse(sourceMapString)

    await fs.writeFile(`${filePath}.map`, sourceMapString)
  } else {
    return undefined
  }
  const fileLineLengths = lineLengths(filePath)
  /**
   * @type {import('module').SourceMapPayload}
   */
  const sourcemap = Object.assign(Object.create(null), {
    ...sourceMap
  })

  let modified = false

  Object.assign(sourcemap, {
    sources: sourceMap.sources.map((sourceFile) => {
      if (sourceFile.startsWith('webpack://')) {
        // example: 'webpack://@pepper/order-management/./src/pages/index.page.tsx'
        const res = sourceFile.replace(
          /^webpack:\/\/[^.]+\/\./,
          `${projectDir}/.`
        )
        if (res !== sourceFile) {
          modified = true
          return res
        }
      }
      return sourceFile
    })
  })

  let source = ''
  if (fileLineLengths) {
    fileLineLengths.forEach((length) => {
      source += `${''.padEnd(length, '.')}\n`
    })
  }
  /**
   * @type {SourceMap}
   */
  const sources = {
    sourceMap: {
      sourcemap: sourceMap
    },
    source
  }

  sourceMapCache[url] = { filePath, sources }
  return { filePath, sources }
}

module.exports = {
  getSources
}
