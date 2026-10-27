// the host page is not instrumented, so "window.__coverage__"
// does not exist until the remote module below is loaded
document.getElementById('load-remote').addEventListener('click', () => {
  import('./remote.js').then(({ multiply }) => {
    window.multiply = multiply
    document.body.setAttribute('data-remote', 'loaded')
  })
})
