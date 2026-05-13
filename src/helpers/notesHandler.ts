const NOTES_KEY = 'notes'

const defaultData = (): NotesData => ({ groups: [] })

function load(): NotesData {
  try {
    const raw = localStorage.getItem(NOTES_KEY)
    if (!raw) return defaultData()
    const parsed = JSON.parse(raw) as NotesData
    return {
      groups: (parsed.groups ?? []).map(g => ({
        ...g,
        notes: (g.notes ?? []).map(n => ({
          ...n,
          type: n.type ?? ('note' as const),
          items: n.items ?? [],
        })),
      })),
    }
  } catch {
    return defaultData()
  }
}

function saveAll(data: NotesData): void {
  localStorage.setItem(NOTES_KEY, JSON.stringify(data))
}

function makeRepoGroup(repositoryName: string): NoteGroup {
  return {
    id: `repo:${repositoryName}`,
    title: repositoryName,
    notes: [],
    hidden: false,
    isRepoPanel: true,
    repositoryName,
  }
}

function findGroup(data: NotesData, groupId: string): NoteGroup | undefined {
  return data.groups.find(g => g.id === groupId)
}

function findNote(
  data: NotesData,
  groupId: string,
  noteId: string,
): NoteItem | undefined {
  return findGroup(data, groupId)?.notes.find(n => n.id === noteId)
}

