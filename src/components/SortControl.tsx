import React from 'react'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'

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
  const handleChange = (_: React.MouseEvent, newField: SortField | null) => {
    if (newField === null) {
      const meta = FIELDS.find(f => f.key === field)!
      if (meta.hasDir) onChange(field, dir === 'asc' ? 'desc' : 'asc')
    } else {
      const meta = FIELDS.find(f => f.key === newField)!
      onChange(newField, meta.defaultDir)
    }
  }

  const Arrow = dir === 'asc' ? ArrowUpwardIcon : ArrowDownwardIcon

  return (
    <ToggleButtonGroup
      value={field}
      exclusive
      size="small"
      onChange={handleChange}
    >
      {FIELDS.map(({ key, label, hasDir }) => (
        <ToggleButton
          key={key}
          value={key}
          sx={{ textTransform: 'none', px: 1.5, py: 0.5, gap: 0.5 }}
        >
          {label}
          {key === field && <Arrow sx={{ fontSize: 14 }} />}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}
