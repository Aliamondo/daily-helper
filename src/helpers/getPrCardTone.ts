export type PrCardTone = 'default' | 'draft' | 'approved' | 'changesRequested'

/** Background tone of a full PR card. Only open, loaded PRs get a colour */
export function getPrCardTone({
  state,
  effectiveReviewDecision,
  isDraft,
  isLoading,
}: {
  state: PullRequest['state']
  effectiveReviewDecision: ReviewDecision
  isDraft: boolean
  isLoading: boolean
}): PrCardTone {
  if (state === 'OPEN' && !isLoading) {
    if (effectiveReviewDecision === 'CHANGES_REQUESTED')
      return 'changesRequested'
    if (effectiveReviewDecision === 'APPROVED') return 'approved'
    if (isDraft) return 'draft'
  }
  return 'default'
}

type PrCardToneInput = Parameters<typeof getPrCardTone>[0]

/** Compact (kanban) cards show approvals like full cards, and always show drafts */
export function getCompactPrCardTone(pr: PrCardToneInput): PrCardTone {
  if (getPrCardTone(pr) === 'approved') return 'approved'
  return pr.isDraft ? 'draft' : 'default'
}
