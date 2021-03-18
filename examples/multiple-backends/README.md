# example: multiple-backends

> Combined code coverage from multiple backend processes, and e2e and unit tests

This example runs instrumented server code on two processes, that serves instrumented frontend code, and instruments the unit tests on the fly. The final report combines all 4 sources of information.

To run

```sh
$ npm run dev
```

You should see messages from the plugin when it saves each coverage object

![Coverage messages](images/multiple-backends.png)

In the produced report, you should see

- `server1/server.js` coverage for backend
- `server2/server.js` coverage for backend
- `main.js` coverage from end-to-end tests
- `string-utils.js` coverage from unit tests
