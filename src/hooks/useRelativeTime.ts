import { useEffect, useState } from 'react'
import { fromNowShort } from '../helpers/time'

export function useRelativeTime(date: Date | null): string {
  const [, setTick] = useState(0)

  useEffect(() => {
    if (!date) return
    const id = setInterval(() => setTick(t => t + 1), 10_000)
    return () => clearInterval(id)
  }, [date])

  return date ? fromNowShort(date) : ''
}
