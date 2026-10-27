export const greet = (name) => `Hello, ${name}`

// only called by the navigate-away spec
export const farewell = (name) => {
  return `Goodbye, ${name}`
}

export const render = (el) => {
  el.textContent = greet('lazy chunk')
  window.greet = greet
  window.farewell = farewell
}
