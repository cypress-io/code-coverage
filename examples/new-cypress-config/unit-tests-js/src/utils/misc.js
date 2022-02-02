/**
 * Very simple check, returns true for arrays as well
 */
export function isObject(object) {
  return object != null && typeof object === 'object'
}

/**
 * Adds two numbers together
 * @param {number} a
 * @param {number} b
 */
export const add = (a, b) => a + b
