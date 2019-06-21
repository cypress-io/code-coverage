module.exports = {
  /**
   * Remove potential Webpack loaders string and query parameters from sourcemap path
   */
  fixSourcePathes (coverage) {
    Object.keys(coverage).forEach(file => {
      const sourcemap = coverage[file].inputSourceMap
      if (!sourcemap) return
      sourcemap.sources = sourcemap.sources.map(source => {
        let cleaned = source
        if (cleaned.includes('!')) cleaned = cleaned.split('!').pop()
        if (cleaned.includes('?')) cleaned = cleaned.split('?').shift()
        return cleaned
      })
    })
  }
}