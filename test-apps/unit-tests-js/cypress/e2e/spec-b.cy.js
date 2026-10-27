/// <reference types="Cypress" />

import { sub } from '../../src/utils/math'

describe('Unit tests', () => {
  it('subtracts numbers', () => {
    expect(sub(10, 4)).to.equal(6)
  })
})
