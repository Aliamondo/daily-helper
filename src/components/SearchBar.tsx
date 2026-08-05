import { useEffect, useState } from 'react'

import CloseIcon from '@mui/icons-material/Close'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import SearchIcon from '@mui/icons-material/Search'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import { useDebounce } from '../hooks/useDebounce'

const DEBOUNCE_MS = 120

type SearchBarProps = {
  onSearch: (query: string) => void
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [expanded, setExpanded] = useState(false)
  const [value, setValue] = useState('')
  const debouncedValue = useDebounce(value, DEBOUNCE_MS)

  useEffect(() => {
    onSearch(debouncedValue)
  }, [debouncedValue, onSearch])

  const collapseIfEmpty = () => {
    if (!value) setExpanded(false)
  }

  const clear = () => {
    setValue('')
    setExpanded(false)
  }

  if (!expanded) {
    return (
      <Tooltip title="Search">
        <IconButton
          size="large"
          color="inherit"
          aria-label="Search"
          onClick={() => setExpanded(true)}
        >
          <SearchIcon />
        </IconButton>
      </Tooltip>
    )
  }

  return (
    <TextField
      autoFocus
      size="small"
      placeholder="Search…"
      value={value}
      onChange={e => setValue(e.target.value)}
      onBlur={collapseIfEmpty}
      onKeyDown={e => {
        if (e.key === 'Escape') clear()
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon
              fontSize="small"
              sx={{ color: 'inherit', opacity: 0.8 }}
            />
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              size="small"
              color="inherit"
              aria-label="Clear search"
              // onMouseDown so the field's onBlur doesn't fire first and swallow the click
              onMouseDown={e => e.preventDefault()}
              onClick={clear}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ),
      }}
      sx={{
        width: { xs: 150, sm: 240 },
        '& .MuiOutlinedInput-root': {
          color: 'inherit',
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
          '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
          '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
          '&.Mui-focused fieldset': {
            borderColor: 'rgba(255, 255, 255, 0.7)',
          },
        },
        '& .MuiInputBase-input::placeholder': {
          color: 'inherit',
          opacity: 0.7,
        },
      }}
    />
  )
}
