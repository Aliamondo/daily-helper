import { fromNow } from './time'

const DAY = 24 * 60 * 60 * 1000

export type MergeBlocker = {
  severity: 'conflict' | 'blocked'
  reasons: string[]
}

type MergeBlockerInput = Pick<
  PullRequest,
  | 'isDraft'
  | 'reviews'
  | 'reviewDecision'
  | 'mergeable'
  | 'mergeStateStatus'
  | 'unresolvedThreads'
  | 'missingRequiredChecks'
  | 'lastCommitDate'
>

export function hasConflicts(
  pr: Pick<PullRequest, 'mergeable' | 'mergeStateStatus'>,
): boolean {
  return pr.mergeable === 'CONFLICTING' || pr.mergeStateStatus === 'DIRTY'
}

/**
 * Conflicts are flagged on every PR, since they have to be fixed before anything
 * else. Other blockers are only worth flagging once someone has approved: before
 * that, "blocked" just means "waiting for review", which is every PR
 */
export function getMergeBlocker(pr: MergeBlockerInput): MergeBlocker | null {
  const isConflicting = hasConflicts(pr)

  const reasons: string[] = []
  if (isConflicting) reasons.push('Conflicts with base branch')

  const isApprovedBySomeone =
    pr.reviews.some(r => r.state === 'APPROVED') &&
    !pr.reviews.some(r => r.state === 'CHANGES_REQUESTED')
  const isBlocked =
    pr.mergeStateStatus === 'BLOCKED' || pr.mergeStateStatus === 'BEHIND'

  if (!pr.isDraft && isApprovedBySomeone && isBlocked) {
    const blockedReasons: string[] = []
    if (pr.unresolvedThreads > 0)
      blockedReasons.push(
        `${pr.unresolvedThreads} unresolved ${pr.unresolvedThreads === 1 ? 'thread' : 'threads'}`,
      )
    if (pr.reviewDecision === 'REVIEW_REQUIRED')
      blockedReasons.push('Needs more approvals')
    if (pr.mergeStateStatus === 'BEHIND')
      blockedReasons.push('Behind base branch')
    if (pr.missingRequiredChecks.length)
      blockedReasons.push(getMissingChecksReason(pr))
    // Whatever is left is a rule we can't see from here, e.g. a required check
    if (!blockedReasons.length)
      blockedReasons.push('Blocked by branch rules (e.g. required checks)')
    reasons.push(...blockedReasons)
  }

  if (!reasons.length) return null
  return { severity: isConflicting ? 'conflict' : 'blocked', reasons }
}

/**
 * A missing check may still be queued, skipped by a path filter, or gone
 * from the workflows entirely; we can't tell which. The commit's age is the
 * best hint we have, so an old one is called out and the judgement left to you
 */
function getMissingChecksReason(
  pr: Pick<MergeBlockerInput, 'missingRequiredChecks' | 'lastCommitDate'>,
): string {
  const checks = pr.missingRequiredChecks.join(', ')
  const { lastCommitDate } = pr
  if (lastCommitDate && Date.now() - lastCommitDate.getTime() > DAY)
    return `Required checks not reported: ${checks} (last commit ${fromNow(lastCommitDate)})`
  return `Required checks not reported yet: ${checks}`
}
