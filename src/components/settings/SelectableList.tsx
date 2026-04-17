import { ReactNode } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import CircularProgress from '@mui/material/CircularProgress'
import FirstPageIcon from '@mui/icons-material/FirstPage'
import FormControlLabel from '@mui/material/FormControlLabel'
import Grid from '@mui/material/Grid'
import LastPageIcon from '@mui/icons-material/LastPage'
import NextIcon from '@mui/icons-material/ChevronRight'
import PreviousIcon from '@mui/icons-material/ChevronLeft'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

export type SelectableListItem = {
  key: string
  label: ReactNode
}

type SelectableListProps = {
  icon: ReactNode
  title: string
  isLoading: boolean
  items: SelectableListItem[]
  selectedKeys: Set<string>
  setSelectedKeys: (newValue: Set<string>) => void
  columnMinWidth?: number
  pageable?: Pageable
  pageSize?: number
  onNavigate?: (page: PageNavigation, pageable: Pageable) => void
}

type PaginationControlsProps = {
  hasPreviousPage: boolean
  hasNextPage: boolean
  onFirst: VoidFunction
  onPrev: VoidFunction
  onNext: VoidFunction
  onLast: VoidFunction
}
function PaginationControls({
  hasPreviousPage,
  hasNextPage,
  onFirst,
  onPrev,
  onNext,
  onLast,
}: PaginationControlsProps) {
  return (
    <Grid container item xs={12} justifyContent="space-around">
      <Grid container item xs={6} columnGap={2} justifyContent="center">
        <Grid item xs={3}>
          <Button
            onClick={onFirst}
            disabled={!hasPreviousPage}
            startIcon={<FirstPageIcon />}
          >
            First
          </Button>
        </Grid>
        <Grid item xs={3}>
          <Button
            onClick={onPrev}
            disabled={!hasPreviousPage}
            startIcon={<PreviousIcon />}
          >
            Prev
          </Button>
        </Grid>
      </Grid>
      <Grid container item xs={6} columnGap={2} justifyContent="center">
        <Grid item xs={3}>
          <Button
            onClick={onNext}
            disabled={!hasNextPage}
            endIcon={<NextIcon />}
          >
            Next
          </Button>
        </Grid>
        <Grid item xs={3}>
          <Button
            onClick={onLast}
            disabled={!hasNextPage}
            endIcon={<LastPageIcon />}
          >
            Last
          </Button>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default function SelectableList({
  icon,
  title,
  isLoading,
  items,
  selectedKeys,
  setSelectedKeys,
  columnMinWidth = 200,
  pageable,
  pageSize,
  onNavigate,
}: SelectableListProps) {
  const total = pageable?.total ?? items.length
  const selectedSize = selectedKeys.size
  const hasData = items.length > 0 || !!pageable

  const statsLabel =
    total > 0
      ? ` (${total} total${
          selectedSize > 0 && selectedSize < total
            ? `, ${selectedSize} selected`
            : ', none selected'
        })`
      : ''

  const handleSelectAllOnPage = () => {
    const next = new Set(selectedKeys)
    items.forEach(item => next.add(item.key))
    setSelectedKeys(next)
  }

  const handleUnselectAll = () => setSelectedKeys(new Set())

  const handleToggle = (key: string) => {
    const next = new Set(selectedKeys)
    if (next.has(key)) {
      next.delete(key)
    } else {
      next.add(key)
    }
    setSelectedKeys(next)
  }

  return (
    <>
      <Grid container item xs={12} justifyContent="space-between">
        <Grid item>
          <Typography
            component="div"
            color={!title ? 'text.secondary' : undefined}
          >
            <Stack direction="row" alignItems="center" sx={{ fontWeight: 800 }}>
              {icon}
              <span>
                {title}
                {statsLabel}
              </span>
              {isLoading && (
                <CircularProgress size={20} sx={{ marginLeft: 1 }} />
              )}
            </Stack>
          </Typography>
        </Grid>
        {hasData && (
          <Grid item>
            <Button size="small" onClick={handleSelectAllOnPage}>
              Select all
            </Button>
            <Button
              size="small"
              onClick={handleUnselectAll}
              disabled={!selectedKeys.size}
            >
              Unselect all
            </Button>
          </Grid>
        )}
      </Grid>
      <Grid item xs={12}>
        {items.length > 0 ? (
          <Box sx={{ columns: `${columnMinWidth}px`, columnGap: 1, mt: 0.5 }}>
            {items.map(({ key, label }) => (
              <Box key={key} sx={{ breakInside: 'avoid' }}>
                <FormControlLabel
                  label={label}
                  control={
                    <Checkbox
                      checked={selectedKeys.has(key)}
                      onClick={() => handleToggle(key)}
                    />
                  }
                />
              </Box>
            ))}
          </Box>
        ) : (
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            No data available
          </Typography>
        )}
      </Grid>
      {pageable && onNavigate && pageSize && pageable.total > pageSize && (
        <PaginationControls
          hasPreviousPage={pageable.hasPreviousPage}
          hasNextPage={pageable.hasNextPage}
          onFirst={() => onNavigate('FIRST_PAGE', pageable)}
          onPrev={() => onNavigate('PREVIOUS_PAGE', pageable)}
          onNext={() => onNavigate('NEXT_PAGE', pageable)}
          onLast={() => onNavigate('LAST_PAGE', pageable)}
        />
      )}
    </>
  )
}
