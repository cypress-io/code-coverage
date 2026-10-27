import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import istanbul from 'vite-plugin-istanbul'

export default defineConfig({
  plugins: [
    react(),
    istanbul({
      include: 'src/*',
      exclude: ['node_modules', 'cypress', '**/*.cy.jsx'],
      extension: ['.js', '.jsx']
    })
  ],
  // This app loads Cypress and the plugin from the repo root instead of its
  // own node_modules. Vite only pre-bundles CommonJS packages it finds in
  // node_modules, and `cypress/react` can't see this app's React from there.
  optimizeDeps: {
    include: ['@cypress/code-coverage/support']
  },
  resolve: {
    dedupe: ['react', 'react-dom']
  }
})
