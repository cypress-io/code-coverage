# example: no-base-url

Runs without a `baseUrl`. The first test visits the app, and the last test never calls `cy.visit`, so test isolation leaves the page on `about:blank` when the plugin's `after` hooks run. Coverage should still be saved without the plugin trying to request backend coverage from a relative URL.
