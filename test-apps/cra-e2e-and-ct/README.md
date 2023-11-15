# example: create react app with both e2e and component testing examples

This example has both e2e and CT tests, which are run sequentially in the `cy:run` script.
It uses the [@cypress/instrument-cra](https://github.com/cypress-io/instrument-cra) package to instrument the
React code before the tests run.
