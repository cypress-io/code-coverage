/// <reference types="node" />
/// <reference types="cypress" />
import webpackPreprocessor from '@cypress/webpack-preprocessor'

const defaults = webpackPreprocessor.defaultOptions
// remove presets so the babelrc file will be used
// @ts-ignore - we know that the use property exists
if (defaults.webpackOptions?.module?.rules?.[0]?.use?.[0]?.options?.presets) {
  // @ts-ignore - we know that the use property exists
  delete defaults.webpackOptions.module.rules[0].use[0].options.presets
}
// @ts-ignore - we know that the use property exists
const preprocessor = webpackPreprocessor(defaults)
// Type assertion to avoid exposing private FileEvent type
export = preprocessor as (file: Cypress.FileObject) => string | Promise<string>
