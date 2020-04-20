# use-webpack

> Instruments the built bundle using Webpack

Webpack uses [webpack.config.js](webpack.config.js) to build the bundle from [src/index.js](src/index.js) into `dist/main.js`, loaded from [dist/index.html](dist/index.html). The [cypress/integration/spec.js](cypress/integration/spec.js) also uses one of the functions from [src/calc.js](src/calc.js) directly. The final coverage includes both E2E and unit test coverage information.

**Note:** this project requires `npm run build` before running `npm run dev`.
