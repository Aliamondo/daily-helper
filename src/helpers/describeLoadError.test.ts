import { describe, expect, it } from 'vitest'
import { describeLoadError } from './describeLoadError'
import { EmptyResponseError } from './withRetry'

const httpError = (
  status: number,
  headers: Record<string, string> = {},
  data: unknown = '<html>…</html>',
) =>
  Object.assign(new Error('<html>…</html>'), {
    status,
    response: { headers, data },
  })

const graphqlError = (
  errors: { type?: string; message: string }[],
  headers: Record<string, string> = {},
) =>
  Object.assign(new Error('Request failed due to…'), {
    name: 'GraphqlResponseError',
    errors,
    headers,
  })

describe('describeLoadError', () => {
  it('explains gateway errors without the response body', () => {
    expect(describeLoadError(httpError(502))).toEqual({
      description:
        'GitHub is having trouble (HTTP 502). Try again in a moment.',
    })
  })

  it('explains network failures', () => {
    const error = Object.assign(new Error('Failed to fetch'), { status: 500 })
    expect(describeLoadError(error).description).toMatch("Can't reach GitHub")
  })

  it('explains empty responses', () => {
    expect(describeLoadError(new EmptyResponseError()).description).toMatch(
      'empty response',
    )
  })

  it('sends a rejected token to settings', () => {
    const info = describeLoadError(
      httpError(401, {}, { message: 'Bad credentials' }),
    )
    expect(info.description).toMatch('expired')
    expect(info.fix).toBe('settings')
  })

  it('links to the SSO authorization a token is waiting for', () => {
    const url = 'https://github.com/orgs/acme/sso?authorization_request=abc'
    const info = describeLoadError(
      httpError(403, { 'x-github-sso': `required; url=${url}` }),
    )
    expect(info.description).toMatch('single sign-on')
    expect(info.fix).toEqual({ authorizeUrl: url })
  })

  it('falls back to the token list when GraphQL leaves an SSO org out', () => {
    const info = describeLoadError(
      graphqlError([{ type: 'FORBIDDEN', message: 'SAML enforcement' }], {
        'x-github-sso': 'partial-results; organizations=123',
      }),
    )
    expect(info.fix).toEqual({
      authorizeUrl: 'https://github.com/settings/tokens',
    })
  })

  it('says when the rate limit resets', () => {
    const reset = new Date(2026, 0, 1, 14, 30)
    const info = describeLoadError(
      httpError(403, {
        'x-ratelimit-remaining': '0',
        'x-ratelimit-reset': String(reset.valueOf() / 1000),
      }),
    )
    expect(info.description).toBe(
      `GitHub's rate limit is used up until ${reset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
    )
    expect(info.fix).toBeUndefined()
  })

  it("passes on GitHub's own message for other 403s", () => {
    const message = 'acme forbids access via a personal access token (classic)'
    expect(describeLoadError(httpError(403, {}, { message }))).toEqual({
      description: `GitHub refused access: ${message}`,
    })
    expect(describeLoadError(httpError(403)).description).toBe(
      'GitHub refused access (HTTP 403).',
    )
  })

  it("passes on GitHub's own message for GraphQL errors", () => {
    expect(
      describeLoadError(
        graphqlError([
          { message: 'Something went wrong while executing your query' },
        ]),
      ),
    ).toEqual({
      description:
        "GitHub couldn't run the search: Something went wrong while executing your query",
    })
  })

  it('sends a token missing scopes to settings', () => {
    const info = describeLoadError(
      graphqlError([
        { type: 'INSUFFICIENT_SCOPES', message: 'Needs read:org' },
      ]),
    )
    expect(info.fix).toBe('settings')
  })

  it('names the status of other HTTP errors', () => {
    expect(describeLoadError(httpError(422)).description).toBe(
      'GitHub responded with HTTP 422.',
    )
  })

  it('never shows internal JavaScript errors', () => {
    const error = new TypeError(
      'can\'t access property "search", res is undefined',
    )
    expect(describeLoadError(error).description).not.toMatch('search')
    expect(describeLoadError(error).description).toMatch('browser console')
  })
})
