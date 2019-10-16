const browserify = require('@cypress/browserify-preprocessor')

const options = browserify.defaultOptions
// transform[1][1] is "babelify"
// so we just add our code instrumentation plugin to the list
options.browserifyOptions.transform[1][1].plugins.push('babel-plugin-istanbul')
module.exports = browserify(options)
