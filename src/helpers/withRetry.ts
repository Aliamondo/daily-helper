type RetryOptions = {
  retries?: number
  baseDelayMs?: number
  signal?: AbortSignal
}

const TRANSIENT_STATUSES = new Set([502, 503, 504])

/**
 * Octokit resolves with undefined instead of throwing when a 2xx response body
 * isn't GraphQL JSON (empty, an HTML page from a proxy, or `data: null`)
 */
export class EmptyResponseError extends Error {
  name = 'EmptyResponseError'
  constructor() {
    super('GitHub returned a response without data')
  }
}

/**
 * Octokit reports a failed fetch (dropped connection, DNS, offline) as a 500
 * with no response attached, unlike a real 500 from GitHub
 */
export function isNetworkError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const { status, response, name } = error as {
    status?: unknown
    response?: unknown
    name?: unknown
  }
  return status === 500 && !response && name !== 'AbortError'
}

/**
 * GitHub's GraphQL endpoint occasionally answers heavy search queries with
 * 502/503/504, and connections sometimes drop. Both usually succeed on the
 * next try. Auth errors, rate limits, GraphQL errors (200 with an `errors`
 * payload) and cancelled requests are not retried
 */
export function isTransientError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  if ((error as { name?: unknown }).name === 'AbortError') return false
  if (error instanceof EmptyResponseError) return true
  const status = (error as { status?: unknown }).status
  return (
    (typeof status === 'number' && TRANSIENT_STATUSES.has(status)) ||
    isNetworkError(error)
  )
}

function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason)
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    const onAbort = () => {
      clearTimeout(timer)
      reject(signal?.reason)
    }
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

export async function withRetry<T>(
  run: () => Promise<T>,
  { retries = 2, baseDelayMs = 1000, signal }: RetryOptions = {},
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await run()
    } catch (error) {
      if (attempt >= retries || signal?.aborted || !isTransientError(error)) {
        throw error
      }
      // 1s, 2s, 4s… with jitter so parallel queries don't retry in lockstep
      const delay = baseDelayMs * 2 ** attempt * (0.75 + Math.random() * 0.5)
      await wait(delay, signal)
    }
  }
}
