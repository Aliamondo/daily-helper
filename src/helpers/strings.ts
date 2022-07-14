export function toSentenceCase(text: string): string {
  return text.replace(/(?<=(?:^|[.?!])\W*)[a-z]/g, i => i.toUpperCase())
}

export function enumerationToSentenceCase(text: string): string {
  return toSentenceCase(text.toLowerCase().replaceAll('_', ' '))
}

export function minify(text: string): string {
  return text
    .replace(/\s*{\s+/g, '{') // remove all spaces around {
    .replace(/\s*}\s+/g, '}') // remove all spaces around }
    .replace(/\s+/g, ' ') // convert multiple spaces to single space
}
