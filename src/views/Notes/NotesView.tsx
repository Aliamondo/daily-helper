import { useState, useEffect, useRef, useCallback } from 'react'
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

const COLUMN_MIN_WIDTH = 360
const GAP = 16

function estimateGroupHeight(group: NoteGroup): number {
  return group.notes.reduce((sum, note) => {
    if (note.type === 'todo') return sum + 1 + (note.items?.length ?? 0)
    return sum + 2
  }, 2)
}

function distributeIntoColumns(
  groups: NoteGroup[],
  colCount: number,
): NoteGroup[][] {
  const columns: NoteGroup[][] = Array.from({ length: colCount }, () => [])
  const heights: number[] = Array(colCount).fill(0)
  for (const group of groups) {
    const shortest = heights.indexOf(Math.min(...heights))
    columns[shortest].push(group)
    heights[shortest] += estimateGroupHeight(group)
  }
  return columns
}

type NotesViewProps = {
  trackedRepos: string[]
}

export default function NotesView({ trackedRepos }: NotesViewProps) {
  const [notesData, setNotesData] = useState<NotesData>(() =>
    notesHandler.load(),
  )
  const [addingGroup, setAddingGroup] = useState(false)
  const [newGroupTitle, setNewGroupTitle] = useState('')
  const [containerWidth, setContainerWidth] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const reload = () => setNotesData(notesHandler.load())

  useEffect(() => {
    if (trackedRepos.length > 0) {
      notesHandler.ensureRepoGroups(trackedRepos)
      reload()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackedRepos.join(',')])

  const measureRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return
    ;(containerRef as React.MutableRefObject<HTMLDivElement | null>).current =
      node
    const observer = new ResizeObserver(entries => {
      setContainerWidth(entries[0].contentRect.width)
    })
    observer.observe(node)
  }, [])

  const visibleGroups = notesData.groups.filter(g => !g.hidden)
  const hiddenGroups = notesData.groups.filter(g => g.hidden)

  const colCount =
    containerWidth > 0
      ? Math.max(
          1,
          Math.floor((containerWidth + GAP) / (COLUMN_MIN_WIDTH + GAP)),
        )
      : 1
  const columns = distributeIntoColumns(visibleGroups, colCount)

  const handleAddGroup = () => {
    const title = newGroupTitle.trim()
    if (!title) return
    notesHandler.addCustomGroup(title)
    setNewGroupTitle('')
    setAddingGroup(false)
    reload()
  }

  const renderGroup = (group: NoteGroup) => (
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
  )

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

      {/* Masonry board */}
      <Box
        ref={measureRef}
        sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}
      >
        {columns.map((colGroups, ci) => (
          <Stack key={ci} sx={{ flex: 1, minWidth: 0 }} spacing={2}>
            {colGroups.map(renderGroup)}
          </Stack>
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
