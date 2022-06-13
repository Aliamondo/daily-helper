export function toSentenceCase(text: string): string {
  return text.replace(/(?<=(?:^|[.?!])\W*)[a-z]/g, i => i.toUpperCase())
}

export function enumerationToSentenceCase(text: string): string {
  return toSentenceCase(text.toLowerCase().replaceAll('_', ' '))
}
