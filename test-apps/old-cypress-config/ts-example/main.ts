import { add } from './calc'

const sub = (a: number, b: number) => {
  return a - b
}

function abs(x: number) {
  if (x >= 0) {
    return x
  } else {
    return -x
  }
}

// @ts-ignore
window.add = add
// @ts-ignore
window.sub = sub
// @ts-ignore
window.abs = abs
