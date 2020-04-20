import { reverse } from './calc'

if (window.Cypress) {
  require('console-log-div')
  console.log('attaching event listeners')
}

document.getElementById('user-input').addEventListener('change', e => {
  const s = e.target.value
  console.log(`input string "${s}"`)
  const reversed = reverse(s)
  document.getElementById('reversed').innerText = reversed
})
console.log('added event listener')
