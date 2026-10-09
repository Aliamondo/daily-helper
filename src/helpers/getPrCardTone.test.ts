import { describe, expect, it } from 'vitest'
import { getCompactPrCardTone, getPrCardTone } from './getPrCardTone'

const base = {
  state: 'OPEN',
  effectiveReviewDecision: 'REVIEW_REQUIRED',
  isDraft: false,
  isLoading: false,
} as const

describe('getPrCardTone', () => {
  it('colors open PRs by review state', () => {
    expect(getPrCardTone(base)).toBe('default')
    expect(
      getPrCardTone({ ...base, effectiveReviewDecision: 'APPROVED' }),
    ).toBe('approved')
    expect(
      getPrCardTone({ ...base, effectiveReviewDecision: 'CHANGES_REQUESTED' }),
    ).toBe('changesRequested')
    expect(getPrCardTone({ ...base, isDraft: true })).toBe('draft')
  })

  it('stays neutral while loading or once the PR is closed', () => {
    const approved = { ...base, effectiveReviewDecision: 'APPROVED' } as const
    expect(getPrCardTone({ ...approved, isLoading: true })).toBe('default')
    expect(getPrCardTone({ ...approved, state: 'MERGED' })).toBe('default')
  })
})

describe('approved PRs', () => {
  it('are green on both full and compact cards, drafts included', () => {
    const approvedDraft = {
      ...base,
      effectiveReviewDecision: 'APPROVED',
      isDraft: true,
    } as const
    expect(getPrCardTone(approvedDraft)).toBe('approved')
    expect(getCompactPrCardTone(approvedDraft)).toBe('approved')
  })
})

describe('getCompactPrCardTone', () => {
  it('otherwise only shows drafts', () => {
    expect(getCompactPrCardTone(base)).toBe('default')
    expect(getCompactPrCardTone({ ...base, isDraft: true })).toBe('draft')
    expect(
      getCompactPrCardTone({
        ...base,
        effectiveReviewDecision: 'CHANGES_REQUESTED',
      }),
    ).toBe('default')
  })
})
