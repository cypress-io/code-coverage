import type { Server } from 'hapi'
export = function hapiMiddleware(server: Server): void {
  server.route({
    method: 'GET',
    path: '/__coverage__',
    handler() {
      return {
        coverage:
          (global as typeof globalThis & { __coverage__?: unknown })
            .__coverage__ || null
      }
    }
  })
}
