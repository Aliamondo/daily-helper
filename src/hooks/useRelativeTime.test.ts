import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useRelativeTime } from './useRelativeTime'

beforeEach(() => vi.useFakeTimers({ now: new Date('2026-01-15T12:00:00Z') }))
afterEach(() => vi.useRealTimers())

it('keeps the relative time up to date', () => {
  const date = new Date()
  const { result } = renderHook(() => useRelativeTime(date))
  expect(result.current).toBe('just now')

  act(() => vi.advanceTimersByTime(30_000))
  expect(result.current).toBe('less than a minute ago')
})

it('is empty without a date', () => {
  const { result } = renderHook(() => useRelativeTime(null))
  expect(result.current).toBe('')
})
