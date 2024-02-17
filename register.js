const { isCoverageEnabled } = require('./lib/isEnabled');

if (isCoverageEnabled()) {
  require('./lib/register-node')
}
