# cypress-istanbul [![CircleCI](https://circleci.com/gh/cypress-io/cypress-istanbul.svg?style=svg)](https://circleci.com/gh/cypress-io/cypress-istanbul) [![renovate-app badge][renovate-badge]][renovate-app]

> Saves the code coverage collected from instrumented code

## Install

```shell
npm install -D cypress-istanbul
```

and its peer dependencies

```shell
npm install -D nyc istanbul-lib-coverage cypress
```

Add to your `cypress/support/index.js` file

```js
import 'cypress-istanbul/support'
```

Register tasks in your `cypress/plugins/index.js` file

```js
module.exports = (on, config) => {
  on('task', require('cypress-istanbul/task'))
}
```

If your application is loaded Istanbul-instrumented source code, then the coverage information will be automatically saved into `.nyc_output` folder and a report will be generated after the tests finish (even in the interactive mode). Find the HTML report in the `coverage` folder.

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
  on('task', require('cypress-istanbul/task'))
  on('file:preprocessor', require('cypress-istanbul/use-babelrc'))
}
```

Now the code coverage from spec files will be combined with end-to-end coverage.

## Examples

- [cypress-example-todomvc-redux](https://github.com/cypress-io/cypress-example-todomvc-redux)
- Read ["Code Coverage by Parcel Bundler"](https://glebbahmutov.com/blog/code-coverage-by-parcel/) blog post
- Read ["Combined End-to-end and Unit Test Coverage"](https://glebbahmutov.com/blog/combined-end-to-end-and-unit-test-coverage/)

## Debugging

Run tests with `DEBUG=cypress-istanbul` environment variable to see log messages

## License

This project is licensed under the terms of the [MIT license](/LICENSE.md).

[renovate-badge]: https://img.shields.io/badge/renovate-app-blue.svg
[renovate-app]: https://renovateapp.com/
