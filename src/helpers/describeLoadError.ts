import { EmptyResponseError, isNetworkError } from './withRetry'

export type LoadErrorInfo = {
  description: string
  // Retrying won't help until the token is fixed, here or on GitHub
  fix?: 'settings' | { authorizeUrl: string }
}

/**
 * Turns a failed load into a sentence for the error banner. Raw messages are
 * never shown: octokit uses the response body as the message (a whole HTML
 * page for a gateway error), and anything else is a bug in this app whose
 * message means nothing to the reader. The full error goes to the console
 */
export function describeLoadError(error: unknown): LoadErrorInfo {
  const { status, name, errors, headers, response } = (error ?? {}) as {
    status?: unknown
    name?: unknown
    errors?: { type?: string; message?: string }[]
    // GraphqlResponseError has headers, RequestError has them on the response
    headers?: Record<string, string | undefined>
    response?: {
      headers?: Record<string, string | undefined>
      data?: unknown
    }
  }
  const header = (key: string) => (response?.headers ?? headers)?.[key]

  if (isNetworkError(error)) {
    return { description: "Can't reach GitHub. Check your connection or VPN." }
  }
  // "required; url=…" when the token isn't SSO-authorized for the org,
  // "partial-results; organizations=…" when GraphQL left those orgs out
  const sso = header('x-github-sso')
  if (sso) {
    const url = /url=([^;\s]+)/.exec(sso)?.[1]
    return {
      description:
        "Your token isn't authorized for this organization yet. Authorize it for single sign-on on GitHub.",
      fix: { authorizeUrl: url ?? 'https://github.com/settings/tokens' },
    }
  }
  if (status === 401) {
    return {
      description:
        'GitHub rejected your token. It has probably expired or been revoked.',
      fix: 'settings',
    }
  }
  if (
    header('x-ratelimit-remaining') === '0' ||
    errors?.[0]?.type === 'RATE_LIMITED'
  ) {
    const reset = Number(header('x-ratelimit-reset'))
    return {
      description: reset
        ? `GitHub's rate limit is used up until ${new Date(reset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
        : "GitHub's rate limit is used up. Try again later.",
    }
  }
  if (status === 502 || status === 503 || status === 504) {
    return {
      description: `GitHub is having trouble (HTTP ${status}). Try again in a moment.`,
    }
  }
  if (error instanceof EmptyResponseError) {
    return {
      description: 'GitHub sent back an empty response. Try again in a moment.',
    }
  }
  if (name === 'GraphqlResponseError') {
    // Written by GitHub for people, e.g. "Something went wrong while executing your query"
    const message = errors?.[0]?.message
    return {
      description: message
        ? `GitHub couldn't run the search: ${message}`
        : "GitHub couldn't run the search.",
      fix: errors?.[0]?.type === 'INSUFFICIENT_SCOPES' ? 'settings' : undefined,
    }
  }
  if (status === 403) {
    // Org token policies explain themselves, e.g. a token lifetime that's too long
    const message = (response?.data as { message?: unknown } | undefined)
      ?.message
    return {
      description:
        typeof message === 'string'
          ? `GitHub refused access: ${message}`
          : 'GitHub refused access (HTTP 403).',
    }
  }
  if (typeof status === 'number') {
    return { description: `GitHub responded with HTTP ${status}.` }
  }
  return {
    description:
      'Something unexpected went wrong. Details are in the browser console.',
  }
}
