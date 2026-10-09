import { describe, expect, it } from 'vitest'
import { getDiffSizeSquares, getSquareCount } from './diffSize'

describe('getSquareCount', () => {
  it('grows with the diff, from 2 up to 10 squares', () => {
    expect(getSquareCount(0, 0)).toBe(0)
    expect(getSquareCount(1, 1)).toBe(2)
    expect(getSquareCount(30, 20)).toBe(5)
    expect(getSquareCount(5000, 0)).toBe(10)
  })
})

describe('getDiffSizeSquares', () => {
  it('splits the squares by the additions/deletions ratio', () => {
    expect(getDiffSizeSquares(30, 20)).toEqual({
      additionSquares: 3,
      deletionSquares: 2,
    })
    expect(getDiffSizeSquares(1, 0)).toEqual({
      additionSquares: 2,
      deletionSquares: 0,
    })
  })

  it('never rounds away a side that has changes', () => {
    expect(getDiffSizeSquares(1000, 1)).toEqual({
      additionSquares: 9,
      deletionSquares: 1,
    })
    expect(getDiffSizeSquares(1, 1000)).toEqual({
      additionSquares: 1,
      deletionSquares: 9,
    })
  })
})
