function isCoverageEnabled() {
  return (
    process.env.CYPRESS_COVERAGE &&
    String(process.env.CYPRESS_COVERAGE) !== 'false'
  )
}

module.exports = {
  isCoverageEnabled
}
