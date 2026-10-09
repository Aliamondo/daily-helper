import { describe, expect, it } from 'vitest'
import {
  distributeIntoColumns,
  estimateGroupHeight,
  getColumnCount,
} from './masonry'

const group = (id: string, notes: NoteItem[] = []): NoteGroup => ({
  id,
  title: id,
  notes,
  hidden: false,
})

describe('getColumnCount', () => {
  it('fits as many columns as the width allows, at least one', () => {
    expect(getColumnCount(0, 360, 16)).toBe(1)
    expect(getColumnCount(200, 360, 16)).toBe(1)
    expect(getColumnCount(736, 360, 16)).toBe(2)
    expect(getColumnCount(1200, 360, 16)).toBe(3)
  })
})

describe('estimateGroupHeight', () => {
  it('counts a row per checklist item and two per note', () => {
    const items = ['a', 'b', 'c'].map(id => ({ id, text: id, done: false }))
    const notes: NoteItem[] = [
      { id: 't', type: 'todo', items, createdAt: '', updatedAt: '' },
      { id: 'n', type: 'note', content: 'x', createdAt: '', updatedAt: '' },
    ]
    // header 2 + checklist 1 + 3 items + note 2
    expect(estimateGroupHeight(group('g', notes))).toBe(8)
  })
})

describe('distributeIntoColumns', () => {
  it('puts each group in the shortest column', () => {
    const columns = distributeIntoColumns(
      [group('a'), group('b'), group('c')],
      2,
      { a: 100, b: 50, c: 30 },
    )
    expect(columns.map(col => col.map(g => g.id))).toEqual([['a'], ['b', 'c']])
  })
})
