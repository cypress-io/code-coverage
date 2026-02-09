# ESM Example

This test app demonstrates using `@cypress/code-coverage` with ES Module syntax (`import`/`export`).

## Key differences from CommonJS examples:

1. **package.json**: Uses `"type": "module"` to enable ES modules (all `.js` files are treated as ES modules)
2. **cypress.config.js**: Uses `import`/`export` syntax instead of `require`/`module.exports`
3. **cypress/plugins/index.js**: Uses ES module `import` syntax to import the code coverage plugin:
   ```javascript
   import codecov from '@cypress/code-coverage/plugins'
   ```
4. **cypress/support/e2e.js**: Uses ES module `import` syntax for support files:
   ```javascript
   import '@cypress/code-coverage/support'
   ```

## Usage

```bash
npm install
npm test
```
