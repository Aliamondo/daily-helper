import { describe, expect, it, vi } from 'vitest'
import { EmptyResponseError, isTransientError, withRetry } from './withRetry'

const httpError = (status: number) =>
  Object.assign(new Error(`HTTP ${status}`), { status, response: {} })
// What octokit throws when fetch itself fails
const networkError = () =>
  Object.assign(new Error('Failed to fetch'), { status: 500 })
const abortError = () =>
  Object.assign(new Error('aborted'), { name: 'AbortError', status: 500 })

describe('isTransientError', () => {
  it('treats gateway errors and network failures as transient', () => {
    expect(isTransientError(httpError(502))).toBe(true)
    expect(isTransientError(httpError(503))).toBe(true)
    expect(isTransientError(httpError(504))).toBe(true)
    expect(isTransientError(networkError())).toBe(true)
    expect(isTransientError(new EmptyResponseError())).toBe(true)
  })

  it('does not retry auth, rate limit or query errors', () => {
    expect(isTransientError(httpError(500))).toBe(false)
    expect(isTransientError(abortError())).toBe(false)
    expect(isTransientError(httpError(401))).toBe(false)
    expect(isTransientError(httpError(403))).toBe(false)
    expect(isTransientError(httpError(422))).toBe(false)
    expect(isTransientError(new Error('Field does not exist'))).toBe(false)
  })
})

describe('withRetry', () => {
  it('retries transient failures until one succeeds', async () => {
    const run = vi
      .fn()
      .mockRejectedValueOnce(httpError(502))
      .mockRejectedValueOnce(httpError(504))
      .mockResolvedValue('ok')

    await expect(withRetry(run, { baseDelayMs: 0 })).resolves.toBe('ok')
    expect(run).toHaveBeenCalledTimes(3)
  })

  it('gives up after the configured number of retries', async () => {
    const run = vi.fn().mockRejectedValue(httpError(502))

    await expect(
      withRetry(run, { retries: 2, baseDelayMs: 0 }),
    ).rejects.toThrow('HTTP 502')
    expect(run).toHaveBeenCalledTimes(3)
  })

  it('fails immediately on non-transient errors', async () => {
    const run = vi.fn().mockRejectedValue(httpError(401))

    await expect(withRetry(run, { baseDelayMs: 0 })).rejects.toThrow('HTTP 401')
    expect(run).toHaveBeenCalledTimes(1)
  })

  it('stops retrying once the signal is aborted', async () => {
    const controller = new AbortController()
    const run = vi.fn().mockRejectedValue(httpError(502))

    const result = withRetry(run, {
      baseDelayMs: 10_000,
      signal: controller.signal,
    })
    controller.abort()

    await expect(result).rejects.toThrow()
    expect(run).toHaveBeenCalledTimes(1)
  })

  it('cancels the wait before the next retry when aborted', async () => {
    const controller = new AbortController()
    const run = vi.fn().mockRejectedValue(httpError(502))

    const result = withRetry(run, {
      baseDelayMs: 10_000,
      signal: controller.signal,
    })
    await vi.waitFor(() => expect(run).toHaveBeenCalledTimes(1))
    controller.abort()

    // Would time out if the 10s wait kept running
    await expect(result).rejects.toThrow()
    expect(run).toHaveBeenCalledTimes(1)
  })
})
