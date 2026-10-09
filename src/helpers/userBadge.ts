import type { UserBadgeProps } from '../components/UserBadge'
import { enumerationToSentenceCase } from './strings'
import { getDisplayName } from './getDisplayName'

function getReviewStatusTooltip({
  reviewState,
  user,
}: {
  reviewState: ReviewState
  user: User
}): string {
  if (reviewState === 'PENDING')
    return `Currently being reviewed by ${getDisplayName(user)}`

  const state = enumerationToSentenceCase(reviewState)

  return `${state} by ${getDisplayName(user)}`
}

export function getUserBadgeTooltip({
  user,
  reviewState,
  type,
}: {
  user: User
  reviewState?: ReviewState
  type: UserBadgeProps['type']
}): string {
  if (type === 'AUTHOR') return `Opened by ${getDisplayName(user)}`
  if (type === 'CONTRIBUTOR') return `Contributed by ${getDisplayName(user)}`
  if (type === 'ASSIGNEE') return `Assigned to ${getDisplayName(user)}`
  if (type === 'REQUESTED_REVIEWER')
    return `Review requested from ${getDisplayName(user)}`
  if (type === 'REVIEWER' && reviewState) {
    return getReviewStatusTooltip({ reviewState, user })
  }
  if (type === 'COMMIT_CHECK_RUNNER')
    return `Started by ${getDisplayName(user)}`

  return getDisplayName(user)
}

const COMPACT_REVIEWER_LIMIT = 3

/** Reviews first, then requested reviewers, up to the limit in total */
export function pickCompactReviewers(
  activeReviews: Review[],
  requestedReviewers: User[],
): { reviews: Review[]; requested: User[] } {
  const reviews = activeReviews.slice(0, COMPACT_REVIEWER_LIMIT)
  return {
    reviews,
    requested: requestedReviewers.slice(
      0,
      COMPACT_REVIEWER_LIMIT - reviews.length,
    ),
  }
}