const notesHandler = {
  load,

  // ── Groups ──────────────────────────────────────────────────────────────

  ensureRepoGroup(repositoryName: string): void {
    const data = load()
    const has = data.groups.some(
      g => g.isRepoPanel && g.repositoryName === repositoryName,
    )
    if (!has) {
      data.groups.push(makeRepoGroup(repositoryName))
      saveAll(data)
    }
  },

  ensureRepoGroups(repositoryNames: string[]): void {
    const data = load()
    let changed = false
    for (const name of repositoryNames) {
      if (!data.groups.some(g => g.isRepoPanel && g.repositoryName === name)) {
        data.groups.push(makeRepoGroup(name))
        changed = true
      }
    }
    if (changed) saveAll(data)
  },

  addCustomGroup(title: string): NoteGroup {
    const data = load()
    const group: NoteGroup = {
      id: Date.now().toString(),
      title,
      notes: [],
      hidden: false,
    }
    data.groups.push(group)
    saveAll(data)
    return group
  },

  updateGroup(
    id: string,
    partial: Partial<Pick<NoteGroup, 'title' | 'hidden'>>,
  ): void {
    const data = load()
    const i = data.groups.findIndex(g => g.id === id)
    if (i === -1) return
    data.groups[i] = { ...data.groups[i], ...partial }
    saveAll(data)
  },

  hideGroup(id: string): void {
    this.updateGroup(id, { hidden: true })
  },

  deleteGroup(id: string): void {
    const data = load()
    data.groups = data.groups.filter(g => g.id !== id)
    saveAll(data)
  },

  // ── Notes ────────────────────────────────────────────────────────────────

  addNote(
    groupId: string,
    content: string,
    prRef?: NoteItem['prRef'],
  ): NoteItem | null {
    const data = load()
    const group = findGroup(data, groupId)
    if (!group) return null
    const note: NoteItem = {
      id: Date.now().toString(),
      type: 'note',
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...(prRef ? { prRef } : {}),
    }
    group.notes.push(note)
    saveAll(data)
    return note
  },

  addTodoNote(groupId: string): NoteItem | null {
    const data = load()
    const group = findGroup(data, groupId)
    if (!group) return null
    const note: NoteItem = {
      id: Date.now().toString(),
      type: 'todo',
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    group.notes.push(note)
    saveAll(data)
    return note
  },

  updateNote(groupId: string, noteId: string, content: string): void {
    const data = load()
    const note = findNote(data, groupId, noteId)
    if (!note) return
    note.content = content
    note.updatedAt = new Date().toISOString()
    saveAll(data)
  },

  setNotePrRef(
    groupId: string,
    noteId: string,
    prRef: NoteItem['prRef'],
  ): void {
    const data = load()
    const note = findNote(data, groupId, noteId)
    if (!note) return
    note.prRef = prRef
    note.updatedAt = new Date().toISOString()
    saveAll(data)
  },

  deleteNote(groupId: string, noteId: string): void {
    const data = load()
    const group = findGroup(data, groupId)
    if (!group) return
    group.notes = group.notes.filter(n => n.id !== noteId)
    saveAll(data)
  },

  // ── Todo items ────────────────────────────────────────────────────────────

  addTodoItem(groupId: string, noteId: string, text: string): void {
    const data = load()
    const note = findNote(data, groupId, noteId)
    if (!note?.items) return
    note.items.push({ id: Date.now().toString(), text, done: false })
    note.updatedAt = new Date().toISOString()
    saveAll(data)
  },

  toggleTodoItem(groupId: string, noteId: string, itemId: string): void {
    const data = load()
    const note = findNote(data, groupId, noteId)
    const item = note?.items?.find(i => i.id === itemId)
    if (!item || !note) return
    item.done = !item.done
    note.updatedAt = new Date().toISOString()
    saveAll(data)
  },

  updateTodoItemText(
    groupId: string,
    noteId: string,
    itemId: string,
    text: string,
  ): void {
    const data = load()
    const note = findNote(data, groupId, noteId)
    const item = note?.items?.find(i => i.id === itemId)
    if (!item || !note) return
    item.text = text
    note.updatedAt = new Date().toISOString()
    saveAll(data)
  },

  deleteTodoItem(groupId: string, noteId: string, itemId: string): void {
    const data = load()
    const note = findNote(data, groupId, noteId)
    if (!note?.items) return
    note.items = note.items.filter(i => i.id !== itemId)
    note.updatedAt = new Date().toISOString()
    saveAll(data)
  },

  // ── PR-note helpers ────────────────────────────────────────────────────────

  getPrNote(
    repositoryName: string,
    prId: string,
    prNumber?: number,
    prTitle?: string,
  ): NoteItem | null {
    const data = load()
    for (const group of data.groups) {
      const note = group.notes.find(
        n =>
          n.prRef?.prId === prId ||
          (prNumber !== undefined &&
            n.prRef?.prNumber === prNumber &&
            n.prRef.prUrl.includes(`/${repositoryName}/pull/`)),
      )
      if (note) {
        // Back-fill title + canonical prId when found via number-fallback
        if (
          note.prRef &&
          prTitle &&
          prNumber !== undefined &&
          (!note.prRef.prTitle || note.prRef.prId !== prId)
        ) {
          note.prRef = { prId, prNumber, prTitle, prUrl: note.prRef.prUrl }
          note.updatedAt = new Date().toISOString()
          saveAll(data)
        }
        return note
      }
    }
    return null
  },

  findNoteGroupId(noteId: string): string | undefined {
    const data = load()
    return data.groups.find(g => g.notes.some(n => n.id === noteId))?.id
  },

  savePrNote(props: {
    prId: string
    prNumber: number
    prTitle: string
    prUrl: string
    repositoryName: string
    content: string
  }): void {
    this.ensureRepoGroup(props.repositoryName)
    const data = load()
    // Find existing note by prId OR prNumber+URL across ALL groups (handles manually linked notes)
    let targetGroup: NoteGroup | undefined
    let existingIdx = -1
    for (const group of data.groups) {
      const idx = group.notes.findIndex(
        n =>
          n.prRef?.prId === props.prId ||
          (n.prRef?.prNumber === props.prNumber &&
            n.prRef.prUrl.includes(`/${props.repositoryName}/pull/`)),
      )
      if (idx !== -1) {
        targetGroup = group
        existingIdx = idx
        break
      }
    }
    if (props.content.trim() === '') {
      if (targetGroup && existingIdx !== -1)
        targetGroup.notes.splice(existingIdx, 1)
    } else if (targetGroup && existingIdx !== -1) {
      targetGroup.notes[existingIdx] = {
        ...targetGroup.notes[existingIdx],
        content: props.content,
        // Upgrade prRef to include the canonical GitHub prId if it was missing
        prRef: {
          prId: props.prId,
          prNumber: props.prNumber,
          prTitle: props.prTitle,
          prUrl: props.prUrl,
        },
        updatedAt: new Date().toISOString(),
      }
    } else {
      const group = data.groups.find(
        g => g.isRepoPanel && g.repositoryName === props.repositoryName,
      )
      if (!group) return
      group.notes.push({
        id: Date.now().toString(),
        type: 'note',
        content: props.content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        prRef: {
          prId: props.prId,
          prNumber: props.prNumber,
          prTitle: props.prTitle,
          prUrl: props.prUrl,
        },
      })
    }
    saveAll(data)
  },
}

Object.freeze(notesHandler)
export { notesHandler }
