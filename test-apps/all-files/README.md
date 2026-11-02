# example: all files

Uses the NYC `all: true` option with `expose.codeCoverage.instrumentUnloadedFiles` so that `not-covered.js` and `cypress.config.js`, which no test loads, appear in the report at 0%.
