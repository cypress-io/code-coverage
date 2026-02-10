// for Hapi.js
module.exports = server => {
  // expose "GET __coverage__" endpoint that just returns
  // global coverage information (if the application has been instrumented)

  // https://hapijs.com/tutorials/routing?lang=en_US
  server.route({
    method: 'GET',
    path: '/__coverage__',
    handler () {
      return { coverage: global.__coverage__ }
    }
  })
}
