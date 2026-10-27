/**
 * Very simple check, returns true for arrays as well
 */
export function isObject(object) {
  return object != null && typeof object === 'object'
}

export const add = (a, b) => a + b
