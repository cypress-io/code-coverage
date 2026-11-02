# webpack-ts

> Instruments TypeScript sources bundled with webpack

Webpack uses [webpack.config.js](webpack.config.js) to bundle [src/index.ts](src/index.ts) into `dist/main.js`, which [index.html](index.html) loads. `babel-loader` reads [.babelrc](.babelrc), where `@babel/preset-typescript` strips the types and `babel-plugin-istanbul` instruments the code. Istanbul only runs when the Babel env is `test`. The `build` and `cy:run` scripts set `NODE_ENV=test` with `cross-env` and copy files with Node, so they work in Windows shells too. A normal build stays uninstrumented.

[cypress.config.js](cypress.config.js) bundles the spec files with the same webpack config, so when [cypress/e2e/spec.cy.ts](cypress/e2e/spec.cy.ts) imports [src/calc.ts](src/calc.ts) directly, that code is instrumented too. The final report combines E2E and unit test coverage for the `.ts` files. To keep that unit test coverage when you run Cypress interactively, start it with `npx cross-env NODE_ENV=test cypress open`.

Babel doesn't type-check. Run `npx tsc -p .` to check types.
