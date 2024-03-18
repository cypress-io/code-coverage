const fs = require('fs/promises')
const path = require('path')
const debug = require('debug')('code-coverage')

const cacheDir = path.join(__dirname, '..', '..', '..', '.cache')

/**
 * @param {string} filename
 */
function exists(filename) {
  return fs
    .access(filename, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false)
}

function stringToArray(prop, obj) {
  if (typeof obj[prop] === 'string') {
    obj[prop] = [obj[prop]]
  }

  return obj
}

function combineNycOptions(...options) {
  // last option wins
  const nycOptions = Object.assign({}, ...options)

  // normalize string and [string] props
  stringToArray('reporter', nycOptions)
  stringToArray('extension', nycOptions)
  stringToArray('exclude', nycOptions)

  return nycOptions
}

const defaultNycOptions = {
  'report-dir': './coverage',
  reporter: ['lcov', 'clover', 'json', 'json-summary'],
  extension: ['.js', '.cjs', '.mjs', '.ts', '.tsx', '.jsx'],
  excludeAfterRemap: false
}

/**
 * Returns an object with placeholder properties for files we
 * do not have coverage yet. The result can go into the coverage object
 *
 * @param {string} fullPath Filename
 */
const fileCoveragePlaceholder = (fullPath) => {
  return {
    path: fullPath,
    statementMap: {},
    fnMap: {},
    branchMap: {},
    s: {},
    f: {},
    b: {}
  }
}

const keys = ['statementMap', 'fnMap', 'branchMap', 's', 'f', 'b']
const isPlaceholder = (entry) => {
  return keys.every((key) => {
    return !(key in entry) || Object.keys(entry[key]).length === 0
  })
}

/**
 * Given a coverage object with potential placeholder entries
 * inserted instead of covered files, removes them. Modifies the object in place
 */
const removePlaceholders = (coverage) => {
  Object.keys(coverage).forEach((key) => {
    if (isPlaceholder(coverage[key])) {
      delete coverage[key]
    }
  })
}

module.exports = {
  debug,
  cacheDir,
  exists,
  combineNycOptions,
  defaultNycOptions,
  fileCoveragePlaceholder,
  removePlaceholders
}
