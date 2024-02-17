// @ts-check
const v8toIstanbul = require('v8-to-istanbul')

async function convertToIstanbul(file, sources, functions) {
  const converter = v8toIstanbul(file, undefined, sources)
  await converter.load()
  converter.applyCoverage(functions)
  const coverage = converter.toIstanbul()
  converter.destroy()
  return coverage
}

module.exports = {
  convertToIstanbul
}
