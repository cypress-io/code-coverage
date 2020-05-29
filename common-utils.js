// @ts-check
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

module.exports = {
  combineNycOptions,
  defaultNycOptions
}
