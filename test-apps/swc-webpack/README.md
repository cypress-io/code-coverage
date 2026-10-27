# swc-webpack

> Instruments the bundle with SWC instead of Babel

webpack builds [src/index.js](src/index.js) with [swc-loader](https://www.npmjs.com/package/swc-loader). The [.swcrc](.swcrc) file adds [swc-plugin-coverage-instrument](https://github.com/kwonoj/swc-coverage-instrument), which writes Istanbul-compatible counters to `window.__coverage__`.

[index.html](index.html) loads the bundle after the page's `load` event, the way frameworks like Next.js run component code during hydration. The test in [cypress/e2e/spec.cy.js](cypress/e2e/spec.cy.js) visits two pages that run different branches, which checks that the plugin collects coverage that appears after each page loads, including a page the test has already left.
