import Box from '@mui/material/Box'
import KanbanColumn from './KanbanColumn'
import { getStateRank } from '../../helpers/getStateRank'
import { settingsHandler } from '../../helpers/settingsHandler'
import { useMemo } from 'react'

type ColumnConfig = {
  title: string
  ranks: (0 | 1 | 2 | 3 | 4)[]
  accentColor: string
}

const COLUMN_CONFIGS: ColumnConfig[] = [
  {
    title: 'In Progress',
    ranks: [3, 4],
    accentColor: 'text.disabled',
  },
  {
    title: 'Review Required',
    ranks: [2],
    accentColor: 'primary.main',
  },
  {
    title: 'Changes Requested',
    ranks: [1],
    accentColor: 'warning.main',
  },
  {
    title: 'Approved',
    ranks: [0],
    accentColor: 'success.main',
  },
]

type KanbanBoardProps = {
  pullRequests: PullRequest[]
  isLoading: boolean
}

export default function KanbanBoard({
  pullRequests,
  isLoading,
}: KanbanBoardProps) {
  const grouped = useMemo(() => {
    const filters = settingsHandler.loadFilters()
    const result = new Map<string, PullRequest[]>(
      COLUMN_CONFIGS.map(col => [col.title, []]),
    )
    for (const pr of pullRequests) {
      const rank = getStateRank(pr, filters)
      const col = COLUMN_CONFIGS.find(c => c.ranks.includes(rank))
      if (col) result.get(col.title)!.push(pr)
    }
    // Sort each column by createdAt descending
    for (const prs of result.values()) {
      prs.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
    }
    return result
  }, [pullRequests])

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: 1.5,
        overflowX: 'auto',
        pb: 2,
        pt: 0.5,
        minHeight: 'calc(100vh - 130px)',
        alignItems: 'flex-start',
      }}
    >
      {COLUMN_CONFIGS.map(col => (
        <KanbanColumn
          key={col.title}
          title={col.title}
          pullRequests={grouped.get(col.title) ?? []}
          isLoading={isLoading}
          accentColor={col.accentColor}
        />
      ))}
    </Box>
  )
}
