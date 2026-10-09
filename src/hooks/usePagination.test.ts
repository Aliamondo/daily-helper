import { expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { usePagination } from './usePagination'

it('remembers the cursors of the page to move from, and resets', () => {
  const { result } = renderHook(() => usePagination())
  expect(result.current.pageCursor).toEqual({ page: 'NEXT_PAGE' })

  act(() =>
    result.current.navigate('NEXT_PAGE', {
      startCursor: 's',
      endCursor: 'e',
      total: 40,
    }),
  )
  expect(result.current.pageCursor).toEqual({
    page: 'NEXT_PAGE',
    startCursor: 's',
    endCursor: 'e',
    total: 40,
  })

  act(() => result.current.reset())
  expect(result.current.pageCursor).toEqual({ page: 'NEXT_PAGE' })
})
