import { useState, useEffect, KeyboardEvent } from 'react'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import ReactMarkdown from 'react-markdown'

const markdownSx = {
  typography: 'body2',
  '& p': { mt: 0, mb: 1 },
  '& p:last-child': { mb: 0 },
  '& ul, & ol': { mt: 0, mb: 1, pl: 2.5 },
  '& li': { mb: 0.25 },
  '& h1, & h2, & h3, & h4': { mt: 1, mb: 0.5 },
  '& code': {
    bgcolor: 'action.hover',
    px: 0.5,
    borderRadius: 0.5,
    fontFamily: 'monospace',
    fontSize: '0.85em',
  },
  '& pre': {
    bgcolor: 'action.hover',
    p: 1,
    borderRadius: 1,
    overflowX: 'auto',
  },
  '& pre code': { bgcolor: 'transparent', px: 0 },
  '& a': { color: 'primary.main' },
  '& blockquote': {
    borderLeft: 3,
    borderColor: 'divider',
    pl: 1.5,
    ml: 0,
    color: 'text.secondary',
  },
} as const

export { markdownSx }

type NoteEditorProps = {
  value: string
  onSave: (value: string) => void
  placeholder?: string
  minRows?: number
  /** Removes border/padding in preview mode — use when the parent card provides the container */
  bare?: boolean
}

export default function NoteEditor({
  value,
  onSave,
  placeholder = 'Click to add a note…',
  minRows = 4,
  bare = false,
}: NoteEditorProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  // Sync incoming value changes (e.g. after parent reloads) only when not actively editing
  useEffect(() => {
    if (!editing) setDraft(value)
  }, [value, editing])

  const commit = (text: string) => {
    onSave(text)
    setEditing(false)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      commit(draft)
    }
    if (e.key === 'Escape') {
      setDraft(value) // discard
      setEditing(false)
    }
  }

  if (editing) {
    return (
      <TextField
        multiline
        fullWidth
        autoFocus
        minRows={minRows}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={() => commit(draft)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        variant="outlined"
        size="small"
        inputProps={{ style: { fontFamily: 'monospace', fontSize: '0.85rem' } }}
      />
    )
  }

  return (
    <Box
      onClick={() => setEditing(true)}
      sx={{
        minHeight: minRows * 22,
        cursor: 'text',
        borderRadius: 1,
        ...(bare
          ? {}
          : {
              p: 1,
              border: 1,
              borderColor: 'transparent',
              '&:hover': { borderColor: 'divider', bgcolor: 'action.hover' },
            }),
        ...markdownSx,
      }}
    >
      {draft ? (
        <ReactMarkdown>{draft}</ReactMarkdown>
      ) : (
        <Box
          sx={{
            color: 'text.disabled',
            fontStyle: 'italic',
            userSelect: 'none',
          }}
        >
          {placeholder}
        </Box>
      )}
    </Box>
  )
}
