/// <reference types="node" />
import webpackPreprocessor from '@cypress/webpack-preprocessor'

const defaults = webpackPreprocessor.defaultOptions
// remove presets so the babelrc file will be used
delete defaults.webpackOptions.module.rules[0].use[0].options.presets
export default webpackPreprocessor(defaults)

