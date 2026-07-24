import { getDisplayName } from './getDisplayName'

function isBotUser(user: User, filters: Settings_Filters): boolean {
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
    if (pr.reviewDecision === 'APPROVED') return false
    const humanReviewers = pr.requestedReviewers.filter(
      r => !isBotUser(r, filters),
    )
    return humanReviewers.length > 0
  })
}
