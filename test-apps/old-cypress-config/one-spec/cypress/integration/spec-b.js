/// <reference types="cypress" />
it('spec b', () => {
  // should not run
  throw new Error('Spec b should not run')
})
