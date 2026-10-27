// main.js is not instrumented (see .babelrc), so "window.__coverage__"
// does not exist when the page fires its "load" event.
// The instrumented code arrives later in a lazy-loaded chunk,
// the way Storybook 7 and other SPAs load their components.
window.addEventListener('load', () => {
  setTimeout(() => {
    import('./lazy.js').then(({ render }) => {
      render(document.getElementById('app'))
    })
  }, 500)
})
