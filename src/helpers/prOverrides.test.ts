import { beforeEach, describe, expect, it } from 'vitest'
import {
  getPriorityStar,
  loadPrOverrides,
  savePrOverrides,
  setPriorityOverride,
} from './prOverrides'

beforeEach(() => localStorage.clear())

describe('loadPrOverrides', () => {
  it('reads back what was saved', () => {
    savePrOverrides({ PR_1: 'medium' })
    expect(loadPrOverrides()).toEqual({ PR_1: 'medium' })
  })

  it('falls back to no overrides on empty or corrupt storage', () => {
    expect(loadPrOverrides()).toEqual({})
    localStorage.setItem('prOverrides', '{not json')
    expect(loadPrOverrides()).toEqual({})
  })
})

describe('setPriorityOverride', () => {
  it('replaces the PR’s priority', () => {
    const medium = setPriorityOverride({}, 'PR_1', 'medium')
    expect(setPriorityOverride(medium, 'PR_1', 'low')).toEqual({ PR_1: 'low' })
  })

  it('drops the entry when going back to automatic', () => {
    const low = setPriorityOverride({ PR_2: 'high' }, 'PR_1', 'low')
    expect(setPriorityOverride(low, 'PR_1', 'auto')).toEqual({ PR_2: 'high' })
  })
})

describe('getPriorityStar', () => {
  const automaticIds = new Set(['PR_1'])

  it('follows the automatic rules without an override', () => {
    expect(getPriorityStar('PR_1', automaticIds, {})).toBe('high')
    expect(getPriorityStar('PR_2', automaticIds, {})).toBe('normal')
  })

  it('shows the picked priority over the automatic one', () => {
    expect(getPriorityStar('PR_1', automaticIds, { PR_1: 'medium' })).toBe(
      'medium',
    )
    expect(getPriorityStar('PR_2', automaticIds, { PR_2: 'high' })).toBe('high')
  })
})
