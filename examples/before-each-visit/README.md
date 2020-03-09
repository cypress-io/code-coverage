# example: before-each-visit

Code coverage example where the `cy.visit` happens in `beforeEach` hook

Code was instrumented with

```shell
npx nyc instrument --compact false main.js > main-instrumented.js
```

The code uses custom coverage report command in [package.json](package.json) to call `nyc`
