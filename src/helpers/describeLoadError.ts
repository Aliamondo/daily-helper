import { EmptyResponseError, isNetworkError } from './withRetry'

/**
 * Turns a failed load into a sentence for the error banner. Raw messages are
 * never shown: octokit uses the response body as the message (a whole HTML
 * page for a gateway error), and anything else is a bug in this app whose
 * message means nothing to the reader. The full error goes to the console
 */
export function describeLoadError(error: unknown): string {
  const { status, name, errors } = (error ?? {}) as {
    status?: unknown
    name?: unknown
    errors?: { message?: string }[]
  }

  if (isNetworkError(error)) {
    return "Can't reach GitHub. Check your connection or VPN."
  }
  if (status === 502 || status === 503 || status === 504) {
    return `GitHub is having trouble (HTTP ${status}). Try again in a moment.`
  }
  if (error instanceof EmptyResponseError) {
    return 'GitHub sent back an empty response. Try again in a moment.'
  }
  if (name === 'GraphqlResponseError') {
    // Written by GitHub for people, e.g. "Something went wrong while executing your query"
    const message = errors?.[0]?.message
    return message
      ? `GitHub couldn't run the search: ${message}`
      : "GitHub couldn't run the search."
  }
  if (typeof status === 'number') {
    return `GitHub responded with HTTP ${status}.`
  }
  return 'Something unexpected went wrong. Details are in the browser console.'
}
