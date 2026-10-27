// checks that "not-covered.js" is reported with real statements at 0%
// while the files loaded by the page stay at 100%
const summary = require('./coverage/coverage-summary.json')

const findFile = (name) => {
  const key = Object.keys(summary).find((filename) => filename.endsWith(name))
  if (!key) {
    console.error('Could not find %s in the coverage summary', name)
    process.exit(1)
  }
  return summary[key]
}

const notCovered = findFile('not-covered.js')
if (notCovered.lines.total === 0 || notCovered.lines.covered !== 0) {
  console.error('Expected not-covered.js to have lines at 0%')
  console.error(notCovered.lines)
  process.exit(1)
}
console.log('✅ not-covered.js has %d line(s) at 0%', notCovered.lines.total)

const main = findFile('main.js')
if (main.lines.pct !== 100) {
  console.error('Expected main.js lines at 100%')
  console.error(main.lines)
  process.exit(1)
}
console.log('✅ main.js is covered at 100%')

if (summary.total.lines.pct === 100) {
  console.error('Expected total lines coverage below 100%')
  process.exit(1)
}
console.log('✅ total lines coverage is %d%', summary.total.lines.pct)
