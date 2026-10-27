# example: lazy-load

Code coverage example where the instrumented code loads after the page, like a micro-frontend. The host page isn't instrumented, so `window.__coverage__` doesn't exist until the test clicks a button that loads `remote.js`.
