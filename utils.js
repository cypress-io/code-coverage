module.exports = {
  /**
   * Replace source-map's path by the corresponding absolute file path
   * (coverage report wouldn't work with source-map path being relative
   * or containing Webpack loaders and query parameters)
   */
  fixSourcePathes(coverage) {
    Object.values(coverage).forEach(file => {
      const { path: absolutePath, inputSourceMap } = file
      const fileName = /([^\/\\]+)$/.exec(absolutePath)[1]
      if (!inputSourceMap || !fileName) return

      if (inputSourceMap.sourceRoot) inputSourceMap.sourceRoot = ''
      inputSourceMap.sources = inputSourceMap.sources.map(source =>
        source.includes(fileName) ? absolutePath : source
      )
    })
  }
}
