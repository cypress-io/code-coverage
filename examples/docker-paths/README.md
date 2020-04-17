# example-docker-paths

In this example, the source files are "instrumented" as if they were instrumented inside a Docker container. Still, Cypress code coverage plugin should find the matching current folder where same files exist and update `.nyc_output/out.json` file before generating reports.

Source files from `app` folder were instrumented into `dist` folder with command

```shell
$ npx nyc instrument app dist
```

Then the `index.html` file was copied into `dist` folder.

Then the source paths in [dist/main.js](dist/main.js) and [dist/second.js](dist/second.js) were changed to non-existent prefix folder `/var/www/test/site`.

When Cypress runs, the `.nyc_output/out.json` is updated, so the path is valid local path like:

```
{
  "/var/www/test/site/app/main.js": {
    "path": "/Users/gleb/git/code-coverage/examples/docker-paths/app/main.js",
    "statementMap": {
      ...
```

And the report has valid HTML with sources

![All files](images/files.png)

![Single file](images/file.png)

**Note:** remember to remove existing `.nyc_output` folder if running Cypress in non-interactive mode `rm -rf .nyc_output/`.

When running with [debug logs](https://github.com/cypress-io/code-coverage#debugging) you should see messages:

```
found common folder /var/www/test/site that matches
current working directory /Users/gleb/git/code-coverage/examples/docker-paths
```
