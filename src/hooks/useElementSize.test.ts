import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useElementHeights, useElementWidth } from './useElementSize'

type Resize = (
  entries: { contentRect: { width: number; height: number } }[],
) => void

const observers: { callback: Resize; disconnect: () => void }[] = []

beforeEach(() => {
  observers.length = 0
  vi.stubGlobal(
    'ResizeObserver',
    class {
      disconnect = vi.fn()
      constructor(public callback: Resize) {
        observers.push(this)
      }
      observe() {}
    },
  )
})
afterEach(() => vi.unstubAllGlobals())

const resize = (index: number, width: number, height: number) =>
  act(() => observers[index].callback([{ contentRect: { width, height } }]))

it('tracks the height of each measured element', () => {
  const { result } = renderHook(() => useElementHeights())
  const el = document.createElement('div')

  act(() => result.current[1]('a', el))
  resize(0, 100, 250)
  expect(result.current[0]).toEqual({ a: 250 })

  // Measuring the same id again replaces its observer
  act(() => result.current[1]('a', el))
  expect(observers[0].disconnect).toHaveBeenCalled()
  act(() => result.current[1]('a', null))
  expect(observers[1].disconnect).toHaveBeenCalled()
})

it('tracks the width of an element', () => {
  const { result } = renderHook(() => useElementWidth())
  expect(result.current[0]).toBe(0)

  act(() => result.current[1](document.createElement('div')))
  resize(0, 800, 100)
  expect(result.current[0]).toBe(800)

  act(() => result.current[1](null))
  expect(observers).toHaveLength(1)
})
