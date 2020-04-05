const { join } = require('path')

const filename = process.argv[2]
if (!filename) {
  console.error('Usage: node %s <file name>', __filename)
  process.exit(1)
}
const coverageFilename = join(process.cwd(), '.nyc_output', 'out.json')
const coverage = require(coverageFilename)
const fileCoverageKey = Object.keys(coverage).find(name => {
  const fileCover = coverage[name]
  if (fileCover.path.endsWith(filename)) {
    return fileCover
  }
})

if (!fileCoverageKey) {
  console.error(
    'Could not find file %s in coverage in file %s',
    filename,
    coverageFilename
  )
  process.exit(1)
}

const fileCoverage = coverage[fileCoverageKey]
const statementCounters = fileCoverage.s
const isThereUncoveredStatement = Object.keys(statementCounters).some(
  (k, key) => {
    return statementCounters[key] === 0
  }
)
if (isThereUncoveredStatement) {
  console.error(
    'file %s has statements that were not covered by tests',
    fileCoverage.path
  )
  console.log('statement counters %o', statementCounters)

  process.exit(1)
}

console.log(
  'All statements in file %s (found for %s) were covered',
  fileCoverage.path,
  filename
)
