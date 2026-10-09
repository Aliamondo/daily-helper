import { describe, expect, it } from 'vitest'
import { describeLoadError } from './describeLoadError'
import { EmptyResponseError } from './withRetry'

const httpError = (status: number) =>
  Object.assign(new Error('<html>…</html>'), { status, response: {} })

describe('describeLoadError', () => {
  it('explains gateway errors without the response body', () => {
    expect(describeLoadError(httpError(502))).toBe(
      'GitHub is having trouble (HTTP 502). Try again in a moment.',
    )
  })

  it('explains network failures', () => {
    const error = Object.assign(new Error('Failed to fetch'), { status: 500 })
    expect(describeLoadError(error)).toMatch("Can't reach GitHub")
  })

  it('explains empty responses', () => {
    expect(describeLoadError(new EmptyResponseError())).toMatch(
      'empty response',
    )
  })

  it("passes on GitHub's own message for GraphQL errors", () => {
    const error = Object.assign(new Error('Request failed due to…'), {
      name: 'GraphqlResponseError',
      errors: [{ message: 'Something went wrong while executing your query' }],
    })
    expect(describeLoadError(error)).toBe(
      "GitHub couldn't run the search: Something went wrong while executing your query",
    )
  })

  it('never shows internal JavaScript errors', () => {
    const error = new TypeError(
      'can\'t access property "search", res is undefined',
    )
    expect(describeLoadError(error)).not.toMatch('search')
    expect(describeLoadError(error)).toMatch('browser console')
  })
})
