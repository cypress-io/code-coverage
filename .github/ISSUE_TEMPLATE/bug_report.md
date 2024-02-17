---
name: Bug report
about: Create a report to help us improve
title: ''
labels: ''
assignees: ''
---

**Logs and screenshots**
Please provide debug logs by running Cypress from the terminal with `DEBUG=code-coverage` environment variable set. See the [Debugging](https://github.com/rohit-gohri/cypress-code-coverage-v8#debugging) section of the README file.

**Versions**

- What is this plugin's version? If this is NOT the latest [released version](https://github.com/rohit-gohri/cypress-code-coverage-v8/releases), can you try the latest version, please?
- If the plugin worked before in version X but stopped after upgrading to version Y, please try the [released versions](https://github.com/rohit-gohri/cypress-code-coverage-v8/releases) between X and Y to see where the breaking change was.
- What is the Cypress version?
- What is your operating system?
- What is the shell?
- What is the Node version?
- What is the NPM version?
- How do you instrument your application? Cypress [does not instrument web application code](https://github.com/rohit-gohri/cypress-code-coverage-v8#instrument-your-application), so you must do it yourself.
- When running tests, if you open the web application in a regular browser and open DevTools, do you see `window.__coverage__` object? Can you paste a screenshot?
- Is there a `.nyc_output` folder? Is there a `.nyc_output/out.json` file? Is it empty? Can you paste at least part of it so we can see the keys and file paths?
- Do you have any custom NYC settings in `package.json` (`nyc` object) or in other [NYC config files](https://github.com/istanbuljs/nyc#configuration-files)?
- Do you run Cypress tests in a Docker container?

**Describe the bug**
A clear and concise description of what the bug is.

**Link to the repo**
Bugs with a reproducible example, like an open-source repo showing the bug, are the most likely to be resolved.

**Example**
See [#217](https://github.com/cypress-io/code-coverage/issues/217) that is an excellent bug report example
