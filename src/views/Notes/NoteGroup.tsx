import { useState, KeyboardEvent } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import CloseIcon from '@mui/icons-material/Close'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import LinkIcon from '@mui/icons-material/Link'
import LinkOffIcon from '@mui/icons-material/LinkOff'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import ReactMarkdown from 'react-markdown'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import NoteEditor, { markdownSx } from './NoteEditor'
import { notesHandler } from '../../helpers/notesHandler'
import { settingsHandler } from '../../helpers/settingsHandler'

// ── Shared hover-reveal style for action buttons ──────────────────────────────
const actionSx = {
  opacity: 0,
  transition: 'opacity 0.15s',
} as const

// ── Shared card shell — PR linking, hover-reveal buttons, outer box ───────────

type NoteCardShellProps = {
  note: NoteItem
  groupId: string
  onDelete: () => void
  onReload: () => void
  deleteTooltip: string
  children: React.ReactNode
}

function NoteCardShell({
  note,
  groupId,
  onDelete,
  onReload,
  deleteTooltip,
  children,
}: NoteCardShellProps) {
  const [linkingPr, setLinkingPr] = useState(false)
  const [prUrl, setPrUrl] = useState('')
  const [prTitle, setPrTitle] = useState('')

  const parsePrNumber = (url: string) => {
    const m = url.match(/\/pull\/(\d+)/)
    return m ? parseInt(m[1], 10) : null
  }

  const cancelLink = () => {
    setLinkingPr(false)
    setPrUrl('')
    setPrTitle('')
  }

  const fetchPrTitle = async (url: string) => {
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/)
    if (!match) return
    const [, owner, repo, number] = match
    const token = settingsHandler.loadGithubToken()
    if (!token) return
    try {
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/pulls/${number}`,
        {
          headers: { Authorization: `token ${token}` },
        },
      )
      if (!res.ok) return
      const data = (await res.json()) as { title?: string }
      if (data.title) setPrTitle(t => (t.trim() ? t : data.title!))
    } catch {
      /* silently ignore */
    }
  }

  const commitLink = () => {
    const url = prUrl.trim()
    if (!url) {
      cancelLink()
      return
    }
    const num = parsePrNumber(url)
    notesHandler.setNotePrRef(groupId, note.id, {
      prId: num?.toString() ?? url,
      prNumber: num ?? 0,
      prTitle: prTitle.trim(),
      prUrl: url,
    })
    onReload()
    cancelLink()
  }

  const unlink = () => {
    notesHandler.setNotePrRef(groupId, note.id, undefined)
    onReload()
  }

  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: 1,
        py: 0.5,
        px: 0.75,
        '&:hover': { bgcolor: 'action.hover' },
        '& .card-action': actionSx,
        '&:hover .card-action': { opacity: 1 },
      }}
    >
      {/* PR link header — shown when linked */}
      {note.prRef && (
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.5}
          mb={0.5}
          sx={{ pr: 6, minWidth: 0 }}
        >
          <Link
            href={note.prRef.prUrl}
            target="_blank"
            rel="noopener"
            variant="caption"
            fontWeight={600}
            underline="hover"
            sx={{ fontFamily: 'monospace' }}
          >
            {note.prRef.prTitle
              ? `#${note.prRef.prNumber}: ${note.prRef.prTitle}`
              : `#${note.prRef.prNumber}`}
          </Link>
          <OpenInNewIcon
            sx={{ fontSize: 11, color: 'text.disabled', flexShrink: 0 }}
          />
          <Tooltip title="Unlink PR">
            <IconButton
              className="card-action"
              size="small"
              onClick={unlink}
              sx={{
                p: 0.1,
                flexShrink: 0,
                color: 'text.disabled',
                '&:hover': { color: 'warning.main' },
              }}
            >
              <LinkOffIcon sx={{ fontSize: 12 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      )}

      {/* Inline link-to-PR form */}
      {linkingPr && (
        <Stack spacing={0.75} mb={0.75}>
          <TextField
            size="small"
            variant="outlined"
            placeholder="PR URL  (e.g. github.com/owner/repo/pull/123)"
            value={prUrl}
            autoFocus
            fullWidth
            onChange={e => {
              const val = e.target.value
              setPrUrl(val)
              if (/github\.com\/[^/]+\/[^/]+\/pull\/\d+/.test(val))
                fetchPrTitle(val)
            }}
            onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
              if (e.key === 'Enter') commitLink()
              if (e.key === 'Escape') cancelLink()
            }}
            inputProps={{ style: { fontSize: '0.8rem' } }}
          />
          <TextField
            size="small"
            variant="outlined"
            placeholder="PR title  (optional — fetched automatically)"
            value={prTitle}
            fullWidth
            onChange={e => setPrTitle(e.target.value)}
            onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
              if (e.key === 'Enter') commitLink()
              if (e.key === 'Escape') cancelLink()
            }}
            inputProps={{ style: { fontSize: '0.8rem' } }}
          />
          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
            <Button size="small" onClick={cancelLink}>
              Cancel
            </Button>
            <Button
              size="small"
              variant="contained"
              disableElevation
              onClick={commitLink}
            >
              Link
            </Button>
          </Stack>
        </Stack>
      )}

      {/* Card-specific content — right padding reserves space for action buttons */}
      <Box sx={{ pr: 6 }}>{children}</Box>

      {/* Link button — only when not linked and form is closed */}
      {!note.prRef && !linkingPr && (
        <Tooltip title="Link to PR">
          <IconButton
            className="card-action"
            size="small"
            onClick={() => setLinkingPr(true)}
            sx={{
              position: 'absolute',
              top: 4,
              right: 28,
              p: 0.25,
              color: 'text.disabled',
              '&:hover': { color: 'primary.main' },
            }}
          >
            <LinkIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      <Tooltip title={deleteTooltip}>
        <IconButton
          className="card-action"
          size="small"
          onClick={onDelete}
          sx={{
            position: 'absolute',
            top: 4,
            right: 4,
            p: 0.25,
            color: 'text.disabled',
            '&:hover': { color: 'error.main' },
          }}
        >
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  )
}

