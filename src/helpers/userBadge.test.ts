import { beforeEach, describe, expect, it } from 'vitest'
import { getUserBadgeTooltip, pickCompactReviewers } from './userBadge'

const user: User = { login: 'alice', name: 'Alice', avatarUrl: '' }

beforeEach(() => localStorage.clear())

describe('getUserBadgeTooltip', () => {
  it('says what the person did', () => {
    expect(getUserBadgeTooltip({ user, type: 'AUTHOR' })).toBe(
      'Opened by Alice',
    )
    expect(getUserBadgeTooltip({ user, type: 'CONTRIBUTOR' })).toBe(
      'Contributed by Alice',
    )
    expect(getUserBadgeTooltip({ user, type: 'ASSIGNEE' })).toBe(
      'Assigned to Alice',
    )
    expect(getUserBadgeTooltip({ user, type: 'REQUESTED_REVIEWER' })).toBe(
      'Review requested from Alice',
    )
    expect(getUserBadgeTooltip({ user, type: 'COMMIT_CHECK_RUNNER' })).toBe(
      'Started by Alice',
    )
    expect(getUserBadgeTooltip({ user, type: 'DEFAULT' })).toBe('Alice')
  })

  it('describes the review', () => {
    expect(
      getUserBadgeTooltip({ user, type: 'REVIEWER', reviewState: 'APPROVED' }),
    ).toBe('Approved by Alice')
    expect(
      getUserBadgeTooltip({ user, type: 'REVIEWER', reviewState: 'PENDING' }),
    ).toBe('Currently being reviewed by Alice')
  })
})

describe('pickCompactReviewers', () => {
  const people = (...logins: string[]) =>
    logins.map(login => ({ ...user, login }))
  const reviews = (...logins: string[]): Review[] =>
    people(...logins).map(reviewer => ({ state: 'APPROVED', reviewer }))

  it('fills up to three, reviews first', () => {
    const picked = pickCompactReviewers(reviews('a'), people('b', 'c', 'd'))
    expect(picked.reviews.map(r => r.reviewer.login)).toEqual(['a'])
    expect(picked.requested.map(u => u.login)).toEqual(['b', 'c'])
  })

  it('shows no more than three with many reviews', () => {
    const picked = pickCompactReviewers(
      reviews('a', 'b', 'c', 'd'),
      people('e', 'f', 'g'),
    )
    expect(picked.reviews).toHaveLength(3)
    expect(picked.requested).toEqual([])
  })
})
