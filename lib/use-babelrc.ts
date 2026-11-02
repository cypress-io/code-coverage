/// <reference types="node" />
/// <reference types="cypress" />
import { dirname } from 'path'
import webpackPreprocessor from '@cypress/webpack-preprocessor'
import { useBabelrcOptions } from './use-babelrc-utils'

// The extension list depends on the webpack major version, so read it from the
// webpack the preprocessor runs, which pnpm or nested installs can resolve to a
// different copy than this package would
const preprocessorDir = dirname(
  require.resolve('@cypress/webpack-preprocessor')
)
const webpackPath = require.resolve('webpack', { paths: [preprocessorDir] })
const { version: webpackVersion } = require(webpackPath) as { version: string }

const preprocessor = webpackPreprocessor(
  useBabelrcOptions(webpackPreprocessor.defaultOptions, webpackVersion)
)
// Type assertion to avoid exposing private FileEvent type
export = preprocessor as (file: Cypress.FileObject) => string | Promise<string>
