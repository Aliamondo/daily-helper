export function equals<T>(a: T, b: T) {
  if (typeof a === 'number' && typeof b === 'number' && isNaN(a) && isNaN(b)) {
    return true
  }

  if (!a && !b) {
    return true
  }

  return a === b
}

export function hasSameItems(saved: string[] = [], selected: Set<string>) {
  return (
    saved.length === selected.size && saved.every(item => selected.has(item))
  )
}

/** Returns a copy with the item added, or removed if it was already there */
export function toggleInSet<T>(set: Set<T>, item: T): Set<T> {
  const next = new Set(set)
  if (next.has(item)) next.delete(item)
  else next.add(item)
  return next
}

export function hexToRgb(hex: string) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
  hex = hex.replace(shorthandRegex, function (m, r, g, b) {
    return r + r + g + g + b + b
  })

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255,
      }
    : {
        r: 0,
        g: 0,
        b: 0,
      }
}

/** Black or white, whichever reads better on the background */
export function getFontColor(backgroundColor: string): string {
  const { r, g, b } = hexToRgb(backgroundColor)
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return luminance > 0.5 ? 'black' : 'white'
}

/** Splits a set into the items that match and the ones that don't */
export function partitionSet<T>(
  set: Set<T>,
  matches: (item: T) => boolean,
): [Set<T>, Set<T>] {
  const matching = new Set<T>()
  const rest = new Set<T>()
  set.forEach(item => (matches(item) ? matching : rest).add(item))
  return [matching, rest]
}

/**
 * Saved items that are no longer in the current list. Empty until the current
 * list has fully loaded (null), so nothing is flagged by mistake
 */
export function getRemovedItems(
  saved: string[],
  current: Set<string> | null,
): string[] {
  if (!current) return []
  return saved.filter(item => !current.has(item))
}
