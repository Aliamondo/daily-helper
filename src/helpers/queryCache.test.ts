import { beforeEach, describe, expect, it } from 'vitest'
import { queryCache } from './queryCache'

beforeEach(() => queryCache.clear())

describe('queryCache', () => {
  it('returns what was stored under a key', () => {
    queryCache.set('viewer:login', 'me')
    expect(queryCache.get('viewer:login')).toBe('me')
    expect(queryCache.get('other')).toBeUndefined()
  })

  it('forgets everything on clear', () => {
    queryCache.set('a', 1)
    queryCache.set('b', 2)
    queryCache.clear()
    expect(queryCache.get('a')).toBeUndefined()
    expect(queryCache.get('b')).toBeUndefined()
  })
})
