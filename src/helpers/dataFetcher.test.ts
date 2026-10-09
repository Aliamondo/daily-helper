import { describe, expect, it, vi } from 'vitest'

const requests = vi.hoisted(
  () => [] as { query: string; signal: AbortSignal }[],
)

vi.mock('@octokit/graphql', () => ({
  graphql: {
    defaults: () => (query: string, parameters?: any) => {
      const signal: AbortSignal = parameters.request.signal
      requests.push({ query, signal })
      if (requests.length === 1) {
        return Promise.reject(
          Object.assign(new Error('HTTP 422'), { status: 422, response: {} }),
        )
      }
      // Hang until cancelled, like a slow search
      return new Promise((_, reject) =>
        signal.addEventListener('abort', () => reject(signal.reason)),
      )
    },
  },
}))

vi.mock('./settingsHandler', () => ({
  settingsHandler: {
    loadGithubToken: () => 'token',
    loadTeam: () => ({ members: ['alice', 'bob'], repositories: ['repo'] }),
    loadPipelineStatus: () => false,
  },
}))

const { dataFetcher } = await import('./dataFetcher')

describe('fetchPullRequests', () => {
  it('cancels the remaining queries once one fails', async () => {
    await expect(
      dataFetcher.fetchPullRequests({
        orgName: 'org',
        teamName: 'team',
        setProgress: vi.fn(),
        handleInvalidTokenError: vi.fn(),
      }),
    ).rejects.toThrow('HTTP 422')

    // alice, bob, the team repository and the team review requests
    expect(requests).toHaveLength(4)
    expect(requests.every(r => r.signal.aborted)).toBe(true)
  })
})
