import type { Configuration } from 'webpack'

const webpack4DefaultExtensions = ['.wasm', '.mjs', '.js', '.json']

/**
 * Lets the webpack preprocessor's default options compile specs with the
 * project's .babelrc file, including TypeScript specs and the TypeScript
 * sources they import.
 */
export function useBabelrcOptions<T extends { webpackOptions?: Configuration }>(
  options: T,
  webpackVersion: string
): T {
  const webpackOptions = options.webpackOptions
  if (!webpackOptions) {
    return options
  }

  const babelRule = webpackOptions.module?.rules?.[0]
  if (babelRule && typeof babelRule === 'object') {
    // presets in the loader options would override the ones in .babelrc
    const use = Array.isArray(babelRule.use) ? babelRule.use[0] : undefined
    if (
      use &&
      typeof use === 'object' &&
      use.options &&
      typeof use.options === 'object'
    ) {
      delete use.options.presets
    }
    babelRule.test = /\.[jt]sx?$/
  }

  // Webpack's own extensions come first because a .ts file next to a compiled
  // .js file must not win: babel can't compile it without a TypeScript preset,
  // and never compiles it inside node_modules.
  const webpackMajor = Number(webpackVersion.split('.')[0])
  const defaultExtensions =
    webpackMajor >= 5 ? ['...'] : webpack4DefaultExtensions
  webpackOptions.resolve = {
    ...webpackOptions.resolve,
    extensions: [...defaultExtensions, '.jsx', '.ts', '.tsx']
  }

  return options
}
