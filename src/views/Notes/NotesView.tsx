import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import RestoreIcon from '@mui/icons-material/Restore'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import NoteGroup from './NoteGroup'
import { notesHandler } from '../../helpers/notesHandler'

type NotesViewProps = {
  trackedRepos: string[]
}

export default function NotesView({ trackedRepos }: NotesViewProps) {
  const [notesData, setNotesData] = useState<NotesData>(() =>
    notesHandler.load(),
  )
  const [addingGroup, setAddingGroup] = useState(false)
  const [newGroupTitle, setNewGroupTitle] = useState('')

  const reload = () => setNotesData(notesHandler.load())

  useEffect(() => {
    if (trackedRepos.length > 0) {
      notesHandler.ensureRepoGroups(trackedRepos)
      reload()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackedRepos.join(',')])

  const visibleGroups = notesData.groups.filter(g => !g.hidden)
  const hiddenGroups = notesData.groups.filter(g => g.hidden)

  const handleAddGroup = () => {
    const title = newGroupTitle.trim()
    if (!title) return
    notesHandler.addCustomGroup(title)
    setNewGroupTitle('')
    setAddingGroup(false)
    reload()
  }

  return (
    <Box sx={{ py: 2, px: 1 }}>
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography variant="h6" fontWeight={600}>
          Notes
        </Typography>
        {addingGroup ? (
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              size="small"
              placeholder="Group name"
              value={newGroupTitle}
              autoFocus
              onChange={e => setNewGroupTitle(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleAddGroup()
                if (e.key === 'Escape') {
                  setAddingGroup(false)
                  setNewGroupTitle('')
                }
              }}
              sx={{ width: 200 }}
            />
            <Button
              size="small"
              variant="contained"
              disableElevation
              onClick={handleAddGroup}
            >
              Add
            </Button>
            <Button
              size="small"
              onClick={() => {
                setAddingGroup(false)
                setNewGroupTitle('')
              }}
            >
              Cancel
            </Button>
          </Stack>
        ) : (
          <Button size="small" onClick={() => setAddingGroup(true)}>
            + Add group
          </Button>
        )}
      </Stack>

      {visibleGroups.length === 0 && (
        <Typography
          variant="body2"
          color="text.disabled"
          sx={{ textAlign: 'center', py: 6 }}
        >
          No repos tracked yet. Configure your team in Settings to get started.
        </Typography>
      )}

      {/* Dashboard grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: 2,
          alignItems: 'start',
        }}
      >
        {visibleGroups.map(group => (
          <NoteGroup
            key={group.id}
            group={group}
            onRenameGroup={title => {
              notesHandler.updateGroup(group.id, { title })
              reload()
            }}
            onHideGroup={() => {
              notesHandler.hideGroup(group.id)
              reload()
            }}
            onAddNote={content => {
              notesHandler.addNote(group.id, content)
              reload()
            }}
            onAddTodoNote={() => {
              notesHandler.addTodoNote(group.id)
              reload()
            }}
            onUpdateNote={(noteId, content) => {
              notesHandler.updateNote(group.id, noteId, content)
              reload()
            }}
            onDeleteNote={noteId => {
              notesHandler.deleteNote(group.id, noteId)
              reload()
            }}
            onTodoChange={reload}
          />
        ))}
      </Box>

      {/* Hidden groups restore row */}
      {hiddenGroups.length > 0 && (
        <>
          <Divider sx={{ my: 3 }} />
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={600}
            display="block"
            mb={1}
          >
            Hidden
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {hiddenGroups.map(group => (
              <Chip
                key={group.id}
                label={
                  group.notes.length > 0
                    ? `${group.title} (${group.notes.length})`
                    : group.title
                }
                size="small"
                icon={<RestoreIcon />}
                onClick={() => {
                  notesHandler.updateGroup(group.id, { hidden: false })
                  reload()
                }}
                variant="outlined"
                clickable
              />
            ))}
          </Stack>
        </>
      )}
    </Box>
  )
}
