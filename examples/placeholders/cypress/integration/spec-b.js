/// <reference types="cypress" />
// this spec loads "src/b" module
import { anotherFunction } from '../../src/b.js'
describe('spec-b', () => {
  it('exercises src/b.js', () => {
    expect(anotherFunction(), 'always returns hello backwards').to.equal(
      'olleh'
    )
  })
})
