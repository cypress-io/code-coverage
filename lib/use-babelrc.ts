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
  // remove presets so the babelrc file will be used
  // @ts-ignore - we know that the use property exists
  delete babelRule.use?.[0]?.options?.presets
}
if (webpackOptions) {
  webpackOptions.resolve = {
    ...webpackOptions.resolve,
    // webpack's defaults come first so existing imports resolve as before
    extensions: ['.js', '.json', '.wasm', '.jsx', '.ts', '.tsx']
  }
}
// @ts-ignore - we know that the use property exists
const preprocessor = webpackPreprocessor(defaults)
// Type assertion to avoid exposing private FileEvent type
export = preprocessor as (file: Cypress.FileObject) => string | Promise<string>
