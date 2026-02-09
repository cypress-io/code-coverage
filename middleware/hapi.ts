import type { Server } from 'hapi'
// for Hapi.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export = function hapiMiddleware(server: Server): void {
  // expose "GET __coverage__" endpoint that just returns
  // global coverage information (if the application has been instrumented)

  // https://hapijs.com/tutorials/routing?lang=en_US
  server.route({
    method: 'GET',
    path: '/__coverage__',
    handler() {
      return { coverage: (global as typeof globalThis & { __coverage__?: unknown }).__coverage__ || null }
    }
  })
}

