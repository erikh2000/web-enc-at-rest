import { expect } from 'chai'
import * as calc from '../src'

describe('calc tests', () => {
  describe('sum()', () => {
    context('when it receives "a" = 2 and "b" = 1', () => {
      it('should return 3', () => {
        expect(calc.sum(2, 1)).to.equal(3)
      })
    })
  })
  describe('sub()', () => {
    context('when it receives "a" = 2 and "b" = 1', () => {
      it('should return 1', () => {
        expect(calc.sub(2, 1)).to.equal(1)
      })
    })
  })
  describe('div()', () => {
    context('when it receives "a" = 4 and "b" = 2', () => {
      it('should return 2', () => {
        expect(calc.sub(4, 2)).to.equal(2)
      })
    })
  })
  describe('mult()', () => {
    context('when it receives "a" = 2 and "b" = 3', () => {
      it('should return 6', () => {
        expect(calc.mult(2, 3)).to.equal(6)
      })
    })
  })
})