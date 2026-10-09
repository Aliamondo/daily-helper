import { describe, expect, it } from 'vitest'
import {
  equals,
  getFontColor,
  getRemovedItems,
  hasSameItems,
  hexToRgb,
  partitionSet,
  toggleInSet,
} from './core'

describe('equals', () => {
  it('compares values strictly', () => {
    expect(equals(2, 2)).toBe(true)
    expect(equals(2, 3)).toBe(false)
    expect(equals('a', 'b')).toBe(false)
  })

  it('treats NaN as equal to itself', () => {
    expect(equals(NaN, NaN)).toBe(true)
  })

  it('treats empty values as equal', () => {
    // No saved team yet (undefined) is the same as nothing selected (0)
    expect(equals<number | undefined>(undefined, 0)).toBe(true)
    expect(equals<string | null>(null, '')).toBe(true)
    expect(equals<number | undefined>(undefined, 1)).toBe(false)
  })
})

describe('hasSameItems', () => {
  it('compares the items, not just how many there are', () => {
    expect(hasSameItems(['a', 'b'], new Set(['b', 'a']))).toBe(true)
    expect(hasSameItems(['a', 'b'], new Set(['a', 'c']))).toBe(false)
    expect(hasSameItems(['a'], new Set(['a', 'b']))).toBe(false)
  })

  it('treats nothing saved as an empty selection', () => {
    expect(hasSameItems(undefined, new Set())).toBe(true)
    expect(hasSameItems(undefined, new Set(['a']))).toBe(false)
  })
})

describe('toggleInSet', () => {
  it('adds a missing item and removes a present one, without touching the original', () => {
    const original = new Set(['a'])
    expect(toggleInSet(original, 'b')).toEqual(new Set(['a', 'b']))
    expect(toggleInSet(original, 'a')).toEqual(new Set())
    expect(original).toEqual(new Set(['a']))
  })
})

describe('partitionSet', () => {
  it('splits items into matching and the rest', () => {
    expect(partitionSet(new Set([1, 2, 3, 4]), n => n % 2 === 0)).toEqual([
      new Set([2, 4]),
      new Set([1, 3]),
    ])
  })
})

describe('hexToRgb', () => {
  it('parses full and shorthand colors, with or without #', () => {
    expect(hexToRgb('#ff0000')).toEqual({ r: 1, g: 0, b: 0 })
    expect(hexToRgb('0f0')).toEqual({ r: 0, g: 1, b: 0 })
  })

  it('falls back to black for invalid colors', () => {
    expect(hexToRgb('nope')).toEqual({ r: 0, g: 0, b: 0 })
  })
})

describe('getFontColor', () => {
  it('picks the text color that reads better on the background', () => {
    expect(getFontColor('ffffff')).toBe('black')
    expect(getFontColor('a2eeef')).toBe('black')
    expect(getFontColor('000000')).toBe('white')
    expect(getFontColor('7057ff')).toBe('white')
  })
})

describe('getRemovedItems', () => {
  it('lists saved items missing from the current list', () => {
    expect(getRemovedItems(['a', 'b', 'c'], new Set(['a']))).toEqual(['b', 'c'])
  })

  it('flags nothing until the current list has loaded', () => {
    expect(getRemovedItems(['a'], null)).toEqual([])
  })
})
