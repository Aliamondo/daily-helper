/**
 * GitHub only computes a review decision when the repo has review rules. When
 * it has an opinion we respect it (e.g. "needs 2 approvals, has 1" stays
 * REVIEW_REQUIRED); when it doesn't, the latest reviews decide
 */
export function getEffectiveReviewDecision(
  pr: Pick<PullRequest, 'reviewDecision' | 'reviews'>,
): ReviewDecision {
  if (pr.reviewDecision) return pr.reviewDecision
  if (pr.reviews.some(r => r.state === 'CHANGES_REQUESTED'))
    return 'CHANGES_REQUESTED'
  if (pr.reviews.some(r => r.state === 'APPROVED')) return 'APPROVED'
  return 'REVIEW_REQUIRED'
}
