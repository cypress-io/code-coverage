// using browserify
const browserify = require('@cypress/browserify-preprocessor')

module.exports = (on, config) => {
  require('../../../../task')(on, config)

  const options = browserify.defaultOptions
  // options.browserifyOptions.transform[1][1].babelrc = true
  options.browserifyOptions.extensions.push('.ts')
  // options.browserifyOptions.transform.push([
  //   require.resolve('browserify-istanbul'),
  //   {}
  // ])
  options.typescript = require.resolve('typescript')
  // on('file:preprocessor', require('../../../../use-babelrc'))
  console.log('browserify options')
  console.log(JSON.stringify(options, null, 2))

  on('file:preprocessor', browserify(options))
  return config
}

// using webpack
/// <reference types="cypress" />
// const webpack = require('@cypress/webpack-preprocessor')

// /**
//  * @type {Cypress.PluginConfig}
//  */
// module.exports = (on, config) => {
//   const options = {
//     // use the same Webpack options to bundle spec files as your app does "normally"
//     // which should instrument the spec files in this project
//     webpackOptions: require('../../webpack.config'),
//     watchOptions: {}
//   }
//   on('file:preprocessor', webpack(options))

//   require('../../../../task')(on, config)
//   return config
// }
