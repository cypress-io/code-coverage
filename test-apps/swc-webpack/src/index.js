import { add } from './calc'

const result = document.getElementById('result')
if (location.search === '?second') {
  result.textContent = 'second page'
} else {
  result.textContent = `2 + 3 = ${add(2, 3)}`
}
