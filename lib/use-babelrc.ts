/// <reference types="node" />
/// <reference types="cypress" />
import webpackPreprocessor from '@cypress/webpack-preprocessor'

const defaults = webpackPreprocessor.defaultOptions
const webpackOptions = defaults.webpackOptions
const babelRule = webpackOptions?.module?.rules?.[0]
if (babelRule && typeof babelRule === 'object') {
  // Let the project's .babelrc handle TypeScript too, so unit tests that
  // import .ts sources get instrumented like .js ones
  babelRule.test = /\.[jt]sx?$/
  const babelLoader = Array.isArray(babelRule.use) ? babelRule.use[0] : null
  if (
    babelLoader &&
    typeof babelLoader === 'object' &&
    typeof babelLoader.options === 'object'
  ) {
    // remove presets so the babelrc file will be used
    delete babelLoader.options.presets
  }
}
if (webpackOptions) {
  webpackOptions.resolve = {
    ...webpackOptions.resolve,
    // webpack's defaults come first so existing imports resolve as before
    extensions: ['.js', '.json', '.wasm', '.jsx', '.ts', '.tsx']
  }
}
const preprocessor = webpackPreprocessor(defaults)
// Type assertion to avoid exposing private FileEvent type
export = preprocessor as (file: Cypress.FileObject) => string | Promise<string>
