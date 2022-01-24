/**
 * Very simple check, returns true for arrays as well
 */
export function isObject(object: any) {
  return object != null && typeof object === 'object'
}

/**
 * Adds two numbers together
 */
export const add = (a: number, b: number) => a + b
