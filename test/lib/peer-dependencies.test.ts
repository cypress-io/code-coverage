import { describe, it, expect } from 'vitest'

import pkg from '../../package.json'

// only @cypress/code-coverage/use-babelrc needs these
const useBabelrcOnly = [
  '@babel/core',
  '@babel/preset-env',
  '@cypress/webpack-preprocessor',
  'babel-loader',
  'webpack'
]

describe('peer dependencies', () => {
  it('does not install use-babelrc dependencies for everyone', () => {
    const dependencies: Record<string, string> = pkg.dependencies
    useBabelrcOnly.forEach((name) => {
      expect(dependencies).not.toHaveProperty(name)
    })
  })

  it('marks use-babelrc peer dependencies as optional', () => {
    const peerDependencies: Record<string, string> = pkg.peerDependencies
    const peerDependenciesMeta: Record<string, { optional?: boolean }> =
      pkg.peerDependenciesMeta
    useBabelrcOnly.forEach((name) => {
      expect(peerDependencies).toHaveProperty(name)
      expect(peerDependenciesMeta[name]?.optional, name).toBe(true)
    })
  })

  it('keeps cypress as a required peer dependency', () => {
    const peerDependenciesMeta: Record<string, { optional?: boolean }> =
      pkg.peerDependenciesMeta
    expect(pkg.peerDependencies).toHaveProperty('cypress')
    expect(peerDependenciesMeta.cypress?.optional).not.toBe(true)
  })

  it('allows Babel 8', () => {
    expect(pkg.peerDependencies['@babel/core']).toMatch(/\^8/)
    expect(pkg.peerDependencies['@babel/preset-env']).toMatch(/\^8/)
  })
})
