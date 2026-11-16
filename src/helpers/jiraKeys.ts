export type JiraTicket = { key: string; url: string }

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Finds tickets of the given projects in free text like PR titles and branch
 * names. Accepts `CGY-123`, `cgy_123`, `CGY 123`, `CGY/123`
 * and `CGY123`. Numbers with a leading zero are skipped, so a `CGY-0`
 * placeholder for "no ticket" never becomes a link
 */
export function findJiraKeys(texts: string[], projectKeys: string[]): string[] {
  if (!projectKeys.length) return []

  const projects = projectKeys.map(escapeRegExp).join('|')
  // Lookarounds instead of \b, which treats _ as part of a word and would
  // miss feature_CGY-123
  const pattern = new RegExp(
    `(?<![a-z0-9])(${projects})[-_ /]?([1-9]\\d*)(?![a-z0-9])`,
    'gi',
  )

  const keys = new Set<string>()
  for (const text of texts) {
    for (const [, project, number] of text.matchAll(pattern)) {
      keys.add(`${project.toUpperCase()}-${number}`)
    }
  }
  return [...keys]
}

export function getJiraTickets(
  texts: string[],
  { baseUrl, projectKeys }: Settings_Jira,
): JiraTicket[] {
  const base = baseUrl.trim().replace(/\/+$/, '')
  if (!base) return []

  return findJiraKeys(texts, projectKeys).map(key => ({
    key,
    url: `${base}/browse/${key}`,
  }))
}
