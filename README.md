# cypress-code-coverage-v8

> Saves the code coverage collected during Cypress tests

## Install

```shell
npm install -D cypress-code-coverage-v8
```

**Note:** This plugin assumes that `cypress` is a peer dependency already installed in your project.

Then add the code below to the `supportFile` and `setupNodeEvents` function.

```js
// cypress/support/e2e.js
import 'cypress-code-coverage-v8/dist/support'
```

```js
// cypress.config.js
const { defineConfig } = require('cypress')

module.exports = defineConfig({
  // setupNodeEvents can be defined in either
  // the e2e or component configuration
  e2e: {
    setupNodeEvents(on, config) {
      require('cypress-code-coverage-v8/dist/plugins')(on, config)
      // include any other plugin code...

      // It's IMPORTANT to return the config object
      // with any changed environment variables
      return config
    },
  },
})
```

## Instrument your application

This plugin **DOES NOT** instrument your code. You have to instrument it yourself using the [Istanbul.js](https://istanbul.js.org/) tool. Luckily, it is not difficult. For example, if you are already using Babel to transpile, you can add [babel-plugin-istanbul](https://github.com/istanbuljs/babel-plugin-istanbul) to your `.babelrc` and instrument on the fly.

```json
{
  "plugins": ["istanbul"]
}
```

Please see the [Test Apps](#internal-test-apps) section below. You can find a linked project matching your situation to see how to instrument your application's source code before running end-to-end tests to get the code coverage.

If your application has been instrumented correctly, you should see additional counters and instructions in the application's JavaScript resources, as the image below shows.

![Instrumented code](images/instrumented-code.png)

You should see the `window.__coverage__` object in the "Application under test iframe"

![Window coverage object](images/window-coverage-object.png)

If you have instrumented your application's code and see the `window.__coverage__` object, then this plugin will save the coverage into the `.nyc_output` folder and will generate reports after the tests finish (even in the interactive mode). Find the LCOV and HTML report in the `coverage/lcov-report` folder.

![Coverage report](images/coverage.jpg)

That should be it! You should see messages from this plugin in the Cypress Command Log.

![Plugin messages](images/gui.png)

### More information

- Read [Cypress Code Coverage: Instrumenting code](https://on.cypress.io/code-coverage#Instrumenting-code) guide
- Watch [Code coverage](https://youtu.be/C8g5X4vCZJA) webinar
- Watch videos in [Cypress Tips & Tricks](https://www.youtube.com/playlist?list=PLP9o9QNnQuAYYRpJzDNWpeuOVTwxmIxcI) that deal with code coverage

### App vs unit tests

You need to instrument your web application. This means that when the test does `cy.visit('localhost:3000')` any code, the `index.html` requests should be instrumented by YOU. See the [Test Apps](#internal-test-apps) section for advice. Usually, you need to stick `babel-plugin-istanbul` into your pipeline somewhere.

If you are testing individual functions from your application code by importing them directly into Cypress spec files, this is called "unit tests" and Cypress can instrument this scenario for you. See [Instrument unit tests](#instrument-unit-tests) section.

## Reports

The `coverage` folder has results in several formats, and the coverage raw data is stored in the `.nyc_output` folder. You can see the coverage numbers yourself. This plugin has `nyc` as a dependency, so it should be available right away. Here are common examples:

```shell
# see just the coverage summary
$ npx nyc report --reporter=text-summary
# see just the coverage file by file
$ npx nyc report --reporter=text
# save the HTML report again
$ npx nyc report --reporter=lcov
```

It is helpful to enforce [minimum coverage](https://github.com/istanbuljs/nyc#common-configuration-options) numbers. For example:

```shell
$ npx nyc report --check-coverage --lines 80
----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------|---------|----------|---------|---------|-------------------
All files |     100 |      100 |     100 |     100 |
 main.js  |     100 |      100 |     100 |     100 |
----------|---------|----------|---------|---------|-------------------

$ npx nyc report --check-coverage --lines 101
----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------|---------|----------|---------|---------|-------------------
All files |     100 |      100 |     100 |     100 |
 main.js  |     100 |      100 |     100 |     100 |
----------|---------|----------|---------|---------|-------------------
ERROR: Coverage for lines (100%) does not meet global threshold (101%)
```

Watch the video [How to read code coverage report](https://youtu.be/yVvCYtsmkZU) to see how to read the HTML coverage report.

## Unit tests

The code coverage from spec files will be combined with end-to-end coverage.

Find examples of just the unit tests and JavaScript source files with collected code coverage in [test-apps/unit-tests-js](./test-apps/unit-tests-js).

## Backend code

Example in [test-apps/backend](test-apps/backend) folder.

You can also instrument your server-side code and produce a combined coverage report that covers both the backend and frontend code.

1. Run the server code with instrumentation. The simplest way is to use [nyc](https://github.com/istanbuljs/nyc). If normally you run `node src/server`, then to run the instrumented version, you can do `nyc --silent node src/server`.
2. Add an endpoint that returns collected coverage. If you are using Express, you can do

```js
const express = require('express')
const app = express()
require('cypress-code-coverage-v8/dist/middleware/express')(app)
```

For any other server, define the endpoint yourself and return the coverage object:

```js
if (global.__coverage__) {
  // add method "GET /__coverage__" and response with JSON
  onRequest = (response) => response.sendJSON({ coverage: global.__coverage__ })
}
```

3. Save the API coverage endpoint in the `cypress.json` file to let the plugin know where to call to receive the code coverage data from the server. Place it in `env.codeCoverage` object:

```json
{
  "env": {
    "codeCoverage": {
      "url": "http://localhost:3000/__coverage__"
    }
  }
}
```

That should be enough - the code coverage from the server will be requested at the end of the test run and merged with the client-side code coverage, producing a combined report.

### expectBackendCoverageOnly

If there is NO frontend code coverage, and you only want to collect backend code coverage using Cypress tests, set `expectBackendCoverageOnly: true` in the `cypress.json` file. Otherwise, Cypress complains that it cannot find the frontend code coverage.

Default:

![No frontend code coverage warning](./images/warning.png)

After:

```json
{
  "env": {
    "codeCoverage": {
      "url": "http://localhost:3003/__coverage__",
      "expectBackendCoverageOnly": true
    }
  }
}
```

![Cypress knows to expect the backend code coverage only](./images/expect-backend.png)

## Custom report folder

You can specify a custom report folder by adding `nyc` object to the `package.json` file. For example, to save reports to `cypress-coverage` folder, use:

```json
{
  "nyc": {
    "report-dir": "cypress-coverage"
  }
}
```

## Custom reporters

You can specify custom coverage reporter(s) to use. For example, to output text summary and save JSON report in the `cypress-coverage` folder set in your `package.json` folder:

```json
{
  "nyc": {
    "report-dir": "cypress-coverage",
    "reporter": ["text", "json"]
  }
}
```

**Tip:** find list of reporters [here](https://istanbul.js.org/docs/advanced/alternative-reporters/)

## Custom NYC command

Sometimes, the NYC tool might be installed in a different folder, not the current or parent folder, or you might want to customize the report command. In that case, put the custom command into `package.json` in the current folder, and this plugin will automatically use it.

```json
{
  "scripts": {
    "coverage:report": "call NYC report ..."
  }
}
```

## TypeScript users

TypeScript source files should be automatically included in the report if they are instrumented.

See [test-apps/ts-example](test-apps/ts-example), [bahmutov/cra-ts-code-coverage-example](https://github.com/bahmutov/cra-ts-code-coverage-example) or [bahmutov/cypress-angular-coverage-example](https://github.com/bahmutov/cypress-angular-coverage-example).

## Include code

By default, the code coverage report includes _only_ the instrumented files loaded by the application during the tests. If some modules are loaded dynamically or by the pages NOT visited during any tests, these files will not be in the report - because the plugin does not know about them. You can include all expected source files in the report using the `include` list in the `package.json` file. The files without counters will have 0 percent code coverage.

For example, to ensure the final report includes all JS files from the "src/pages" folder, set the "nyc" object in your `package.json` file.

```json
{
  "nyc": {
    "all": true,
    "include": "src/pages/*.js"
  }
}
```

See example [test-app/all-files](./test-apps/all-files)

## Exclude code

You can exclude parts of the code or entire files from the code coverage report. See [Istanbul guide](https://github.com/gotwarlost/istanbul/blob/master/ignoring-code-for-coverage.md). Common cases:

### Exclude the "else" branch

The "else" branch will never be hit when running code only during Cypress tests. Thus, we should exclude it from the branch coverage computation:

```js
// expose "store" reference during tests
/* istanbul ignore else */
if (window.Cypress) {
  window.store = store
}
```

### Exclude the next logical statement

Often needed to skip a statement or a particular `switch` case

```js
switch (foo) {
  case 1 /* some code */:
    break
  /* istanbul ignore next */
  case 2: // really difficult to hit from tests
    someCode()
}
```

### Exclude files and folders

The code coverage plugin will automatically exclude any test/spec files you have defined in the `testFiles` (Cypress < v10) or `specPattern` (Cypress >= v10) configuration options. Additionally, you can set the `exclude` pattern glob in the code coverage environment variable to specify additional files to be excluded:

```javascript
// cypress.config.js or cypress.json
env: {
  codeCoverage: {
    exclude: ['cypress/**/*.*'],
  },
},
```

Cypress 10 and later users should set the `exclude` option to exclude any items from the `cypress` folder they don't want included in the coverage reports.

Additionally, you can use [`nyc` configuration](https://github.com/istanbuljs/nyc#common-configuration-options) and [include and exclude options](https://github.com/istanbuljs/nyc#using-include-and-exclude-arrays). You can include and exclude files using `minimatch` patterns in the `.nycrc` file or the "nyc" object inside your `package.json` file.

For example, if you want only to include files in the `app` folder but exclude the `app/util.js` file, you can set it in your `package.json`.

```json
{
  "nyc": {
    "include": ["app/**/*.js"],
    "exclude": ["app/util.js"]
  }
}
```

**Note:** If you have the `all: true` NYC option set, this plugin will check the produced `.nyc_output/out.json` before generating the final report. If the `out.json` file does not have information for some files that should be there according to the `include` list, then an empty placeholder will be included. See [PR 208](https://github.com/cypress-io/code-coverage/pull/208).

Another important option is `excludeAfterRemap`. By default, it is false, which might let excluded files through. If you exclude the files, and the instrumenter does not respect the `nyc.exclude` setting, then add `excludeAfterRemap: true` to tell `nyc report` to exclude files. See [test-apps/exclude-files](test-apps/exclude-files).

## Disable plugin

You can skip the client-side code coverage hooks by setting the environment variable `coverage` to `false`.

```shell
# tell Cypress to set environment variable "coverage" to false
cypress run --env coverage=false
# or pass the environment variable
CYPRESS_COVERAGE=false cypress run
```

Or set it to `false` in the `cypress.json` file.

```json
{
  "env": {
    "coverage": false
  }
}
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
- If you are using React, check out [@cypress/instrument-cra](https://github.com/cypress-io/instrument-cra)
- Watch videos in [Cypress Tips & Tricks](https://www.youtube.com/playlist?list=PLP9o9QNnQuAYYRpJzDNWpeuOVTwxmIxcI) playlist

## Examples

### Internal test apps

Full examples we use for testing in this repository:

- [test-apps/backend](test-apps/backend) only instruments the backend Node server and saves the coverage report
- [test-apps/fullstack](test-apps/fullstack) instruments and merges backend, e2e and unit test coverage into a single report
- [test-apps/before-all-visit](test-apps/before-all-visit) checks if code coverage works when `cy.visit` is made once in the `before` hook
- [test-apps/before-each-visit](test-apps/before-each-visit) checks if code coverage correctly keeps track of code when doing `cy.visit` before each test
- [test-apps/one-spec](test-apps/one-spec) confirms that coverage is collected and filtered correctly if the user only executes a single Cypress test
- [test-apps/ts-example](test-apps/ts-example) uses Babel + Parcel to instrument and serve TypeScript file
- [test-apps/use-webpack](test-apps/use-webpack) shows Webpack build with source maps and Babel
- [test-apps/unit-tests-js](test-apps/unit-tests-js) runs just the unit tests and reports code coverage (JavaScript source code)
- [test-apps/unit-tests-ts](test-apps/ts-example) runs just the unit tests and reports code coverage (TypeScript source code)

### External examples

Look up the list of examples under the GitHub topic [cypress-code-coverage-v8-example](https://github.com/topics/cypress-code-coverage--v8-example)

## Debugging

This plugin uses the [debug](https://github.com/visionmedia/debug) module to output additional logging messages from its [task.js](task.js) file. This can help with debugging errors while saving code coverage or reporting. To see these messages, run Cypress from the terminal with the environment variable `DEBUG=code-coverage`. Example using Unix syntax to set the variable:

```shell
$ DEBUG=code-coverage npm run dev
...
  code-coverage reset code coverage in interactive mode +0ms
  code-coverage wrote coverage file /code-coverage/.nyc_output/out.json +28ms
  code-coverage saving coverage report using the command: "nyc report --report-dir ./coverage --reporter=lcov --reporter=clover --reporter=json" +3ms
```

Deeply nested objects will sometimes have `[object Object]` values printed. You can print these nested objects by specifying a deeper depth by adding `DEBUG_DEPTH=` setting.

```shell
DEBUG_DEPTH=10 DEBUG=code-coverage npm run dev
```

### Common issues

If the plugin worked before in version X but stopped after upgrading to version Y, please try the [released versions](https://github.com/rohit-gohri/cypress-code-coverage-v8/releases) between X and Y to see where the breaking change was.

If you decide to open an issue in this repository, please fill in all information the [issue template](https://github.com/rohit-gohri/cypress-code-coverage-v8/blob/master/.github/ISSUE_TEMPLATE/bug_report.md) asks for. The issues most likely to be resolved have debug logs, screenshots, and hopefully public repository links so we can try running the tests ourselves.

## Contributing

You can test changes locally by running tests and confirming that the code coverage has been calculated and saved.

```shell
npm run test:ci
# now check generated coverage numbers
npx nyc report --check-coverage true --lines 80
npx nyc report --check-coverage true --lines 100 --include cypress/about.js
npx nyc report --check-coverage true --lines 100 --include cypress/unit.js
```

**Tip:** use [check-code-coverage](https://github.com/bahmutov/check-code-coverage) for stricter code coverage checks than `nyc report --check-coverage` allows.

### Markdown

You can validate links in Markdown files in this directory by executing (Linux + Mac only) script.

```shell
npm run check:markdown
```

## License

This project is licensed under the terms of the [MIT license](LICENSE.md).
