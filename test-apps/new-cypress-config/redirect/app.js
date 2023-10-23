// The redirect code needs to be un-instrumented, otherwise the statement map will be different depending on which code path the redirect took. 
// If the redirect code is instrumented, Cypress would then treat them as different coverage objects and merge the code coverage (not testing what we want).
// If the redirect code is un-instrumented, Cypress can't tell them apart and will update the existing coverage object to point to the correct one.
// Timeouts are necessary to allow cypress to pick up the "initial" coverage object and compare it to the existing coverage objects.

new Promise((resolve) => {
  if (window.location.port === '1234' && !localStorage.getItem('visited')) {
    localStorage.setItem('visited', true)
    console.log('Not visited. Redirecting')
    setTimeout(() => {
      window.location.href = 'http://localhost:1235'
    }, 500)
  } else if (window.location.port === '1235') {
    console.log('Redirecting back.')
    setTimeout(() => {
      window.location.href = 'http://localhost:1234'
    }, 500)
  } else {
    console.log('Visited');
    setTimeout(() => {
      resolve()
    }, 500)
  }
}).then(() => {
  document.body
    .appendChild(document.createTextNode('Returned to app'))
})
