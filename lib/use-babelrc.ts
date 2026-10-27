/// <reference types="node" />
/// <reference types="cypress" />
import type webpackPreprocessorType from '@cypress/webpack-preprocessor'

// @cypress/webpack-preprocessor and its Babel / webpack peers are optional
// peer dependencies, only needed by this entry point
let webpackPreprocessor: typeof webpackPreprocessorType
try {
  webpackPreprocessor = require('@cypress/webpack-preprocessor')
} catch (err) {
  if ((err as NodeJS.ErrnoException)?.code === 'MODULE_NOT_FOUND') {
    throw new Error(
      '@cypress/code-coverage/use-babelrc requires @cypress/webpack-preprocessor and its peer dependencies. ' +
        'Install them with: npm install -D @cypress/webpack-preprocessor @babel/core@7 @babel/preset-env@7 babel-loader webpack\n\n' +
        (err as Error).message
    )
  }
  throw err
}

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
