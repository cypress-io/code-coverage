// With "instrumentUnloadedFiles", files that no test loads are instrumented
// at report time, so they count as 0% instead of being left out of the totals
const { join } = require('path')
const summary = require(
  join(__dirname, '..', 'coverage', 'coverage-summary.json')
)

const linesFor = (name) => {
  const key = Object.keys(summary).find((k) => k.endsWith(`/${name}`))
  if (!key) {
    throw new Error(`Could not find ${name} in the coverage summary`)
  }
  return summary[key].lines
}

const expectLines = (name, check, description) => {
  const lines = linesFor(name)
  if (!check(lines)) {
    console.error('lines for %s: %o', name, lines)
    throw new Error(`Expected ${name} to be ${description}`)
  }
  console.log('✅ %s is %s', name, description)
}

const fullyCovered = (lines) => lines.total > 0 && lines.pct === 100
const notCovered = (lines) => lines.total > 0 && lines.covered === 0

expectLines('main.js', fullyCovered, 'fully covered')
expectLines('second.js', fullyCovered, 'fully covered')
expectLines('not-covered.js', notCovered, 'at 0% with its lines counted')
expectLines('cypress.config.js', notCovered, 'at 0% with its lines counted')

if (summary.total.lines.pct >= 100) {
  console.error('total lines: %o', summary.total.lines)
  throw new Error('Expected the unloaded files to lower the total')
}
console.log('✅ total lines %d%%', summary.total.lines.pct)
