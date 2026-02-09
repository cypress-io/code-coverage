/// <reference types="node" />

export interface NycOptions {
  'report-dir'?: string
  reporter?: string | string[]
  extension?: string | string[]
  exclude?: string | string[]
  excludeAfterRemap?: boolean
  all?: boolean
  include?: string | string[]
  [key: string]: unknown
}

function stringToArray(prop: string, obj: Record<string, unknown>): void {
  if (typeof obj[prop] === 'string') {
    obj[prop] = [obj[prop]]
  }
}

export function combineNycOptions(...options: NycOptions[]): NycOptions {
  // last option wins
  const nycOptions = Object.assign({}, ...options)

  // normalize string and [string] props
  stringToArray('reporter', nycOptions)
  stringToArray('extension', nycOptions)
  stringToArray('exclude', nycOptions)

  return nycOptions
}

export const defaultNycOptions: NycOptions = {
  'report-dir': './coverage',
  reporter: ['lcov', 'clover', 'json', 'json-summary'],
  extension: ['.js', '.cjs', '.mjs', '.ts', '.tsx', '.jsx'],
  excludeAfterRemap: false
}

export interface FileCoveragePlaceholder {
  path: string
  statementMap: Record<string, unknown>
  fnMap: Record<string, unknown>
  branchMap: Record<string, unknown>
  s: Record<string, unknown>
  f: Record<string, unknown>
  b: Record<string, unknown>
}

/**
 * Returns an object with placeholder properties for files we
 * do not have coverage yet. The result can go into the coverage object
 *
 * @param fullPath Filename
 */
export function fileCoveragePlaceholder(fullPath: string): FileCoveragePlaceholder {
  return {
    path: fullPath,
    statementMap: {},
    fnMap: {},
    branchMap: {},
    s: {},
    f: {},
    b: {}
  }
}

function isPlaceholder(entry: FileCoveragePlaceholder | { hash?: string }): boolean {
  // when the file has been instrumented, its entry has "hash" property
  return !('hash' in entry)
}

/**
 * Given a coverage object with potential placeholder entries
 * inserted instead of covered files, removes them. Modifies the object in place
 */
export function removePlaceholders(coverage: Record<string, FileCoveragePlaceholder | { hash?: string }>): void {
  Object.keys(coverage).forEach((key) => {
    if (isPlaceholder(coverage[key])) {
      delete coverage[key]
    }
  })
}

