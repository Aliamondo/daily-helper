import { getDisplayName } from './getDisplayName'
import { getEffectiveReviewDecision } from './getEffectiveReviewDecision'

export function isBotUser(user: User, filters: Settings_Filters): boolean {
  const displayName = getDisplayName(user)
  const matchesPattern = filters.botPatterns.some(p =>
    displayName?.toLowerCase().includes(p.toLowerCase()),
  )
  const matchesLogin = filters.botLogins.some(
    l => user.login?.toLowerCase() === l.toLowerCase(),
  )
  return matchesPattern || matchesLogin
}

function isTitleWhitelisted(title: string, filters: Settings_Filters): boolean {
  return filters.titleWhitelist.some(w =>
    title.toLowerCase().includes(w.toLowerCase()),
  )
}

export function matchesSearch(pr: PullRequest, rawQuery: string): boolean {
  const query = rawQuery.trim().toLowerCase()
  if (!query) return true

  const userMatches = (user: User) =>
    getDisplayName(user).toLowerCase().includes(query) ||
    user.login.toLowerCase().includes(query)

  return (
    pr.title.toLowerCase().includes(query) ||
    `#${pr.number}`.includes(query) ||
    pr.repositoryName.toLowerCase().includes(query) ||
    userMatches(pr.author) ||
    pr.assignees.some(userMatches) ||
    pr.labels.some(label => label.name.toLowerCase().includes(query))
  )
}

export function applyReviewRequiredFilter(
  prs: PullRequest[],
  viewerLogin: string,
  filters: Settings_Filters,
): PullRequest[] {
  return prs.filter(pr => {
    if (pr.author.login === viewerLogin) return false
    if (pr.isDraft) return false
    if (isBotUser(pr.author, filters) && !isTitleWhitelisted(pr.title, filters))
      return false
    if (getEffectiveReviewDecision(pr) === 'APPROVED') return false
    const humanReviewers = pr.requestedReviewers.filter(
      r => !isBotUser(r, filters),
    )
    const isWhitelisted =
      isBotUser(pr.author, filters) && isTitleWhitelisted(pr.title, filters)
    // Auto-merge is a deliberate author action, so it signals review-readiness
    // even when nobody was explicitly requested as a reviewer
    return humanReviewers.length > 0 || !!pr.autoMerge || isWhitelisted
  })
}

export type LabelWithCount = Label & {
  count: number
}

/** Hidden labels are lowercase. A PR is hidden only when all its labels are */
export function isVisibleByLabels(
  labels: Label[],
  hiddenLabels: Set<string>,
  hideUnlabeled: boolean,
): boolean {
  if (!labels.length) return !hideUnlabeled
  return !labels
    .map(label => label.name.toLocaleLowerCase())
    .every(labelName => hiddenLabels.has(labelName))
}

export function isMyWork(pr: PullRequest, viewerLogin: string | null): boolean {
  return (
    viewerLogin !== null &&
    (pr.author.login === viewerLogin ||
      pr.contributors.some(u => u.login === viewerLogin) ||
      pr.assignees.some(u => u.login === viewerLogin) ||
      pr.requestedReviewers.some(u => u.login === viewerLogin) ||
      pr.reviews.some(r => r.reviewer.login === viewerLogin))
  )
}

/** Counts PRs per label, case-insensitively, plus the PRs without labels */
export function countLabels(pullRequests: PullRequest[]): {
  labels: Map<string, LabelWithCount>
  unlabeledCount: number
} {
  const labels = new Map<string, LabelWithCount>()
  const pullRequestsWithLabels = pullRequests.filter(pr => pr.labels.length)
  pullRequestsWithLabels.forEach(pr =>
    pr.labels.forEach(label => {
      const name = label.name.toLocaleLowerCase()
      const count = labels.get(name)?.count || 0
      const color = labels.get(name)?.color
      labels.set(name, {
        ...label,
        color: color || label.color,
        description: '',
        count: count + 1,
      })
    }),
  )
  return {
    labels,
    unlabeledCount: pullRequests.length - pullRequestsWithLabels.length,
  }
}
