# example: before-all-visit

Code coverage example where the `cy.visit` happens in `before` hook

Code was instrumented with

```shell
npx nyc instrument --compact false main.js > main-instrumented.js
```

and then removed absolute folder paths, leaving just relative path `main.js` in the produced file.

The code uses custom coverage report command in [package.json](package.json) to call `nyc`
