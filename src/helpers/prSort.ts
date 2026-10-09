import type { SortDir, SortField } from '../components/SortControl'
import { getDisplayName } from './getDisplayName'
import { compareByState } from './getStateRank'

export function comparePullRequests(
  a: PullRequest,
  b: PullRequest,
  field: SortField,
  dir: SortDir,
  filters: Settings_Filters,
): number {
  const mul = dir === 'asc' ? 1 : -1
  switch (field) {
    case 'date':
      return (
        mul *
        (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      )
    case 'repo':
      return mul * a.repositoryName.localeCompare(b.repositoryName)
    case 'author':
      return (
        mul * getDisplayName(a.author).localeCompare(getDisplayName(b.author))
      )
    case 'state':
      return compareByState(a, b, filters)
  }
}

/** Kanban columns already group by state, so the cards in them sort by date */
export function getKanbanSortField(
  field: SortField,
): Exclude<SortField, 'state'> {
  return field === 'state' ? 'date' : field
}
