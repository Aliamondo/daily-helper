import Box from '@mui/material/Box'
import KanbanColumn from './KanbanColumn'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import { SortDir, SortField } from '../../components/SortControl'
import { getDisplayName } from '../../helpers/getDisplayName'
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

// Card heights vary so the skeleton looks like real content, not a grid
const SKELETON_CARD_HEIGHTS = [72, 88, 72, 96, 80]

function KanbanBoardSkeleton() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: 1.5,
        pb: 2,
        pt: 0.5,
        minHeight: 'calc(100vh - 130px)',
        alignItems: 'flex-start',
      }}
    >
      {COLUMN_CONFIGS.map(col => (
        <Box
          key={col.title}
          sx={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          {/* Column header */}
          <Stack
            direction="row"
            alignItems="center"
            gap={1}
            sx={{
              py: 0.75,
              borderBottom: 2,
              borderColor: col.accentColor,
            }}
          >
            <Skeleton variant="text" width={100} height={22} />
            <Skeleton variant="rounded" width={24} height={20} />
          </Stack>
          {/* Skeleton cards */}
          <Stack spacing={0.5}>
            {SKELETON_CARD_HEIGHTS.map((h, i) => (
              <Skeleton
                key={i}
                variant="rounded"
                animation="wave"
                height={h}
                sx={{ borderRadius: 1 }}
              />
            ))}
          </Stack>
        </Box>
      ))}
    </Box>
  )
}

type KanbanBoardProps = {
  pullRequests: PullRequest[]
  isLoading: boolean
  sortField: Exclude<SortField, 'state'>
  sortDir: SortDir
}

export default function KanbanBoard({
  pullRequests,
  isLoading,
  sortField,
  sortDir,
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
    const mul = sortDir === 'asc' ? 1 : -1
    for (const prs of result.values()) {
      prs.sort((a, b) => {
        switch (sortField) {
          case 'repo':
            return mul * a.repositoryName.localeCompare(b.repositoryName)
          case 'author':
            return (
              mul *
              getDisplayName(a.author).localeCompare(getDisplayName(b.author))
            )
          case 'date':
          default:
            return (
              mul *
              (new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime())
            )
        }
      })
    }
    return result
  }, [pullRequests, sortField, sortDir])

  if (isLoading) return <KanbanBoardSkeleton />

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
          isLoading={false}
          accentColor={col.accentColor}
        />
      ))}
    </Box>
  )
}
