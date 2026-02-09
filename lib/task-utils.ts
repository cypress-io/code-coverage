// helper functions to use from "task.js" plugins code
// that need access to the file system

/// <reference types="node" />
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { isAbsolute, resolve, join } from 'path'
import debug from 'debug'
import chalk from 'chalk'
import { globSync } from 'tinyglobby'
import yaml from 'js-yaml'
import {
  combineNycOptions,
  defaultNycOptions,
  fileCoveragePlaceholder,
  type NycOptions
} from './common-utils'

const log = debug('code-coverage')

export interface CoverageEntry {
  path: string
  hash?: string
  [key: string]: unknown
}

export interface CoverageMap {
  [key: string]: CoverageEntry
}

export function readNycOptions(workingDirectory: string): NycOptions {
  const pkgFilename = join(workingDirectory, 'package.json')
  const pkg = existsSync(pkgFilename)
    ? JSON.parse(readFileSync(pkgFilename, 'utf8'))
    : {}
  const pkgNycOptions: NycOptions = pkg.nyc || {}

  const nycrcFilename = join(workingDirectory, '.nycrc')
  const nycrc: NycOptions = existsSync(nycrcFilename)
    ? JSON.parse(readFileSync(nycrcFilename, 'utf8'))
    : {}

  const nycrcJsonFilename = join(workingDirectory, '.nycrc.json')
  const nycrcJson: NycOptions = existsSync(nycrcJsonFilename)
    ? JSON.parse(readFileSync(nycrcJsonFilename, 'utf8'))
    : {}

  const nycrcYamlFilename = join(workingDirectory, '.nycrc.yaml')
  let nycrcYaml: NycOptions = {}
  if (existsSync(nycrcYamlFilename)) {
    try {
      nycrcYaml = yaml.load(readFileSync(nycrcYamlFilename, 'utf8')) as NycOptions
    } catch (error) {
      throw new Error(`Failed to load .nycrc.yaml: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const nycrcYmlFilename = join(workingDirectory, '.nycrc.yml')
  let nycrcYml: NycOptions = {}
  if (existsSync(nycrcYmlFilename)) {
    try {
      nycrcYml = yaml.load(readFileSync(nycrcYmlFilename, 'utf8')) as NycOptions
    } catch (error) {
      throw new Error(`Failed to load .nycrc.yml: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const nycConfigFilename = join(workingDirectory, 'nyc.config.js')
  let nycConfig: NycOptions = {}
  if (existsSync(nycConfigFilename)) {
    try {
      nycConfig = require(nycConfigFilename) as NycOptions
    } catch (error) {
      throw new Error(`Failed to load nyc.config.js: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const nycConfigCommonJsFilename = join(workingDirectory, 'nyc.config.cjs')
  let nycConfigCommonJs: NycOptions = {}
  if (existsSync(nycConfigCommonJsFilename)) {
    try {
      nycConfigCommonJs = require(nycConfigCommonJsFilename) as NycOptions
    } catch (error) {
      throw new Error(`Failed to load nyc.config.cjs: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const nycOptions = combineNycOptions(
    defaultNycOptions,
    nycrc,
    nycrcJson,
    nycrcYaml,
    nycrcYml,
    nycConfig,
    nycConfigCommonJs,
    pkgNycOptions
  )
  log('combined NYC options %o', nycOptions)

  return nycOptions
}

export function checkAllPathsNotFound(nycFilename: string): boolean | undefined {
  const nycCoverage: CoverageMap = JSON.parse(readFileSync(nycFilename, 'utf8'))

  const coverageKeys = Object.keys(nycCoverage)
  if (!coverageKeys.length) {
    log('⚠️ file %s has no coverage information', nycFilename)
    return
  }

  const allFilesAreMissing = coverageKeys.every((key) => {
    const coverage = nycCoverage[key]
    return !existsSync(coverage.path)
  })

  log(
    'in file %s all files are not found? %o',
    nycFilename,
    allFilesAreMissing
  )
  return allFilesAreMissing
}

/**
 * A small debug utility to inspect paths saved in NYC output JSON file
 */
export function showNycInfo(nycFilename: string): void {
  const nycCoverage: CoverageMap = JSON.parse(readFileSync(nycFilename, 'utf8'))

  const coverageKeys = Object.keys(nycCoverage)
  if (!coverageKeys.length) {
    console.error(
      '⚠️ file %s has no coverage information',
      chalk.yellow(nycFilename)
    )
    console.error(
      'Did you forget to instrument your web application? Read %s',
      chalk.blue(
        'https://github.com/cypress-io/code-coverage#instrument-your-application'
      )
    )
    return
  }
  log('NYC file %s has %d key(s)', nycFilename, coverageKeys.length)

  const maxPrintKeys = 3
  const showKeys = coverageKeys.slice(0, maxPrintKeys)

  showKeys.forEach((key, k) => {
    const coverage = nycCoverage[key]

    // printing a few found keys and file paths from the coverage file
    // will make debugging any problems much much easier
    if (k < maxPrintKeys) {
      log('%d key %s file path %s', k + 1, key, coverage.path)
    }
  })
}

/**
 * Looks at all coverage objects in the given JSON coverage file
 * and if the file is relative, and exists, changes its path to
 * be absolute.
 */
export function resolveRelativePaths(nycFilename: string): void {
  const nycCoverage: CoverageMap = JSON.parse(readFileSync(nycFilename, 'utf8'))

  const coverageKeys = Object.keys(nycCoverage)
  if (!coverageKeys.length) {
    log('⚠️ file %s has no coverage information', nycFilename)
    return
  }
  log('NYC file %s has %d key(s)', nycFilename, coverageKeys.length)

  let changed = false

  coverageKeys.forEach((key) => {
    const coverage = nycCoverage[key]

    if (!coverage.path) {
      log('key %s does not have path', key)
      return
    }

    if (!isAbsolute(coverage.path)) {
      if (existsSync(coverage.path)) {
        log('resolving path %s', coverage.path)
        coverage.path = resolve(coverage.path)
        changed = true
      }
      return
    }

    // path is absolute, let's check if it exists
    if (!existsSync(coverage.path)) {
      log('⚠️ cannot find file %s with hash %s', coverage.path, coverage.hash)
    }
  })

  if (changed) {
    log('resolveRelativePaths saving updated file %s', nycFilename)
    log('there are %d keys in the file', coverageKeys.length)
    writeFileSync(
      nycFilename,
      JSON.stringify(nycCoverage, null, 2) + '\n',
      'utf8'
    )
  }
}

/**
 * @param filepaths
 * @returns common prefix that corresponds to current folder
 */
export function findCommonRoot(filepaths: string[]): string | undefined {
  if (!filepaths.length) {
    log('cannot find common root without any files')
    return
  }

  // assuming / as file separator
  const splitParts = filepaths.map((name) => name.split('/'))
  const lengths = splitParts.map((arr) => arr.length)
  const shortestLength = Math.min.apply(null, lengths)
  log('shorted file path has %d parts', shortestLength)

  const cwd = process.cwd()
  const commonPrefix: string[] = []
  let foundCurrentFolder: string | undefined

  for (let k = 0; k < shortestLength; k += 1) {
    const part = splitParts[0][k]
    const prefix = commonPrefix.concat(part).join('/')
    log('testing prefix %o', prefix)
    const allFilesStart = filepaths.every((name) => name.startsWith(prefix))
    if (!allFilesStart) {
      log('stopped at non-common prefix %s', prefix)
      break
    }

    commonPrefix.push(part)

    const removedPrefixNames = filepaths.map((filepath) =>
      filepath.slice(prefix.length)
    )
    log('removedPrefix %o', removedPrefixNames)
    const foundAllPaths = removedPrefixNames.every((filepath) =>
      existsSync(join(cwd, filepath))
    )
    log('all files found at %s? %o', prefix, foundAllPaths)
    if (foundAllPaths) {
      log('found prefix that matches current folder: %s', prefix)
      foundCurrentFolder = prefix
      break
    }
  }

  return foundCurrentFolder
}

export function tryFindingLocalFiles(nycFilename: string): void {
  const nycCoverage: CoverageMap = JSON.parse(readFileSync(nycFilename, 'utf8'))
  const coverageKeys = Object.keys(nycCoverage)
  const filenames = coverageKeys.map((key) => nycCoverage[key].path)
  const commonFolder = findCommonRoot(filenames)
  if (!commonFolder) {
    log('could not find common folder %s', commonFolder)
    return
  }
  const cwd = process.cwd()
  log(
    'found common folder %s that matches current working directory %s',
    commonFolder,
    cwd
  )
  const length = commonFolder.length
  let changed = false

  coverageKeys.forEach((key) => {
    const from = nycCoverage[key].path
    if (from.startsWith(commonFolder)) {
      const to = join(cwd, from.slice(length))
      // ? Do we need to replace the "key" in the coverage object or can we just replace the "path"?
      nycCoverage[key].path = to
      log('replaced %s -> %s', from, to)
      changed = true
    }
  })

  if (changed) {
    log('tryFindingLocalFiles saving updated file %s', nycFilename)
    log('there are %d keys in the file', coverageKeys.length)
    writeFileSync(
      nycFilename,
      JSON.stringify(nycCoverage, null, 2) + '\n',
      'utf8'
    )
  }
}

/**
 * Tries to find source files to be included in the final coverage report
 * using NYC options: extension list, include and exclude.
 */
function findSourceFiles(nycOptions: NycOptions): string[] {
  log('include all files options: %o', {
    all: nycOptions.all,
    include: nycOptions.include,
    exclude: nycOptions.exclude,
    extension: nycOptions.extension
  })

  if (!Array.isArray(nycOptions.extension)) {
    console.error(
      'Expected NYC "extension" option to be a list of file extensions'
    )
    console.error(nycOptions)
    return []
  }

  const patterns: string[] = []
  if (Array.isArray(nycOptions.include)) {
    patterns.push(...nycOptions.include)
  } else if (typeof nycOptions.include === 'string') {
    patterns.push(nycOptions.include)
  } else {
    log('using default list of extensions')
    nycOptions.extension.forEach((extension) => {
      patterns.push('**/*' + extension)
    })
  }

  if (Array.isArray(nycOptions.exclude)) {
    const negated = nycOptions.exclude.map((s) => '!' + s)
    patterns.push(...negated)
  } else if (typeof nycOptions.exclude === 'string') {
    patterns.push('!' + nycOptions.exclude)
  }
  // always exclude node_modules
  // https://github.com/istanbuljs/nyc#including-files-within-node_modules
  patterns.push('!**/node_modules/**')

  log('searching files to include using patterns %o', patterns)

  const allFiles = globSync(patterns, { absolute: true })
  return allFiles
}

/**
 * If the website or unit tests did not load ALL files we need to
 * include, then we should include the missing files ourselves
 * before generating the report.
 *
 * @see https://github.com/cypress-io/code-coverage/issues/207
 */
export function includeAllFiles(nycFilename: string, nycOptions: NycOptions): void {
  if (!nycOptions.all) {
    log('NYC "all" option is not set, skipping including all files')
    return
  }

  const allFiles = findSourceFiles(nycOptions)
  if (log.enabled) {
    log('found %d file(s)', allFiles.length)
    console.error(allFiles.join('\n'))
  }
  if (!allFiles.length) {
    log('no files found, hoping for the best')
    return
  }

  const nycCoverage: CoverageMap = JSON.parse(readFileSync(nycFilename, 'utf8'))
  const coverageKeys = Object.keys(nycCoverage)
  const coveredPaths = coverageKeys.map((key) =>
    nycCoverage[key].path.replace(/\\/g, '/')
  )

  log('coverage has %d record(s)', coveredPaths.length)
  // report on first couple of entries
  if (log.enabled) {
    console.error('coverage has the following first paths')
    console.error(coveredPaths.slice(0, 4).join('\n'))
  }

  let changed = false
  allFiles.forEach((fullPath) => {
    if (coveredPaths.includes(fullPath)) {
      // all good, this file exists in coverage object
      return
    }
    log('adding empty coverage for file %s', fullPath)
    changed = true
    // insert placeholder object for now
    const placeholder = fileCoveragePlaceholder(fullPath)
    nycCoverage[fullPath] = placeholder
  })

  if (changed) {
    log('includeAllFiles saving updated file %s', nycFilename)
    log('there are %d keys in the file', Object.keys(nycCoverage).length)

    writeFileSync(
      nycFilename,
      JSON.stringify(nycCoverage, null, 2) + '\n',
      'utf8'
    )
  }
}

