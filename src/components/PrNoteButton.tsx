import { useState, useRef } from 'react'
import NoteAltIcon from '@mui/icons-material/NoteAlt'
import NoteAltOutlinedIcon from '@mui/icons-material/NoteAltOutlined'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import NoteEditor from '../views/Notes/NoteEditor'
import { NoteCard, TodoNoteCard } from '../views/Notes/NoteGroup'
import { notesHandler } from '../helpers/notesHandler'

type PrNoteButtonProps = {
  prId: string
  prNumber: number
  prTitle: string
  prUrl: string
  repositoryName: string
  size?: 'small' | 'medium'
}

export default function PrNoteButton({
  prId,
  prNumber,
  prTitle,
  prUrl,
  repositoryName,
  size = 'medium',
}: PrNoteButtonProps) {
  const [note, setNote] = useState<NoteItem | null>(() =>
    notesHandler.getPrNote(repositoryName, prId, prNumber, prTitle),
  )
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const hasNote =
    note !== null &&
    (note.content?.trim() !== '' || (note.items?.length ?? 0) > 0)

  const groupId = note ? (notesHandler.findNoteGroupId(note.id) ?? '') : ''

  const refreshNote = () =>
    setNote(notesHandler.getPrNote(repositoryName, prId, prNumber, prTitle))

  // Creating a brand-new markdown note via the popover
  const handleCreate = (content: string) => {
    notesHandler.savePrNote({
      prId,
      prNumber,
      prTitle,
      prUrl,
      repositoryName,
      content,
    })
    refreshNote()
  }

  return (
    <>
      <Tooltip title={hasNote ? 'View note' : 'Add note'}>
        <IconButton
          ref={buttonRef}
          size={size}
          onClick={() => setAnchorEl(buttonRef.current)}
          sx={{
            color: hasNote ? 'primary.main' : 'text.disabled',
            p: size === 'small' ? 0.25 : 0.5,
          }}
        >
          {hasNote ? (
            <NoteAltIcon fontSize={size === 'small' ? 'small' : 'medium'} />
          ) : (
            <NoteAltOutlinedIcon
              fontSize={size === 'small' ? 'small' : 'medium'}
            />
          )}
        </IconButton>
      </Tooltip>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        disableRestoreFocus
      >
        <Box sx={{ minWidth: 400, maxWidth: 600, p: 2 }}>
          <Stack spacing={1.5}>
            <Stack direction="row" alignItems="baseline" spacing={0.5}>
              <Typography variant="caption" color="text.secondary">
                Note for
              </Typography>
              <Typography
                variant="caption"
                fontWeight={600}
                sx={{ fontFamily: 'monospace' }}
              >
                {repositoryName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                #{prNumber}
              </Typography>
            </Stack>

            {note === null ? (
              <NoteEditor value="" onSave={handleCreate} minRows={5} />
            ) : note.type === 'todo' ? (
              <TodoNoteCard
                note={note}
                groupId={groupId}
                onDelete={() => {
                  notesHandler.deleteNote(groupId, note.id)
                  setNote(null)
                  setAnchorEl(null)
                }}
                onTodoChange={refreshNote}
              />
            ) : (
              <NoteCard
                note={note}
                groupId={groupId}
                onUpdate={content => {
                  notesHandler.updateNote(groupId, note.id, content)
                  refreshNote()
                }}
                onDelete={() => {
                  notesHandler.deleteNote(groupId, note.id)
                  setNote(null)
                  setAnchorEl(null)
                }}
                onReload={refreshNote}
              />
            )}
          </Stack>
        </Box>
      </Popover>
    </>
  )
}