// ── Note card (markdown) ──────────────────────────────────────────────────────

type NoteCardProps = {
  note: NoteItem
  groupId: string
  onUpdate: (content: string) => void
  onDelete: () => void
  onReload: () => void
}

export function NoteCard({
  note,
  groupId,
  onUpdate,
  onDelete,
  onReload,
}: NoteCardProps) {
  return (
    <NoteCardShell
      note={note}
      groupId={groupId}
      onDelete={onDelete}
      onReload={onReload}
      deleteTooltip="Delete note"
    >
      <NoteEditor
        bare
        value={note.content ?? ''}
        onSave={onUpdate}
        minRows={2}
      />
    </NoteCardShell>
  )
}

// ── Todo item row ─────────────────────────────────────────────────────────────

type TodoItemRowProps = {
  item: TodoItem
  groupId: string
  noteId: string
  onTodoChange: () => void
}

function TodoItemRow({
  item,
  groupId,
  noteId,
  onTodoChange,
}: TodoItemRowProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(item.text)

  const commitText = () => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== item.text) {
      notesHandler.updateTodoItemText(groupId, noteId, item.id, trimmed)
      onTodoChange()
    } else {
      setDraft(item.text)
    }
    setEditing(false)
  }

  return (
    <Stack
      direction="row"
      alignItems="flex-start"
      spacing={0.5}
      sx={{
        '& .row-action': actionSx,
        '&:hover .row-action': { opacity: 1 },
      }}
    >
      <Checkbox
        checked={item.done}
        onChange={() => {
          notesHandler.toggleTodoItem(groupId, noteId, item.id)
          onTodoChange()
        }}
        size="small"
        sx={{ p: 0, mt: 0.2, flexShrink: 0 }}
      />

      {editing ? (
        <TextField
          size="small"
          variant="standard"
          value={draft}
          autoFocus
          fullWidth
          onChange={e => setDraft(e.target.value)}
          onBlur={commitText}
          onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter') commitText()
            if (e.key === 'Escape') {
              setDraft(item.text)
              setEditing(false)
            }
          }}
          inputProps={{ style: { fontSize: '0.875rem' } }}
        />
      ) : (
        <Box
          onClick={() => setEditing(true)}
          sx={{
            flexGrow: 1,
            cursor: 'text',
            textDecoration: item.done ? 'line-through' : 'none',
            color: item.done ? 'text.disabled' : 'text.primary',
            lineHeight: 1.5,
            ...markdownSx,
            // inline-only: suppress block spacing
            '& p': { m: 0, display: 'inline' },
          }}
        >
          <ReactMarkdown
            components={{ p: ({ children }) => <span>{children}</span> }}
          >
            {item.text}
          </ReactMarkdown>
        </Box>
      )}

      <Tooltip title="Remove item">
        <IconButton
          className="row-action"
          size="small"
          onClick={() => {
            notesHandler.deleteTodoItem(groupId, noteId, item.id)
            onTodoChange()
          }}
          sx={{
            p: 0.25,
            flexShrink: 0,
            color: 'text.disabled',
            '&:hover': { color: 'error.main' },
          }}
        >
          <CloseIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Tooltip>
    </Stack>
  )
}

