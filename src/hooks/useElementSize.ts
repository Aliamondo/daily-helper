import { useCallback, useRef, useState } from 'react'

/** Heights of several elements by id, kept up to date as they resize */
export function useElementHeights(): [
  Record<string, number>,
  (id: string, el: HTMLDivElement | null) => void,
] {
  const [heights, setHeights] = useState<Record<string, number>>({})
  const observersRef = useRef<Map<string, ResizeObserver>>(new Map())

  const measureRef = useCallback((id: string, el: HTMLDivElement | null) => {
    observersRef.current.get(id)?.disconnect()
    observersRef.current.delete(id)
    if (!el) return
    const observer = new ResizeObserver(entries => {
      const height = entries[0].contentRect.height
      setHeights(prev =>
        prev[id] === height ? prev : { ...prev, [id]: height },
      )
    })
    observer.observe(el)
    observersRef.current.set(id, observer)
  }, [])

  return [heights, measureRef]
}

/** Width of one element, kept up to date as it resizes */
export function useElementWidth(): [
  number,
  (node: HTMLDivElement | null) => void,
] {
  const [width, setWidth] = useState(0)

  const measureRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return
    const observer = new ResizeObserver(entries => {
      setWidth(entries[0].contentRect.width)
    })
    observer.observe(node)
  }, [])

  return [width, measureRef]
}
