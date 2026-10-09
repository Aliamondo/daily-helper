export type ActiveFilter = 'mustReview' | 'myPrs' | 'myWork'

// Readable values for the ?filter= URL param
const FILTER_PARAMS: Record<ActiveFilter, string> = {
  mustReview: 'highest-priority',
  myPrs: 'my-prs',
  myWork: 'my-work',
}

export function readFilterParam(search: string): ActiveFilter | null {
  const value = new URLSearchParams(search).get('filter')
  const entry = Object.entries(FILTER_PARAMS).find(([, v]) => v === value)
  return entry ? (entry[0] as ActiveFilter) : null
}

/** Returns the search string with the filter param set, or removed for null */
export function writeFilterParam(
  search: string,
  filter: ActiveFilter | null,
): string {
  const params = new URLSearchParams(search)
  if (filter) params.set('filter', FILTER_PARAMS[filter])
  else params.delete('filter')
  const result = params.toString()
  return result ? `?${result}` : ''
}
