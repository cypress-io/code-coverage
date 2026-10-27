const express = require('express')
const app = express()
const port = 3004

/* istanbul ignore next */
if (global.__coverage__) {
  console.log('have code coverage, will add middleware for express')
  console.log(`to fetch: GET :${port}/__coverage__`)
  require('@cypress/code-coverage/middleware/express')(app)
}

app.use(express.static(__dirname))

app.get('/world', (req, res) => {
  console.log('sending world')
  res.send('World!')
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
