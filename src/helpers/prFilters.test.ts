import { beforeEach, describe, expect, it } from 'vitest'
import {
  applyReviewRequiredFilter,
  countLabels,
  isMyWork,
  isVisibleByLabels,
  matchesSearch,
} from './prFilters'

const user = (login: string, name: string | null = null): User => ({
  login,
  name,
  avatarUrl: '',
})
const reviewer = user('reviewer')
const filters: Settings_Filters = {
  botPatterns: ['[bot]'],
  botLogins: ['dependabot'],
  titleWhitelist: ['security'],
}

const pr = (overrides: Partial<PullRequest>): PullRequest =>
  ({
    title: 'Add feature',
    number: 42,
    repositoryName: 'web-app',
    author: user('author', 'Jane Doe'),
    assignees: [],
    contributors: [],
    labels: [],
    isDraft: false,
    reviewDecision: 'REVIEW_REQUIRED',
    reviews: [],
    requestedReviewers: [reviewer],
    autoMerge: null,
    ...overrides,
  }) as PullRequest

beforeEach(() => localStorage.clear())

describe('matchesSearch', () => {
  it('matches everything for an empty query', () => {
    expect(matchesSearch(pr({}), '  ')).toBe(true)
  })

  it('matches title, number, repo, people and labels', () => {
    const p = pr({
      assignees: [user('helper')],
      labels: [{ id: '1', name: 'Backend', color: '', description: '' }],
    })
    for (const query of [
      'FEATURE',
      '#42',
      'web-app',
      'jane',
      'author',
      'helper',
      'backend',
    ])
      expect(matchesSearch(p, query)).toBe(true)
    expect(matchesSearch(p, 'nothing')).toBe(false)
  })

  it('matches by alias', () => {
    localStorage.setItem(
      'settings',
      JSON.stringify({ aliases: { author: 'Janie' } }),
    )
    expect(matchesSearch(pr({}), 'janie')).toBe(true)
  })
})

describe('applyReviewRequiredFilter', () => {
  const keep = (p: PullRequest) =>
    applyReviewRequiredFilter([p], 'me', filters).length === 1

  it('keeps PRs waiting on a human reviewer', () => {
    expect(keep(pr({}))).toBe(true)
  })

  it("drops the viewer's own, draft and approved PRs", () => {
    expect(keep(pr({ author: user('me') }))).toBe(false)
    expect(keep(pr({ isDraft: true }))).toBe(false)
    expect(keep(pr({ reviewDecision: 'APPROVED' }))).toBe(false)
  })

  it('drops PRs where only bots are requested, unless auto-merge is on', () => {
    const bots = { requestedReviewers: [user('dependabot')] }
    expect(keep(pr(bots))).toBe(false)
    expect(
      keep(
        pr({ ...bots, autoMerge: { enabledAt: new Date(), enabledBy: null } }),
      ),
    ).toBe(true)
  })

  it('drops bot PRs unless the title is whitelisted', () => {
    const bot = { author: user('renovate[bot]'), requestedReviewers: [] }
    expect(keep(pr({ ...bot, title: 'Bump vite' }))).toBe(false)
    expect(keep(pr({ ...bot, title: 'Security fix for vite' }))).toBe(true)
  })
})

describe('isVisibleByLabels', () => {
  const label = (name: string) => ({
    id: name,
    name,
    color: '',
    description: '',
  })

  it('hides a PR only when every label is hidden', () => {
    const hidden = new Set(['wip'])
    expect(isVisibleByLabels([label('WIP')], hidden, false)).toBe(false)
    expect(isVisibleByLabels([label('WIP'), label('bug')], hidden, false)).toBe(
      true,
    )
  })

  it('follows the unlabeled toggle for PRs without labels', () => {
    expect(isVisibleByLabels([], new Set(), false)).toBe(true)
    expect(isVisibleByLabels([], new Set(), true)).toBe(false)
  })
})

describe('isMyWork', () => {
  it('matches PRs the viewer wrote, worked on, or was asked to review', () => {
    expect(isMyWork(pr({ author: user('me') }), 'me')).toBe(true)
    expect(isMyWork(pr({ contributors: [user('me')] }), 'me')).toBe(true)
    expect(isMyWork(pr({ assignees: [user('me')] }), 'me')).toBe(true)
    expect(isMyWork(pr({ requestedReviewers: [user('me')] }), 'me')).toBe(true)
    expect(
      isMyWork(
        pr({ reviews: [{ state: 'COMMENTED', reviewer: user('me') }] }),
        'me',
      ),
    ).toBe(true)
  })

  it('matches nothing else, or anything before the viewer is known', () => {
    expect(isMyWork(pr({}), 'me')).toBe(false)
    expect(isMyWork(pr({ author: user('me') }), null)).toBe(false)
  })
})

describe('countLabels', () => {
  it('counts PRs per label, ignoring case, and the unlabeled ones', () => {
    const label = (name: string) => ({
      id: name,
      name,
      color: 'red',
      description: '',
    })
    const { labels, unlabeledCount } = countLabels([
      pr({ labels: [label('bug')] }),
      pr({ labels: [label('Bug'), label('ui')] }),
      pr({ labels: [] }),
    ])

    expect(labels.get('bug')?.count).toBe(2)
    expect(labels.get('ui')?.count).toBe(1)
    expect(unlabeledCount).toBe(1)
  })
})
