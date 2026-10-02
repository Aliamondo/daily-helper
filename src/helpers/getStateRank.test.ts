import { describe, expect, it } from 'vitest'
import { getEffectiveReviewDecision } from './getEffectiveReviewDecision'
import { compareByState, getStateRank } from './getStateRank'

const user = { login: 'someone', name: null, avatarUrl: '' }
const approved: Review[] = [{ state: 'APPROVED', reviewer: user }]
const filters = { botLogins: [] } as unknown as Settings_Filters

const pr = (overrides: Partial<PullRequest>): PullRequest =>
  ({
    isDraft: false,
    reviews: [],
    reviewDecision: 'REVIEW_REQUIRED',
    mergeable: 'MERGEABLE',
    mergeStateStatus: 'CLEAN',
    unresolvedThreads: 0,
    missingRequiredChecks: [],
    lastCommitDate: null,
    requestedReviewers: [user],
    autoMerge: null,
    ...overrides,
  }) as PullRequest

describe('getEffectiveReviewDecision', () => {
  it("respects GitHub's decision when it has one", () => {
    expect(
      getEffectiveReviewDecision({
        reviewDecision: 'REVIEW_REQUIRED',
        reviews: approved,
      }),
    ).toBe('REVIEW_REQUIRED')
  })

  it('falls back to the reviews when the repo has no review rules', () => {
    expect(
      getEffectiveReviewDecision({ reviewDecision: null, reviews: approved }),
    ).toBe('APPROVED')
    expect(
      getEffectiveReviewDecision({
        reviewDecision: null,
        reviews: [...approved, { state: 'CHANGES_REQUESTED', reviewer: user }],
      }),
    ).toBe('CHANGES_REQUESTED')
    expect(
      getEffectiveReviewDecision({ reviewDecision: null, reviews: [] }),
    ).toBe('REVIEW_REQUIRED')
  })
})

describe('getStateRank', () => {
  it('orders approved PRs by how close they are to merging', () => {
    const ready = pr({ reviewDecision: 'APPROVED', reviews: approved })
    const blocked = pr({
      reviewDecision: null,
      reviews: approved,
      mergeStateStatus: 'BLOCKED',
      unresolvedThreads: 1,
    })
    const changesRequested = pr({ reviewDecision: 'CHANGES_REQUESTED' })
    const conflicting = pr({
      reviewDecision: 'APPROVED',
      reviews: approved,
      mergeable: 'CONFLICTING',
      mergeStateStatus: 'DIRTY',
    })
    const reviewRequired = pr({})

    expect(
      [ready, blocked, conflicting, changesRequested, reviewRequired].map(p =>
        getStateRank(p, filters),
      ),
    ).toEqual([0, 1, 2, 3, 4])
  })

  it('keeps PRs that still need more approvals out of the approved ranks', () => {
    expect(
      getStateRank(
        pr({ reviews: approved, mergeStateStatus: 'BLOCKED' }),
        filters,
      ),
    ).toBe(4)
  })

  it('sinks conflicting PRs to the bottom of their rank', () => {
    const conflicts = {
      mergeable: 'CONFLICTING',
      mergeStateStatus: 'DIRTY',
    } as const
    const clean = pr({ title: 'clean' })
    const conflicting = pr({ title: 'conflicting', ...conflicts })
    const inProgress = pr({ title: 'in progress', requestedReviewers: [] })

    expect(
      [conflicting, inProgress, clean]
        .sort((a, b) => compareByState(a, b, filters))
        .map(p => p.title),
    ).toEqual(['clean', 'conflicting', 'in progress'])
  })

  it('ignores amber blockers outside the approved ranks', () => {
    const behind = pr({ reviews: approved, mergeStateStatus: 'BEHIND' })
    expect(compareByState(behind, pr({}), filters)).toBe(0)
  })
})
