const { join } = require('path')
const _ = require('lodash')

const filenames = process.argv.slice(2)
if (!filenames.length) {
  console.error('Usage: node %s <file name 1> <file name 2>', __filename)
  process.exit(1)
}

const shouldBeCovered = filepath =>
  filenames.some(name => filepath.endsWith(name))

const coverageFilename = join(process.cwd(), '.nyc_output', 'out.json')
const coverage = require(coverageFilename)

const coveredFilepaths = Object.keys(coverage).map(name => coverage[name].path)

// console.log(coveredFilepaths)

const [covered, extraCoveredFiles] = _.partition(
  coveredFilepaths,
  shouldBeCovered
)

if (extraCoveredFiles.length) {
  console.error('Error: found extra covered files 🔥')
  console.error('Expected the following files in coverage results')
  console.error(filenames.join('\n'))
  console.error('extra files covered 🔥')
  console.error(extraCoveredFiles.join('\n'))
  process.exit(1)
}

if (covered.length < filenames.length) {
  console.error('Error: expected all files from the list to be covered 🔥')
  console.error('Expected the following files in coverage results')
  console.error(filenames.join('\n'))
  console.error('But found only these files to be covered')
  console.error(covered.join('\n'))

  console.error('Files missing from the coverage 🔥')
  const missingFiles = filenames.filter(
    filename =>
      !covered.some(coveredFilename => coveredFilename.endsWith(filename))
  )
  console.error(missingFiles.join('\n'))

  process.exit(1)
}
