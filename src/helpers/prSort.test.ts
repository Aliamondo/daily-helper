import { beforeEach, describe, expect, it } from 'vitest'
import { comparePullRequests, getKanbanSortField } from './prSort'

const filters: Settings_Filters = {
  botPatterns: ['[bot]'],
  botLogins: ['copilot-pull-request-reviewer'],
  titleWhitelist: [],
}
const user = (login: string, name: string | null = null): User => ({
  login,
  name,
  avatarUrl: '',
})

const pr = (overrides: Partial<PullRequest>): PullRequest =>
  ({
    createdAt: new Date('2026-01-01'),
    repositoryName: 'repo',
    author: user('author'),
    isDraft: false,
    reviews: [],
    reviewDecision: 'REVIEW_REQUIRED',
    mergeable: 'MERGEABLE',
    mergeStateStatus: 'CLEAN',
    requestedReviewers: [user('reviewer')],
    autoMerge: null,
    ...overrides,
  }) as PullRequest

const sortTitles = (
  prs: PullRequest[],
  field: Parameters<typeof comparePullRequests>[2],
  dir: Parameters<typeof comparePullRequests>[3],
) =>
  [...prs]
    .sort((a, b) => comparePullRequests(a, b, field, dir, filters))
    .map(p => p.title)

beforeEach(() => localStorage.clear())

describe('comparePullRequests', () => {
  const older = pr({ title: 'older', createdAt: new Date('2026-01-01') })
  const newer = pr({ title: 'newer', createdAt: new Date('2026-02-01') })

  it('sorts by date in either direction', () => {
    expect(sortTitles([older, newer], 'date', 'desc')).toEqual([
      'newer',
      'older',
    ])
    expect(sortTitles([newer, older], 'date', 'asc')).toEqual([
      'older',
      'newer',
    ])
  })

  it('sorts by repository name', () => {
    const api = pr({ title: 'api', repositoryName: 'api' })
    const web = pr({ title: 'web', repositoryName: 'web' })
    expect(sortTitles([web, api], 'repo', 'asc')).toEqual(['api', 'web'])
    expect(sortTitles([api, web], 'repo', 'desc')).toEqual(['web', 'api'])
  })

  it('sorts by the name people see, aliases included', () => {
    localStorage.setItem(
      'settings',
      JSON.stringify({ aliases: { zed: 'Aaron' } }),
    )
    const zed = pr({ title: 'zed', author: user('zed') })
    const bob = pr({ title: 'bob', author: user('bob', 'Bob') })
    expect(sortTitles([bob, zed], 'author', 'asc')).toEqual(['zed', 'bob'])
  })

  it('sorts by review state', () => {
    const approved = pr({ title: 'approved', reviewDecision: 'APPROVED' })
    const waiting = pr({ title: 'waiting' })
    expect(sortTitles([waiting, approved], 'state', 'asc')).toEqual([
      'approved',
      'waiting',
    ])
  })
})

describe('getKanbanSortField', () => {
  it('sorts by date when the list is sorted by state', () => {
    expect(getKanbanSortField('state')).toBe('date')
    expect(getKanbanSortField('repo')).toBe('repo')
  })
})
