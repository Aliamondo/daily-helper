import { describe, expect, it } from 'vitest'
import { readFilterParam, writeFilterParam } from './filterParam'

describe('filterParam', () => {
  it('reads each filter from the URL', () => {
    expect(readFilterParam('?filter=highest-priority')).toBe('mustReview')
    expect(readFilterParam('?filter=my-prs')).toBe('myPrs')
    expect(readFilterParam('?filter=my-work')).toBe('myWork')
  })

  it('reads no filter when the param is missing or unknown', () => {
    expect(readFilterParam('')).toBeNull()
    expect(readFilterParam('?filter=nope')).toBeNull()
  })

  it('writes the filter and keeps other params', () => {
    expect(writeFilterParam('?a=1', 'mustReview')).toBe(
      '?a=1&filter=highest-priority',
    )
    expect(writeFilterParam('?filter=my-prs', 'myWork')).toBe('?filter=my-work')
  })

  it('removes the param when no filter is active', () => {
    expect(writeFilterParam('?filter=my-prs', null)).toBe('')
    expect(writeFilterParam('?a=1&filter=my-prs', null)).toBe('?a=1')
  })
})
