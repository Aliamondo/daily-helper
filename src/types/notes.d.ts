type TodoItem = {
  id: string
  text: string
  done: boolean
}

type NoteItem = {
  id: string
  type: 'note' | 'todo'
  /** Markdown content — present when type is 'note' */
  content?: string
  /** Checklist items — present when type is 'todo' */
  items?: TodoItem[]
  createdAt: string
  updatedAt: string
  /** Set when this note was created from a PR card */
  prRef?: {
    prId: string
    prNumber: number
    prTitle: string
    prUrl: string
  }
}

type NoteGroup = {
  id: string
  title: string
  notes: NoteItem[]
  hidden: boolean
  isRepoPanel?: true
  repositoryName?: string
}

type NotesData = {
  groups: NoteGroup[]
}