// ── Todo note card ────────────────────────────────────────────────────────────

type TodoNoteCardProps = {
  note: NoteItem
  groupId: string
  onDelete: () => void
  onTodoChange: () => void
}

export function TodoNoteCard({
  note,
  groupId,
  onDelete,
  onTodoChange,
}: TodoNoteCardProps) {
  const [addingItem, setAddingItem] = useState(() => note.items?.length === 0)
  const [itemDraft, setItemDraft] = useState('')

  const saveItem = (andClose: boolean) => {
    const trimmed = itemDraft.trim()
    if (trimmed) {
      notesHandler.addTodoItem(groupId, note.id, trimmed)
      onTodoChange()
      setItemDraft('')
    }
    if (andClose || !trimmed) setAddingItem(false)
  }

  return (
    <NoteCardShell
      note={note}
      groupId={groupId}
      onDelete={onDelete}
      onReload={onTodoChange}
      deleteTooltip="Delete checklist"
    >
      <Stack spacing={0.25}>
        {[...(note.items ?? [])]
          .sort((a, b) => Number(a.done) - Number(b.done))
          .map(item => (
            <TodoItemRow
              key={item.id}
              item={item}
              groupId={groupId}
              noteId={note.id}
              onTodoChange={onTodoChange}
            />
          ))}

        {addingItem ? (
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Checkbox size="small" disabled sx={{ p: 0, flexShrink: 0 }} />
            <TextField
              size="small"
              variant="standard"
              value={itemDraft}
              autoFocus
              fullWidth
              placeholder="New item…"
              onChange={e => setItemDraft(e.target.value)}
              onBlur={() => saveItem(true)}
              onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  saveItem(false)
                }
                if (e.key === 'Escape') {
                  setItemDraft('')
                  setAddingItem(false)
                }
              }}
              inputProps={{ style: { fontSize: '0.875rem' } }}
            />
          </Stack>
        ) : (
          <Typography
            className="card-action"
            variant="caption"
            color="text.disabled"
            onClick={() => setAddingItem(true)}
            sx={{
              cursor: 'pointer',
              pl: 3.25,
              '&:hover': { color: 'text.secondary' },
            }}
          >
            + Add item
          </Typography>
        )}
      </Stack>
    </NoteCardShell>
  )
}

// ── Inline new-note form ──────────────────────────────────────────────────────

type AddNoteFormProps = {
  onCommit: (content: string) => void
  onCancel: () => void
}

function AddNoteForm({ onCommit, onCancel }: AddNoteFormProps) {
  const [draft, setDraft] = useState('')

  const commit = () => {
    const t = draft.trim()
    if (t) onCommit(t)
    else onCancel()
  }

  return (
    <TextField
      multiline
      fullWidth
      autoFocus
      minRows={3}
      value={draft}
      onChange={e => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) commit()
        if (e.key === 'Escape') onCancel()
      }}
      placeholder="Write a note in markdown… (Ctrl+Enter to save, Esc to cancel)"
      variant="outlined"
      size="small"
      inputProps={{ style: { fontFamily: 'monospace', fontSize: '0.85rem' } }}
    />
  )
}

// ── Group panel ───────────────────────────────────────────────────────────────

type NoteGroupProps = {
  group: NoteGroup
  onRenameGroup?: (title: string) => void
  onHideGroup: () => void
  onAddNote: (content: string) => void
  onAddTodoNote: () => void
  onUpdateNote: (noteId: string, content: string) => void
  onDeleteNote: (noteId: string) => void
  onTodoChange: () => void
}

