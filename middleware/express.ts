import type { Express } from 'express'

export = function expressMiddleware(app: Express): void {
  app.get('/__coverage__', (req, res) => {
    res.json({
      coverage:
        (global as typeof globalThis & { __coverage__?: unknown })
          .__coverage__ || null
    })
  })
}
