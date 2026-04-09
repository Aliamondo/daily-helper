const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

export function fromNow(date: Date): string {
  const seconds = Math.round((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return rtf.format(-seconds, 'second')
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return rtf.format(-minutes, 'minute')
  const hours = Math.round(minutes / 60)
  if (hours < 24) return rtf.format(-hours, 'hour')
  const days = Math.round(hours / 24)
  if (days < 30) return rtf.format(-days, 'day')
  const months = Math.round(days / 30)
  if (months < 12) return rtf.format(-months, 'month')
  return rtf.format(-Math.round(days / 365), 'year')
}

export function durationBetween(start: Date | null, end: Date | null): string {
  if (!start || !end) return ''
  const seconds = Math.round((end.getTime() - start.getTime()) / 1000)
  if (seconds < 60) return `${seconds} second${seconds !== 1 ? 's' : ''}`
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''}`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''}`
  const days = Math.round(hours / 24)
  return `${days} day${days !== 1 ? 's' : ''}`
}
