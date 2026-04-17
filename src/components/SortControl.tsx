import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'

export type SortField = 'date' | 'repo' | 'state'
export type SortDir = 'asc' | 'desc'

const FIELDS: {
  key: SortField
  label: string
  defaultDir: SortDir
  hasDir: boolean
}[] = [
  { key: 'date', label: 'Date', defaultDir: 'desc', hasDir: true },
  { key: 'repo', label: 'Repo', defaultDir: 'asc', hasDir: true },
  { key: 'state', label: 'State', defaultDir: 'asc', hasDir: false },
]

type SortControlProps = {
  field: SortField
  dir: SortDir
  onChange: (field: SortField, dir: SortDir) => void
}
export default function SortControl({
  field,
  dir,
  onChange,
}: SortControlProps) {
  const handleClick = (clicked: SortField) => {
    const meta = FIELDS.find(f => f.key === clicked)!
    if (clicked === field && meta.hasDir) {
      onChange(field, dir === 'asc' ? 'desc' : 'asc')
    } else {
      onChange(clicked, meta.defaultDir)
    }
  }

  return (
    <Stack direction="row" alignItems="center" gap={0}>
      {FIELDS.map(({ key, label }) => {
        const isActive = key === field
        const Arrow = dir === 'asc' ? ArrowUpwardIcon : ArrowDownwardIcon
        return (
          <Button
            key={key}
            size="small"
            onClick={() => handleClick(key)}
            endIcon={
              isActive ? (
                <Arrow sx={{ fontSize: '14px !important' }} />
              ) : undefined
            }
            sx={{
              textTransform: 'none',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'text.primary' : 'text.secondary',
              minWidth: 0,
              px: 1,
              borderBottom: isActive ? 2 : 0,
              borderColor: isActive ? 'primary.main' : 'text.disabled',
              borderRadius: 0,
              '&:hover': {
                bgcolor: 'transparent',
                color: 'text.primary',
                borderBottom: 2,
                borderColor: isActive ? 'primary.main' : 'text.disabled',
              },
            }}
            disableRipple
          >
            {label}
          </Button>
        )
      })}
    </Stack>
  )
}
