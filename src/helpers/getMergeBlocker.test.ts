import { describe, expect, it } from 'vitest'
import { getMergeBlocker } from './getMergeBlocker'

const reviewer = { login: 'r', name: null, avatarUrl: '' }
const approved: Review[] = [{ state: 'APPROVED', reviewer }]

const base: Parameters<typeof getMergeBlocker>[0] = {
  isDraft: false,
  reviews: [],
  reviewDecision: 'REVIEW_REQUIRED',
  mergeable: 'MERGEABLE',
  mergeStateStatus: 'CLEAN',
  unresolvedThreads: 0,
  missingRequiredChecks: [],
  lastCommitDate: null,
}

describe('getMergeBlocker', () => {
  it('returns nothing for a clean PR', () => {
    expect(getMergeBlocker(base)).toBeNull()
  })

  it('returns nothing while mergeability is still being computed', () => {
    expect(
      getMergeBlocker({
        ...base,
        mergeable: 'UNKNOWN',
        mergeStateStatus: 'UNKNOWN',
      }),
    ).toBeNull()
  })

  it('flags conflicts even without any review', () => {
    expect(
      getMergeBlocker({
        ...base,
        mergeable: 'CONFLICTING',
        mergeStateStatus: 'DIRTY',
      }),
    ).toEqual({ severity: 'conflict', reasons: ['Conflicts with base branch'] })
  })

  it('does not flag an unreviewed PR that is blocked waiting for review', () => {
    expect(getMergeBlocker({ ...base, mergeStateStatus: 'BLOCKED' })).toBeNull()
  })

  it('flags an approved PR blocked by unresolved threads', () => {
    expect(
      getMergeBlocker({
        ...base,
        reviews: approved,
        reviewDecision: 'APPROVED',
        mergeStateStatus: 'BLOCKED',
        unresolvedThreads: 2,
      }),
    ).toEqual({ severity: 'blocked', reasons: ['2 unresolved threads'] })
  })

  it('flags an approved PR that still needs more approvals', () => {
    expect(
      getMergeBlocker({
        ...base,
        reviews: approved,
        mergeStateStatus: 'BLOCKED',
      })?.reasons,
    ).toEqual(['Needs more approvals'])
  })

  it('falls back to a generic reason for rules it cannot see', () => {
    expect(
      getMergeBlocker({
        ...base,
        reviews: approved,
        reviewDecision: 'APPROVED',
        mergeStateStatus: 'BLOCKED',
      })?.reasons,
    ).toEqual(['Blocked by branch rules (e.g. required checks)'])
  })

  it('does not flag unresolved threads when they do not block the merge', () => {
    expect(
      getMergeBlocker({
        ...base,
        reviews: approved,
        reviewDecision: 'APPROVED',
        unresolvedThreads: 3,
      }),
    ).toBeNull()
  })

  it('does not flag blocked PRs that have changes requested', () => {
    expect(
      getMergeBlocker({
        ...base,
        reviews: [...approved, { state: 'CHANGES_REQUESTED', reviewer }],
        mergeStateStatus: 'BLOCKED',
      }),
    ).toBeNull()
  })

  it('lists other blockers alongside conflicts, with conflict severity', () => {
    expect(
      getMergeBlocker({
        ...base,
        reviews: approved,
        mergeable: 'CONFLICTING',
        mergeStateStatus: 'BLOCKED',
        unresolvedThreads: 1,
      }),
    ).toEqual({
      severity: 'conflict',
      reasons: [
        'Conflicts with base branch',
        '1 unresolved thread',
        'Needs more approvals',
      ],
    })
  })

  it('names required checks that an old commit never reported', () => {
    expect(
      getMergeBlocker({
        ...base,
        reviews: approved,
        reviewDecision: 'APPROVED',
        mergeStateStatus: 'BLOCKED',
        missingRequiredChecks: ['build', 'lint'],
        lastCommitDate: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000),
      })?.reasons,
    ).toEqual([
      'Required checks not reported: build, lint (last commit last year)',
    ])
  })

  it('treats missing checks on a fresh commit as not reported yet', () => {
    expect(
      getMergeBlocker({
        ...base,
        reviews: approved,
        reviewDecision: 'APPROVED',
        mergeStateStatus: 'BLOCKED',
        missingRequiredChecks: ['build'],
        lastCommitDate: new Date(Date.now() - 60 * 1000),
      })?.reasons,
    ).toEqual(['Required checks not reported yet: build'])
  })
})
