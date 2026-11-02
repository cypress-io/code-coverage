// Fails if the merged coverage mixes path separator styles, which happens on
// Windows when placeholder entries don't match the instrumented ones (#360).
// `check-coverage` and `only-covered` match by file name, so they can't catch it.
const { readFileSync } = require('fs')
const { join } = require('path')

const coverage = JSON.parse(
  readFileSync(join(__dirname, '..', '.nyc_output', 'out.json'), 'utf8')
)

const paths = [
  ...new Set(
    Object.entries(coverage).flatMap(([key, entry]) => [key, entry.path])
  )
]
const withBackslashes = paths.filter((p) => p.includes('\\'))
const withoutBackslashes = paths.filter((p) => !p.includes('\\'))

if (withBackslashes.length && withoutBackslashes.length) {
  console.error('❌ Coverage mixes path separators')
  console.error('With backslashes:\n  ' + withBackslashes.join('\n  '))
  console.error('Without backslashes:\n  ' + withoutBackslashes.join('\n  '))
  process.exit(1)
}

console.log(
  '✅ All %d coverage paths use the same separator style',
  paths.length
)