export default function NoteGroup({
  group,
  onRenameGroup,
  onHideGroup,
  onAddNote,
  onAddTodoNote,
  onUpdateNote,
  onDeleteNote,
  onTodoChange,
}: NoteGroupProps) {
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState(group.title)
  const [addingNote, setAddingNote] = useState(false)

  const isRepo = group.isRepoPanel === true

  const handleTitleCommit = () => {
    setEditingTitle(false)
    const t = titleDraft.trim()
    if (t && t !== group.title) onRenameGroup?.(t)
    else setTitleDraft(group.title)
  }

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        '& .group-action': actionSx,
        '&:hover .group-action': { opacity: 1 },
      }}
    >
      {/* Title row */}
      <Stack
        direction="row"
        alignItems="center"
        sx={{ px: 1.5, pt: 1.25, pb: 0.75 }}
      >
        {isRepo ? (
          <Typography
            variant="subtitle2"
            fontWeight={700}
            sx={{ flexGrow: 1, fontFamily: 'monospace' }}
          >
            {group.title}
          </Typography>
        ) : editingTitle ? (
          <TextField
            value={titleDraft}
            size="small"
            variant="standard"
            autoFocus
            onChange={e => setTitleDraft(e.target.value)}
            onBlur={handleTitleCommit}
            onKeyDown={e => {
              if (e.key === 'Enter') handleTitleCommit()
              if (e.key === 'Escape') {
                setTitleDraft(group.title)
                setEditingTitle(false)
              }
            }}
            inputProps={{ style: { fontSize: '0.875rem', fontWeight: 600 } }}
            sx={{ flexGrow: 1 }}
          />
        ) : (
          <Typography
            variant="subtitle2"
            fontWeight={700}
            onDoubleClick={() => setEditingTitle(true)}
            sx={{ flexGrow: 1, cursor: 'text', userSelect: 'none' }}
          >
            {group.title}
          </Typography>
        )}

        <Tooltip title={isRepo ? 'Hide panel' : 'Hide group'}>
          <IconButton
            className="group-action"
            size="small"
            onClick={onHideGroup}
            sx={{ color: 'text.disabled', p: 0.25 }}
          >
            <VisibilityOffIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Notes — divider between each item */}
      {group.notes.length > 0 && (
        <Stack
          sx={{ px: 1, pt: 0.5, maxHeight: '50vh', overflowY: 'auto' }}
          divider={<Divider sx={{ opacity: 0.5 }} />}
        >
          {[...group.notes]
            .sort((a, b) => {
              const done = (n: NoteItem) =>
                n.type === 'todo' &&
                (n.items?.length ?? 0) > 0 &&
                n.items!.every(i => i.done)
              return Number(done(a)) - Number(done(b))
            })
            .map(note =>
              note.type === 'todo' ? (
                <TodoNoteCard
                  key={note.id}
                  note={note}
                  groupId={group.id}
                  onDelete={() => onDeleteNote(note.id)}
                  onTodoChange={onTodoChange}
                />
              ) : (
                <NoteCard
                  key={note.id}
                  note={note}
                  groupId={group.id}
                  onUpdate={content => onUpdateNote(note.id, content)}
                  onDelete={() => onDeleteNote(note.id)}
                  onReload={onTodoChange}
                />
              ),
            )}
        </Stack>
      )}

      {/* Add-note form sits outside the divider stack */}
      {addingNote && (
        <Box sx={{ px: 1.75, pt: 0.5, pb: 0.5 }}>
          <AddNoteForm
            onCommit={content => {
              onAddNote(content)
              setAddingNote(false)
            }}
            onCancel={() => setAddingNote(false)}
          />
        </Box>
      )}

      {/* Footer: add buttons */}
      <Stack
        direction="row"
        spacing={0.5}
        sx={{
          px: 1.5,
          pb: 1,
          pt: group.notes.length === 0 && !addingNote ? 0 : 0.25,
        }}
      >
        <Typography
          variant="caption"
          color="text.disabled"
          onClick={() => {
            setAddingNote(true)
          }}
          sx={{ cursor: 'pointer', '&:hover': { color: 'text.secondary' } }}
        >
          + Note
        </Typography>
        <Typography
          variant="caption"
          color="text.disabled"
          sx={{ userSelect: 'none' }}
        >
          ·
        </Typography>
        <Typography
          variant="caption"
          color="text.disabled"
          onClick={() => {
            onAddTodoNote()
            setAddingNote(false)
          }}
          sx={{ cursor: 'pointer', '&:hover': { color: 'text.secondary' } }}
        >
          + Todo
        </Typography>
      </Stack>
    </Box>
  )
}
