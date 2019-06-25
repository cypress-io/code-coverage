// for Express.js
module.exports = app => {
  // expose "GET __coverage__" endpoint that just returns
  // global coverage information (if the application has been instrumented)
  app.get('/__coverage__', (req, res) => {
    res.json({
      coverage: global.__coverage__ || null
    })
  })
}
