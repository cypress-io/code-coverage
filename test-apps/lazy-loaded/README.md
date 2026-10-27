# example: lazy-loaded

The instrumented code (`lazy.js`) is loaded with a dynamic `import()` after the window `load` event, so `window.__coverage__` doesn't exist yet when the page loads. This mirrors how Storybook 7 and other single-page apps load their components.

The plugin should still pick up the coverage at the end of the test. See [#657](https://github.com/cypress-io/code-coverage/issues/657).

`navigate-away.cy.js` calls `farewell` and then visits another page before the test ends, so its coverage only survives if the plugin saves it when the first page unloads.
