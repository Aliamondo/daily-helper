import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { durationBetween, fromNow, fromNowShort } from './time'

const now = new Date('2026-01-15T12:00:00Z')
const ago = (seconds: number) => new Date(now.getTime() - seconds * 1000)

beforeEach(() => vi.useFakeTimers({ now }))
afterEach(() => vi.useRealTimers())

describe('fromNowShort', () => {
  it('avoids second-level precision for recent dates', () => {
    expect(fromNowShort(ago(5))).toBe('just now')
    expect(fromNowShort(ago(30))).toBe('less than a minute ago')
    expect(fromNowShort(ago(120))).toBe('2 minutes ago')
  })
})

describe('fromNow', () => {
  it('picks the largest fitting unit', () => {
    expect(fromNow(ago(30))).toBe('30 seconds ago')
    expect(fromNow(ago(3 * 3600))).toBe('3 hours ago')
    expect(fromNow(ago(24 * 3600))).toBe('yesterday')
    expect(fromNow(ago(60 * 86400))).toBe('2 months ago')
    expect(fromNow(ago(800 * 86400))).toBe('2 years ago')
  })
})

describe('durationBetween', () => {
  it('formats durations with plurals', () => {
    expect(durationBetween(ago(1), now)).toBe('1 second')
    expect(durationBetween(ago(2 * 3600), now)).toBe('2 hours')
    expect(durationBetween(ago(86400), now)).toBe('1 day')
  })

  it('is empty when a date is missing', () => {
    expect(durationBetween(null, now)).toBe('')
    expect(durationBetween(now, null)).toBe('')
  })
})
