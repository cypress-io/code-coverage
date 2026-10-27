# component-vite

> Collects code coverage from React component tests served by Vite

[vite-plugin-istanbul](https://github.com/iFaxity/vite-plugin-istanbul) in [vite.config.js](vite.config.js) instruments [src/Counter.jsx](src/Counter.jsx) while Cypress serves it for component testing. [cypress/support/component.js](cypress/support/component.js) imports `@cypress/code-coverage/support`, and [cypress.config.js](cypress.config.js) registers the coverage task in `component.setupNodeEvents`.

The tests in [src/Counter.cy.jsx](src/Counter.cy.jsx) cover every line of the component.

**Note:** the `optimizeDeps` and `resolve.dedupe` settings in `vite.config.js` are only needed because this app loads Cypress and the plugin from the root of this repository. A project that installs them in its own `node_modules` doesn't need them.
