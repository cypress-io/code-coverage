/// <reference types="cypress" />
// this spec only loads "src/a" module
import { myFunc } from '../../src/a.js'
describe('spec-a', () => {
  it('exercises src/a.js', () => {
    expect(myFunc(), 'always returns 30').to.equal(30)
  })
})
