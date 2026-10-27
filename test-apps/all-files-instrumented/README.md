# example: all files instrumented

Same as [all-files](../all-files), but with `expose.codeCoverage.instrumentUnloadedFiles: true`. The file `not-covered.js` is never loaded by the page, so the plugin instruments it and reports its statements at 0%.
