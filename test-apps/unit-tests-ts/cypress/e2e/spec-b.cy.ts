/// <reference types="cypress" />
import { sub } from '../../src/utils/math'

describe('Unit tests', () => {
  it('subtracts numbers', () => {
    const result: number = sub(10, 4)
    expect(result).to.equal(6)
  })
})
