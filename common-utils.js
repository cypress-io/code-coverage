// @ts-check
function combineNycOptions(...options) {
  // last option wins
  const nycOptions = Object.assign({}, ...options)

  if (typeof nycOptions.reporter === 'string') {
    nycOptions.reporter = [nycOptions.reporter]
  }
  if (typeof nycOptions.extension === 'string') {
    nycOptions.extension = [nycOptions.extension]
  }

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
