export const greet = (name) => `Hello, ${name}`

export const render = (el) => {
  el.textContent = greet('lazy chunk')
  window.greet = greet
}
