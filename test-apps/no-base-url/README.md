# example: no-base-url

Runs without a `baseUrl`. In each spec, the first test visits the app, and the last test never calls `cy.visit`, so test isolation leaves the page on `about:blank` when the plugin's `after` hooks run.

- `spec.cy.js` checks that the run still passes and coverage is saved, instead of the plugin trying to request backend coverage from a relative URL.
- `skipped-backend.cy.js` sets `expectBackendCoverageOnly` so the skipped request throws, then checks that error was raised. This proves the plugin skipped the request rather than sending it somewhere that returned no coverage.
