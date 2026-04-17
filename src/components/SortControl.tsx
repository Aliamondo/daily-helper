import React from 'react'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

export type SortField = 'date' | 'repo' | 'state' | 'author'
export type SortDir = 'asc' | 'desc'

const FIELDS: {
  key: SortField
  label: string
  defaultDir: SortDir
  hasDir: boolean
}[] = [
  { key: 'date', label: 'Date', defaultDir: 'desc', hasDir: true },
  { key: 'repo', label: 'Repo', defaultDir: 'asc', hasDir: true },
  { key: 'author', label: 'Author', defaultDir: 'asc', hasDir: true },
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

  const Arrow = dir === 'asc' ? ArrowUpwardIcon : ArrowDownwardIcon

  return (
    <Stack direction="row" alignItems="center" gap={0.5}>
      {FIELDS.map(({ key, label }) => {
        const isActive = key === field
        return (
          <Stack
            key={key}
            direction="row"
            alignItems="center"
            onClick={() => handleClick(key)}
            sx={{
              cursor: 'pointer',
              px: 1,
              py: 0.5,
              borderRadius: 1,
              color: isActive ? 'primary.main' : 'text.secondary',
              '&:hover': {
                color: isActive ? 'primary.main' : 'text.primary',
                bgcolor: 'action.hover',
              },
            }}
          >
            <Typography variant="body2" fontWeight={isActive ? 600 : 400}>
              {label}
            </Typography>
            {isActive && <Arrow sx={{ fontSize: 14, ml: 0.25 }} />}
          </Stack>
        )
      })}
    </Stack>
  )
}
