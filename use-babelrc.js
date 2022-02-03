const webpackPreprocessor = require('@cypress/webpack-preprocessor')
const defaults = webpackPreprocessor.defaultOptions
// remove presets so the babelrc file will be used
delete defaults.webpackOptions.module.rules[0].use[0].options.presets
module.exports = webpackPreprocessor(defaults)
