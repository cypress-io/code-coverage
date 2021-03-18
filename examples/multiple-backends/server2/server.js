const express = require('express')
const app = express()
const port = 3004

// if there is code coverage information
// then expose an endpoint that returns it
/* istanbul ignore next */
if (global.__coverage__) {
  console.log('have code coverage, will add middleware for express')
  console.log(`to fetch: GET :${port}/__coverage__`)
  require('../../../middleware/express')(app)
}

app.use(express.static(__dirname))

app.get('/goodbye', (req, res) => {
  console.log('sending goodby world')
  res.send('Boodbye World!')
})

app.listen(port, () => console.log(`Example service listening on port ${port}!`))
