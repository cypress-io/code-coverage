const { isCoverageEnabled } = require('./lib/common/isEnabled')

if (isCoverageEnabled()) {
  require('./lib/register/register-node')
}
