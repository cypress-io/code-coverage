const browserify = require('@cypress/browserify-preprocessor')

// TODO check if there is .babelrc file
// if not, maybe create one?

// Tells Cypress to use .babelrc when bundling spec code
const options = browserify.defaultOptions
options.browserifyOptions.transform[1][1].babelrc = true
module.exports = browserify(options)
