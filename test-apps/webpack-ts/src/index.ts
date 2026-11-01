import { reverse } from './calc'

const input = document.getElementById('user-input') as HTMLInputElement
const output = document.getElementById('reversed') as HTMLElement

input.addEventListener('change', () => {
  output.innerText = reverse(input.value)
})
