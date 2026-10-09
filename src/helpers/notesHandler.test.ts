import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { notesHandler } from './notesHandler'

const pr = {
  prId: 'PR_1',
  prNumber: 7,
  prTitle: 'Fix login',
  prUrl: 'https://github.com/org/web-app/pull/7',
  repositoryName: 'web-app',
}

let tick = 0
beforeEach(() => {
  localStorage.clear()
  // Ids come from Date.now(), so keep them unique between calls
  vi.spyOn(Date, 'now').mockImplementation(() => ++tick)
})
afterEach(() => vi.restoreAllMocks())

const groups = () => notesHandler.load().groups

describe('notesHandler', () => {
  it('fills in fields missing from older saved data', () => {
    localStorage.setItem(
      'notes',
      JSON.stringify({ groups: [{ id: 'g', notes: [{ id: 'n' }] }] }),
    )
    expect(groups()[0].notes[0]).toMatchObject({ type: 'note', items: [] })
  })

  it('falls back to empty data on corrupt storage', () => {
    localStorage.setItem('notes', '{not json')
    expect(groups()).toEqual([])
  })

  it('creates each repo group only once', () => {
    notesHandler.ensureRepoGroup('web-app')
    notesHandler.ensureRepoGroups(['web-app', 'api'])
    expect(groups().map(g => g.id)).toEqual(['repo:web-app', 'repo:api'])
  })

  it('manages todo items', () => {
    const group = notesHandler.addCustomGroup('Mine')
    const note = notesHandler.addTodoNote(group.id)!
    notesHandler.addTodoItem(group.id, note.id, 'review PR')
    const itemId = groups()[0].notes[0].items![0].id
    notesHandler.toggleTodoItem(group.id, note.id, itemId)
    expect(groups()[0].notes[0].items).toEqual([
      { id: itemId, text: 'review PR', done: true },
    ])
    notesHandler.deleteTodoItem(group.id, note.id, itemId)
    expect(groups()[0].notes[0].items).toEqual([])
  })

  it('creates, updates and removes a PR note', () => {
    notesHandler.savePrNote({ ...pr, content: 'first' })
    expect(notesHandler.getPrNote('web-app', 'PR_1')?.content).toBe('first')

    notesHandler.savePrNote({ ...pr, content: 'second' })
    expect(groups()[0].notes).toHaveLength(1)
    expect(groups()[0].notes[0].content).toBe('second')

    notesHandler.savePrNote({ ...pr, content: '  ' })
    expect(notesHandler.getPrNote('web-app', 'PR_1')).toBeNull()
  })

  it('finds a manually linked note by number and back-fills its id', () => {
    const group = notesHandler.addCustomGroup('Mine')
    const note = notesHandler.addNote(group.id, 'linked', {
      prId: '',
      prNumber: 7,
      prTitle: '',
      prUrl: pr.prUrl,
    })!

    expect(notesHandler.getPrNote('web-app', 'PR_1', 7, 'Fix login')?.id).toBe(
      note.id,
    )
    expect(groups()[0].notes[0].prRef).toMatchObject({
      prId: 'PR_1',
      prTitle: 'Fix login',
    })
    expect(notesHandler.getPrNote('other-repo', 'PR_2', 7)).toBeNull()
  })

  it('renames, hides and deletes groups', () => {
    const keep = notesHandler.addCustomGroup('Keep')
    const drop = notesHandler.addCustomGroup('Drop')
    notesHandler.updateGroup(keep.id, { title: 'Renamed' })
    notesHandler.hideGroup(keep.id)
    notesHandler.updateGroup('missing', { title: 'Nope' })
    notesHandler.deleteGroup(drop.id)

    expect(groups()).toEqual([
      { id: keep.id, title: 'Renamed', notes: [], hidden: true },
    ])
  })

  it('ignores notes added to a missing group', () => {
    expect(notesHandler.addNote('missing', 'text')).toBeNull()
    expect(notesHandler.addTodoNote('missing')).toBeNull()
    expect(groups()).toEqual([])
  })

  it('edits, links and deletes notes', () => {
    const group = notesHandler.addCustomGroup('Mine')
    const note = notesHandler.addNote(group.id, 'draft')!
    const prRef = { prId: 'PR_1', prNumber: 7, prTitle: '', prUrl: pr.prUrl }

    notesHandler.updateNote(group.id, note.id, 'final')
    notesHandler.setNotePrRef(group.id, note.id, prRef)
    expect(groups()[0].notes[0]).toMatchObject({ content: 'final', prRef })
    expect(notesHandler.findNoteGroupId(note.id)).toBe(group.id)

    notesHandler.deleteNote(group.id, note.id)
    expect(groups()[0].notes).toEqual([])
    expect(notesHandler.findNoteGroupId(note.id)).toBeUndefined()
  })

  it('edits todo item text', () => {
    const group = notesHandler.addCustomGroup('Mine')
    const note = notesHandler.addTodoNote(group.id)!
    notesHandler.addTodoItem(group.id, note.id, 'typo')
    const itemId = groups()[0].notes[0].items![0].id

    notesHandler.updateTodoItemText(group.id, note.id, itemId, 'fixed')
    notesHandler.updateTodoItemText(group.id, note.id, 'missing', 'nope')
    expect(groups()[0].notes[0].items).toEqual([
      { id: itemId, text: 'fixed', done: false },
    ])
  })

  it('updates a PR note linked in a custom group instead of adding another', () => {
    const group = notesHandler.addCustomGroup('Mine')
    notesHandler.addNote(group.id, 'linked', {
      prId: '',
      prNumber: 7,
      prTitle: '',
      prUrl: pr.prUrl,
    })

    notesHandler.savePrNote({ ...pr, content: 'updated' })

    const [custom, repo] = groups()
    expect(custom.notes[0]).toMatchObject({
      content: 'updated',
      prRef: { prId: 'PR_1', prTitle: 'Fix login' },
    })
    expect(repo.notes).toEqual([])
  })

  it('fills in groups and notes missing from saved data', () => {
    localStorage.setItem('notes', '{}')
    expect(groups()).toEqual([])
    localStorage.setItem('notes', JSON.stringify({ groups: [{ id: 'g' }] }))
    expect(groups()[0].notes).toEqual([])
  })

  it('does not save when every repo group already exists', () => {
    notesHandler.ensureRepoGroups(['web-app'])
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
    notesHandler.ensureRepoGroups(['web-app'])
    expect(setItem).not.toHaveBeenCalled()
  })

  it('leaves data alone when the note or item does not exist', () => {
    const group = notesHandler.addCustomGroup('Mine')
    const note = notesHandler.addTodoNote(group.id)!
    const before = groups()

    notesHandler.updateNote(group.id, 'missing', 'text')
    notesHandler.setNotePrRef(group.id, 'missing', undefined)
    notesHandler.deleteNote('missing', note.id)
    notesHandler.addTodoItem(group.id, 'missing', 'text')
    notesHandler.toggleTodoItem(group.id, note.id, 'missing')
    notesHandler.deleteTodoItem(group.id, 'missing', 'item')

    expect(groups()).toEqual(before)
  })

  it('does not back-fill a PR note without a title', () => {
    const group = notesHandler.addCustomGroup('Mine')
    const prRef = { prId: '', prNumber: 7, prTitle: '', prUrl: pr.prUrl }
    notesHandler.addNote(group.id, 'linked', prRef)

    expect(notesHandler.getPrNote('web-app', 'PR_1', 7)?.prRef).toEqual(prRef)
  })

  it('does not save an empty PR note', () => {
    notesHandler.savePrNote({ ...pr, content: '' })
    expect(groups()[0].notes).toEqual([])
  })
})
