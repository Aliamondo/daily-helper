import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useDebounce } from './useDebounce'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

it('only passes on the last value once typing pauses', () => {
  const { result, rerender } = renderHook(
    ({ value }) => useDebounce(value, 300),
    { initialProps: { value: 'a' } },
  )

  rerender({ value: 'ab' })
  act(() => vi.advanceTimersByTime(200))
  rerender({ value: 'abc' })
  act(() => vi.advanceTimersByTime(200))
  expect(result.current).toBe('a')

  act(() => vi.advanceTimersByTime(100))
  expect(result.current).toBe('abc')
})
