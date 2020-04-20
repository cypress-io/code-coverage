import { reverse } from './calc'

document.getElementById('user-input').addEventListener('change', e => {
  const s = e.target.value
  const reversed = reverse(s)
  document.getElementById('reversed').innerText = reversed
})
