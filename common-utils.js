// @ts-check
function combineNycOptions({
  pkgNycOptions,
  nycrc,
  nycrcJson,
  defaultNycOptions
}) {
  // last option wins
  const nycOptions = Object.assign(
    {},
    defaultNycOptions,
    nycrc,
    nycrcJson,
    pkgNycOptions
  )

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
