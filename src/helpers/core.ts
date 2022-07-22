export function equals<T>(a: T, b: T) {
  if (typeof a === 'number' && typeof b === 'number' && isNaN(a) && isNaN(b)) {
    return true
  }

  if (!a && !b) {
    return true
  }

  return a === b
}
