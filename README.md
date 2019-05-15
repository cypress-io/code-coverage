# cypress-istanbul [![renovate-app badge][renovate-badge]][renovate-app]

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

![Coverage report](images/coverage.png)

## License

This project is licensed under the terms of the [MIT license](/LICENSE.md).

[renovate-badge]: https://img.shields.io/badge/renovate-app-blue.svg
[renovate-app]: https://renovateapp.com/
