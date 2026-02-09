import type { Express } from 'express'

// for Express.js
export default function expressMiddleware(app: Express): void {
  // expose "GET __coverage__" endpoint that just returns
  // global coverage information (if the application has been instrumented)
  app.get('/__coverage__', (req, res) => {
    res.json({
      coverage: (global as typeof globalThis & { __coverage__?: unknown }).__coverage__ || null
    })
  })
}

