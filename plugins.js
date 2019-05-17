const WebSocket = require('ws')
const path = require('path')
const fs = require('fs')
const globby = require('globby')

// https://github.com/websockets/ws#simple-server
// create socket even if not watching files to avoid
// tripping up client trying to connect
const wss = new WebSocket.Server({ port: 8765 })
let client // future Cypress client

// watch files using chokidar
const chokidar = require('chokidar')
// const cypressJson = require(join(process.cwd(), 'cypress.json'))
// const options = cypressJson['cypress-watch-and-reload']
const options = {
  watch: 'cypress/*.js'
}

// load initial source code for app files
const sources = new Map()
const sourceFilenames = globby
  .sync(options.watch, { cwd: process.cwd() })
  .map(s => path.resolve(process.cwd(), s))
sourceFilenames.forEach(filename => {
  sources[filename] = fs.readFileSync(filename, 'utf8')
})

const compareSources = (before, after) => {
  if (!before) {
    console.log('missing before source')
    return
  }
  if (!after) {
    console.log('missing after source')
    return
  }
  // only detect changed lines for now
  const beforeLines = before.split('\n')
  const afterLines = after.split('\n')
  if (beforeLines.length !== afterLines.length) {
    console.log('source has changed length')
    return
  }
  const changed = []
  beforeLines.forEach((s, k) => {
    if (s !== afterLines[k]) {
      console.log('line %d changed: %s', k, s)
      changed.push(k)
    }
  })
  return changed
}

if (options && typeof options.watch === 'string') {
  console.log('will watch "%s"', options.watch)

  wss.on('connection', function connection (ws) {
    console.log('new socket connection 🎉')
    client = ws

    console.log('starting to watch file index.html')
    // TODO clear previous watcher
    chokidar.watch(options.watch).on('change', (relativePath, event) => {
      console.log('file %s has changed', relativePath)
      const filename = path.resolve(process.cwd(), relativePath)
      const source = fs.readFileSync(filename, 'utf8')

      const changedLines = compareSources(sources[filename], source)
      // update our cached sourced
      sources[filename] = source

      if (changedLines && changedLines.length) {
        console.log('Changed lines', changedLines)
      }

      if (client) {
        const text = JSON.stringify({
          command: 'changed',
          filename,
          source,
          changedLines
        })
        client.send(text)
      }
    })
  })
} else {
  console.log(
    'nothing to watch. Use cypress.json to set "cypress-watch-and-reload" object'
  )
  console.log('see https://github.com/bahmutov/cypress-watch-and-reload#use')
}
