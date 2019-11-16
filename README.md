# @cypress/code-coverage [![renovate-app badge][renovate-badge]][renovate-app] [![CircleCI](https://circleci.com/gh/cypress-io/code-coverage.svg?style=svg)](https://circleci.com/gh/cypress-io/code-coverage)

> Saves the code coverage collected during Cypress tests

**⚠️ Performance Warning**
This plugin will slow down your tests. There will be more web application JavaScript code to execute due to instrumentation, and there will be code coverage information to merge and save after each test. Track issue [#26](https://github.com/cypress-io/code-coverage/issues/26) for current progress.

## Install

```shell
npm install -D @cypress/code-coverage
```

and its peer dependencies

```shell
npm install -D nyc istanbul-lib-coverage cypress
```

Add to your `cypress/support/index.js` file

```js
import '@cypress/code-coverage/support'
```

Register tasks in your `cypress/plugins/index.js` file

```js
module.exports = (on, config) => {
  on('task', require('@cypress/code-coverage/task'))
}
```

If your application is loaded Istanbul-instrumented source code, then the coverage information will be automatically saved into `.nyc_output` folder and a report will be generated after the tests finish (even in the interactive mode). Find the LCOV and HTML report in the `coverage/lcov-report` folder.

![Coverage report](images/coverage.jpg)

That should be it!

## Instrument unit tests

If you test your application code directly from `specs` you might want to instrument them and combine unit test code coverage with any end-to-end code coverage (from iframe). You can easily instrument spec files using [babel-plugin-istanbul](https://github.com/istanbuljs/babel-plugin-istanbul) for example.

Install the plugin

```
npm i -D babel-plugin-istanbul
```

Set your `.babelrc` file

```rc
{
  "plugins": ["istanbul"]
}
```

Put the following in `cypress/plugins/index.js` file to use `.babelrc` file

```js
module.exports = (on, config) => {
  on('task', require('@cypress/code-coverage/task'))
  on('file:preprocessor', require('@cypress/code-coverage/use-babelrc'))
}
```

Now the code coverage from spec files will be combined with end-to-end coverage.

### Alternative

If you cannot use `.babelrc` for some reason (maybe it is used by other tools?), try pushing `babel-plugin-istanbul` directory to browserify plugins list.

```js
module.exports = (on, config) => {
  on('task', require('@cypress/code-coverage/task'))
  on('file:preprocessor', require('@cypress/code-coverage/use-browserify-istanbul'))
}
```

## Instrument backend code

You can also instrument your server-side code and produce combined coverage report that covers both the backend and frontend code.

1. Run the server code with instrumentation. The simplest way is to use [nyc](https://github.com/istanbuljs/nyc). If normally you run `node src/server` then to run instrumented version you can do `nyc --silent node src/server`.
2. Add an endpoint that returns collected coverage. If you are using Express, you can simply do

```js
const express = require('express')
const app = express()
require('@cypress/code-coverage/middleware/express')(app)
```

**Tip:** you can register the endpoint only if there is global code coverage object, and you can exclude the middleware code from the coverage numbers

```js
// https://github.com/gotwarlost/istanbul/blob/master/ignoring-code-for-coverage.md
/* istanbul ignore next */
if (global.__coverage__) {
  require('@cypress/code-coverage/middleware/express')(app)
}
```

If you use Hapi server, define the endpoint yourself and return the object

```js
if (global.__coverage__) {
  require('@cypress/code-coverage/middleware/hapi')(server)
}
```

For any other server, define the endpoint yourself and return the coverage object:

```js
if (global.__coverage__) {
  // add method "GET /__coverage__" and response with JSON
  onRequest = (response) =>
    response.sendJSON({coverage: global.__coverage__ })
}
```

3. Save the API coverage endpoint in `cypress.json` file to let the plugin know where to call to receive the code coverage data from the server. Place it in `env.codeCoverage` object:

```json
{
  "env": {
    "codeCoverage": {
      "url": "http://localhost:3000/__coverage__"
    }
  }
}
```

That should be enough - the code coverage from the server will be requested at the end of the test run and merged with the client-side code coverage, producing a combined report

## Custom report folder

You can specify custom report folder by adding `nyc` object to the `package.json` file. For example to save reports to `cypress-coverage` folder, use:

```json
{
  "nyc": {
    "report-dir": "cypress-coverage"
  }
}
```

## Custom reporters

You can specify custom coverage reporter(s) to use. For example to output text summary and save JSON report in `cypress-coverage` folder set in your `package.json` folder:

```json
{
  "nyc": {
    "report-dir": "cypress-coverage",
    "reporter": [
      "text",
      "json"
    ]
  }
}
```

**Tip:** find list of reporters [here](https://istanbul.js.org/docs/advanced/alternative-reporters/)

## TypeScript users

TypeScript source files are NOT included in the code coverage report by default, even if they are properly instrumented. In order to tell `nyc` to include TS files in the report, you need to:

1. Add these dev dependencies that let Istanbul work with TypeScript

```shell
npm i -D @istanbuljs/nyc-config-typescript source-map-support ts-node
```

2. In `package.json` use the following `nyc` configuration object

```json
{
  "nyc": {
    "extends": "@istanbuljs/nyc-config-typescript",
    "all": true
  }
}
```

## Exclude code

You can exclude parts of the code or entire files from the code coverage report. See [Istanbul guide](https://github.com/gotwarlost/istanbul/blob/master/ignoring-code-for-coverage.md). Common cases:

### Exclude "else" branch

When running code only during Cypress tests, the "else" branch will never be hit. Thus we should exclude it from the branch coverage computation:

```js
// expose "store" reference during tests
/* istanbul ignore else */
if (window.Cypress) {
  window.store = store
}
```

### Exclude next logical statement

Often needed to skip a statement

```js
/* istanbul ignore next */
if (global.__coverage__) {
  require('@cypress/code-coverage/middleware/express')(app)
}
```

Or a particular `switch` case

```js
switch (foo) {
  case 1: /* some code */; break;
  /* istanbul ignore next */
  case 2: // really difficult to hit from tests
    someCode();
}
```

### Exclude files and folders

See [`nyc` configuration](https://github.com/istanbuljs/nyc#common-configuration-options) and [ include and exclude options](https://github.com/istanbuljs/nyc#using-include-and-exclude-arrays). You can include and exclude files using `minimatch` patterns in `.nycrc` file or using "nyc" object inside your `package.json` file.

For example, if you want to only include files in the `app` folder, but exclude `app/util.js` file, you can set in your `package.json`

```json
{
  "nyc": {
    "include": [
      "app/**/*.js"
    ],
    "exclude": [
      "app/util.js"
    ]
  }
}
```

## Disable plugin

You can skip the client-side code coverage hooks by setting the environment variable `coverage` to `false`.

```shell
cypress run --env coverage=false
```

See [Cypress environment variables](https://on.cypress.io/environment-variables) and [support.js](support.js). You can try running without code coverage in this project yourself

```shell
# run with code coverage
npm run dev
# disable code coverage
npm run dev:no:coverage
```

## Links

- Read the [Cypress code coverage guide](http://on.cypress.io/code-coverage)
- Read ["Code Coverage by Parcel Bundler"](https://glebbahmutov.com/blog/code-coverage-by-parcel/) blog post
- Read ["Combined End-to-end and Unit Test Coverage"](https://glebbahmutov.com/blog/combined-end-to-end-and-unit-test-coverage/)

## Examples

- [cypress-io/cypress-example-todomvc-redux](https://github.com/cypress-io/cypress-example-todomvc-redux) is a React / Redux application with 100% code coverage.
- [cypress-io/cypress-example-realworld](https://github.com/cypress-io/cypress-example-realworld) shows how to collect the coverage information from both back and front end code and merge it into a single report.
- [bahmutov/code-coverage-webpack-dev-server](https://github.com/bahmutov/code-coverage-webpack-dev-server) shows how to collect code coverage from an application that uses webpack-dev-server.
- [bahmutov/code-coverage-vue-example](https://github.com/bahmutov/code-coverage-vue-example) collects code coverage for Vue.js single file components.
- [lluia/cypress-typescript-coverage-example](https://github.com/lluia/cypress-typescript-coverage-example) shows coverage for React App that uses TypeScript. See discussion in issue [#19](https://github.com/cypress-io/code-coverage/issues/19).
- [bahmutov/cypress-and-jest](https://github.com/bahmutov/cypress-and-jest) shows how to run Jest unit tests and Cypress unit tests, collecting code coverage from both test runners, and then produce merged report.
- [rootstrap/react-redux-base](https://github.com/rootstrap/react-redux-base) shows an example with a realistic Webpack config. Instruments the source code using `babel-plugin-istanbul` during tests.
- [skylock/cypress-angular-coverage-example](https://github.com/skylock/cypress-angular-coverage-example) shows Angular 8 + TypeScript application with instrumentation done using [istanbul-instrumenter-loader](https://github.com/webpack-contrib/istanbul-instrumenter-loader).
- [bahmutov/testing-react](https://github.com/bahmutov/testing-react) shows how to get code coverage for a React application created using [CRA v3](https://github.com/facebook/create-react-app) without ejecting `react-scripts`.
- [bahmutov/next-and-cypress-example](https://github.com/bahmutov/next-and-cypress-example) shows how to get backend and fronend coverage for a [Next.js](https://nextjs.org) project. Uses [middleware/nextjs.js](middleware/nextjs.js).
- [akoidan/vue-webpack-typescript](https://github.com/akoidan/vue-webpack-typescript) Pure webpack config with vue + typescript with codecov reports. This setup uses babel-loader with TS checker as a separate thread.

## Debugging

This plugin uses [debug](https://github.com/visionmedia/debug) module to output additional logging messages from its [task.js](task.js) file. This can help with debugging errors while saving code coverage or reporting. In order to see these messages, run Cypress from the terminal with environment variable `DEBUG=code-coverage`. Example using Unix syntax to set the variable:

```shell
$ DEBUG=code-coverage npm run dev
...
  code-coverage reset code coverage in interactive mode +0ms
  code-coverage wrote coverage file /code-coverage/.nyc_output/out.json +28ms
  code-coverage saving coverage report using command: "nyc report --report-dir ./coverage --reporter=lcov --reporter=clover --reporter=json" +3ms
```

## License

This project is licensed under the terms of the [MIT license](/LICENSE.md).

[renovate-badge]: https://img.shields.io/badge/renovate-app-blue.svg
[renovate-app]: https://renovateapp.com/
