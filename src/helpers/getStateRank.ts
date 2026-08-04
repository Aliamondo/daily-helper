export function getStateRank(
  pr: PullRequest,
  filters: Settings_Filters,
): 0 | 1 | 2 | 3 | 4 {
  if (pr.isDraft) return 4
  if (pr.reviewDecision === 'APPROVED') return 0
  if (pr.reviewDecision === 'CHANGES_REQUESTED') return 1
  const humanReviewers = pr.requestedReviewers.filter(
    r => !filters.botLogins.includes(r.login?.toLowerCase()),
  )
  // Auto-merge means the author considers it done, so it belongs in
  // "Review Required" rather than "In Progress"
  if (!humanReviewers.length) return pr.autoMerge ? 2 : 3
  return 2
}
