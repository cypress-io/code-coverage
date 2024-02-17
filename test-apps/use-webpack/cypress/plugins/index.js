/// <reference types="cypress" />
const webpack = require('@cypress/webpack-preprocessor')

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
  const options = {
    // use the same Webpack options to bundle spec files as your app does "normally"
    // which should instrument the spec files in this project
    webpackOptions: require('../../webpack.config'),
    watchOptions: {}
  }
  on('file:preprocessor', webpack(options))

  require('cypress-code-coverage-v8/task')(on, config)
  return config
}
