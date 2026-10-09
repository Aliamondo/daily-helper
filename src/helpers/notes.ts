const GITHUB_PR_URL = /github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/

export function parsePrNumber(url: string): number | null {
  const m = url.match(/\/pull\/(\d+)/)
  return m ? parseInt(m[1], 10) : null
}

export function parseGitHubPrUrl(
  url: string,
): { owner: string; repo: string; number: string } | null {
  const match = url.match(GITHUB_PR_URL)
  if (!match) return null
  const [, owner, repo, number] = match
  return { owner, repo, number }
}

export function hasNoteContent(note: NoteItem | null): boolean {
  return (
    note !== null &&
    (note.content?.trim() !== '' || (note.items?.length ?? 0) > 0)
  )
}

/** A checklist with items that are all ticked off. An empty one isn't done */
export function isTodoNoteComplete(note: NoteItem): boolean {
  return (
    note.type === 'todo' &&
    (note.items?.length ?? 0) > 0 &&
    note.items!.every(i => i.done)
  )
}

/** Open items first, keeping their order */
export function sortTodoItems(items: TodoItem[]): TodoItem[] {
  return [...items].sort((a, b) => Number(a.done) - Number(b.done))
}

/** Completed checklists sink to the bottom, keeping their order */
export function sortNotesByCompletion(notes: NoteItem[]): NoteItem[] {
  return [...notes].sort(
    (a, b) => Number(isTodoNoteComplete(a)) - Number(isTodoNoteComplete(b)),
  )
}
