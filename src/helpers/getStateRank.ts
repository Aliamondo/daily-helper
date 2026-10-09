import { getEffectiveReviewDecision } from './getEffectiveReviewDecision'
import { getMergeBlocker, hasConflicts } from './getMergeBlocker'
import { isBotUser } from './prFilters'

export type StateRank = 0 | 1 | 2 | 3 | 4 | 5 | 6

/**
 * 0 approved and mergeable
 * 1 approved, but blocked by something other than conflicts
 * 2 approved, but conflicting: an invisible "changes requested"
 * 3 changes requested
 * 4 review required
 * 5 in progress
 * 6 draft
 */
export function getStateRank(
  pr: PullRequest,
  filters: Settings_Filters,
): StateRank {
  if (pr.isDraft) return 6
  const reviewDecision = getEffectiveReviewDecision(pr)
  if (reviewDecision === 'APPROVED') {
    const blocker = getMergeBlocker(pr)
    if (!blocker) return 0
    return blocker.severity === 'conflict' ? 2 : 1
  }
  if (reviewDecision === 'CHANGES_REQUESTED') return 3
  const humanReviewers = pr.requestedReviewers.filter(
    r => !isBotUser(r, filters),
  )
  // Auto-merge means the author considers it done, so it belongs in
  // "Review Required" rather than "In Progress"
  if (!humanReviewers.length) return pr.autoMerge ? 4 : 5
  return 4
}

/**
 * Sorts by state rank, then sinks conflicting PRs to the bottom of their rank:
 * they can't move until the author rebases. Amber blockers only shape the
 * approved ranks above, since elsewhere they're usually trivial
 */
export function compareByState(
  a: PullRequest,
  b: PullRequest,
  filters: Settings_Filters,
): number {
  return (
    getStateRank(a, filters) - getStateRank(b, filters) ||
    Number(hasConflicts(a)) - Number(hasConflicts(b))
  )
}
