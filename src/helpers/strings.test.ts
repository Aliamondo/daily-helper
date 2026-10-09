import { describe, expect, it } from 'vitest'
import { enumerationToSentenceCase, minify, toSentenceCase } from './strings'

describe('strings', () => {
  it('capitalizes the start of each sentence', () => {
    expect(toSentenceCase('hello. is it me? yes! ok')).toBe(
      'Hello. Is it me? Yes! Ok',
    )
  })

  it('turns enum values into readable text', () => {
    expect(enumerationToSentenceCase('CHANGES_REQUESTED')).toBe(
      'Changes requested',
    )
  })

  it('minifies GraphQL queries', () => {
    expect(minify('query {\n  viewer {\n    login\n  }\n}\n')).toBe(
      'query{viewer{login}}',
    )
  })
})
