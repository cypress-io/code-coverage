/**
 * @returns {boolean}
 */
function isCoverageEnabled() {
  return process.env.CYPRESS_COVERAGE
    ? String(process.env.CYPRESS_COVERAGE) !== 'false'
    : false
}

module.exports = {
  isCoverageEnabled
}
