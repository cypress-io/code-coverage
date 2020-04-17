---
name: Bug report
about: Create a report to help us improve
title: ''
labels: ''
assignees: ''
---

**Logs and screenshots**
Please provide debug logs by running Cypress from the terminal with `DEBUG=code-coverage` environment variable set, see the [Debugging](https://github.com/cypress-io/code-coverage#debugging) section of the README file.

**Versions**

- What is this plugin's version?
- What is Cypress version?
- What is your operating system?
- What is the shell?
- What is the Node version?
- What is the NPM version?
- Is there `.nyc_output` folder? Is there `.nyc_output/out.json` file. Is it empty? Can you paste at least part of it so we can see the keys and file paths?
- Do you have any custom NYC settings in `package.json` (`nyc` object) or in other [NYC config files](https://github.com/istanbuljs/nyc#configuration-files)
- Do you run Cypress tests in a Docker container?

**Describe the bug**
A clear and concise description of what the bug is.

**Link to the repo**
Bugs with a reproducible example, like an open source repo showing the bug, are the most likely to be resolved.
