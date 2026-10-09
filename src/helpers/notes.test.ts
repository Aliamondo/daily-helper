import { describe, expect, it } from 'vitest'
import {
  hasNoteContent,
  isTodoNoteComplete,
  parseGitHubPrUrl,
  parsePrNumber,
  sortNotesByCompletion,
  sortTodoItems,
} from './notes'

const url = 'https://github.com/org/web-app/pull/42'

const note = (overrides: Partial<NoteItem>): NoteItem => ({
  id: 'n',
  type: 'note',
  createdAt: '',
  updatedAt: '',
  ...overrides,
})
const item = (id: string, done: boolean): TodoItem => ({ id, text: id, done })
const todo = (id: string, items: TodoItem[]) =>
  note({ id, type: 'todo', items })

describe('PR URLs', () => {
  it('reads the PR number', () => {
    expect(parsePrNumber(url)).toBe(42)
    expect(parsePrNumber('https://github.com/org/web-app')).toBeNull()
  })

  it('reads owner, repo and number from a GitHub PR URL', () => {
    expect(parseGitHubPrUrl(`${url}/files`)).toEqual({
      owner: 'org',
      repo: 'web-app',
      number: '42',
    })
    expect(
      parseGitHubPrUrl('https://github.com/org/web-app/issues/42'),
    ).toBeNull()
  })
})

describe('hasNoteContent', () => {
  it('is true for text or checklist items', () => {
    expect(hasNoteContent(note({ content: 'hi' }))).toBe(true)
    expect(hasNoteContent(todo('t', [item('a', false)]))).toBe(true)
  })

  it('is false for no note or blank text', () => {
    expect(hasNoteContent(null)).toBe(false)
    expect(hasNoteContent(note({ content: '  ', items: [] }))).toBe(false)
  })
})

describe('checklists', () => {
  it('is complete only when every item is done', () => {
    expect(isTodoNoteComplete(todo('t', [item('a', true)]))).toBe(true)
    expect(
      isTodoNoteComplete(todo('t', [item('a', true), item('b', false)])),
    ).toBe(false)
    expect(isTodoNoteComplete(todo('t', []))).toBe(false)
    expect(isTodoNoteComplete(note({ content: 'text' }))).toBe(false)
  })

  it('puts open items first, keeping their order', () => {
    const items = [item('a', true), item('b', false), item('c', false)]
    expect(sortTodoItems(items).map(i => i.id)).toEqual(['b', 'c', 'a'])
  })

  it('sinks completed checklists below the other notes', () => {
    const notes = [
      todo('done', [item('a', true)]),
      note({ id: 'text', content: 'x' }),
      todo('open', [item('b', false)]),
    ]
    expect(sortNotesByCompletion(notes).map(n => n.id)).toEqual([
      'text',
      'open',
      'done',
    ])
  })
})
