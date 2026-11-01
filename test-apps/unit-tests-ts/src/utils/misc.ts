/**
 * Very simple check, returns true for arrays as well
 */
export function isObject(object: unknown): object is object {
  return object != null && typeof object === 'object'
}

export const add = (a: number, b: number): number => a + b
