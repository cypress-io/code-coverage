const express = require('express')
const path = require('path')
const app = express()
const port = 1234

// if there is code coverage information
// then expose an endpoint that returns it
/* istanbul ignore next */
if (global.__coverage__) {
  console.log('have code coverage, will add middleware for express')
  console.log(`to fetch: GET :${port}/__coverage__`)
  require('cypress-code-coverage-v8/middleware/express')(app)
}

app.use(express.static(path.join(__dirname, '../dist')))

app.get('/hello', (req, res) => {
  console.log('sending hello world')
  res.send('Hello World!')
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
