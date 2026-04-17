import { KeyboardEvent, useState } from 'react'

import AddIcon from '@mui/icons-material/Add'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
type ChipListEditorProps = {
  label: string
  description: string
  items: string[]
  onChange: (items: string[]) => void
}
function ChipListEditor({
  label,
  description,
  items,
  onChange,
}: ChipListEditorProps) {
  const [input, setInput] = useState('')

  const handleAdd = () => {
    const trimmed = input.trim()
    if (trimmed && !items.includes(trimmed)) {
      onChange([...items, trimmed])
    }
    setInput('')
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <Grid container item xs={12} rowGap={1}>
      <Grid item xs={12}>
        <Typography sx={{ fontWeight: 800 }}>{label}</Typography>
        <Typography variant="caption" color="text.secondary">
          {description}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
          {items.map(item => (
            <Chip
              key={item}
              label={item}
              size="small"
              onDelete={() => onChange(items.filter(i => i !== item))}
            />
          ))}
        </Box>
        <TextField
          size="small"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add and press Enter"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={handleAdd}
                  disabled={!input.trim()}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Grid>
    </Grid>
  )
}

type FiltersSettingProps = {
  filters: Settings_Filters
  setFilters: (filters: Settings_Filters) => void
}
export default function FiltersSetting({
  filters,
  setFilters,
}: FiltersSettingProps) {
  const update = (patch: Partial<Settings_Filters>) => {
    setFilters({ ...filters, ...patch })
  }

  return (
    <Grid container rowGap={4}>
      <ChipListEditor
        label="Bot name patterns"
        description="Hide PRs from authors whose display name contains any of these strings. Checked case-insensitively."
        items={filters.botPatterns}
        onChange={botPatterns => update({ botPatterns })}
      />
      <ChipListEditor
        label="Known bot logins"
        description="Hide PRs from these exact GitHub logins, regardless of display name."
        items={filters.botLogins}
        onChange={botLogins => update({ botLogins })}
      />
      <ChipListEditor
        label="Always show if title contains"
        description="Override the bot filter — show the PR anyway if its title contains any of these words."
        items={filters.titleWhitelist}
        onChange={titleWhitelist => update({ titleWhitelist })}
      />
    </Grid>
  )
}
