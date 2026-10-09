import { beforeEach, describe, expect, it, vi } from 'vitest'
import { dataFetcher } from './dataFetcher'
import { settingsHandler } from './settingsHandler'

vi.mock('./dataFetcher', () => ({ dataFetcher: { setToken: vi.fn() } }))

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

describe('settingsHandler', () => {
  it('returns defaults when nothing is saved', () => {
    expect(settingsHandler.load()).toEqual({
      githubToken: '',
      orgName: null,
      teamNames: [],
      teams: {},
    })
    expect(settingsHandler.loadView()).toBe('list')
    expect(settingsHandler.loadFilters().botLogins).toContain('dependabot')
  })

  it('merges teams on partial save instead of replacing them', () => {
    settingsHandler.partialSave({ teams: { a: { repositories: ['x'] } } })
    settingsHandler.partialSave({ teams: { b: { repositories: ['y'] } } })
    expect(Object.keys(settingsHandler.load().teams)).toEqual(['a', 'b'])
  })

  it('updates the fetcher token only when it changes', () => {
    settingsHandler.partialSave({ githubToken: 'abc' })
    settingsHandler.partialSave({ githubToken: 'abc' })
    expect(dataFetcher.setToken).toHaveBeenCalledTimes(1)
    expect(dataFetcher.setToken).toHaveBeenCalledWith('abc')
  })

  it('keeps the fetcher token when a save does not include it', () => {
    settingsHandler.partialSave({ githubToken: 'abc' })
    settingsHandler.partialSave({ orgName: 'org' })
    expect(dataFetcher.setToken).toHaveBeenCalledTimes(1)
    expect(settingsHandler.loadGithubToken()).toBe('abc')
  })

  it('adds and removes aliases', () => {
    settingsHandler.saveAlias('jdoe', 'Jane')
    expect(settingsHandler.loadAliases()).toEqual({ jdoe: 'Jane' })
    settingsHandler.saveAlias('jdoe', null)
    expect(settingsHandler.loadAliases()).toEqual({})
  })

  it('clears the fetcher token when the token is removed', () => {
    settingsHandler.partialSave({ githubToken: 'abc' })
    settingsHandler.partialSave({ githubToken: '' })
    expect(dataFetcher.setToken).toHaveBeenLastCalledWith('')
  })

  it('falls back to defaults for missing fields', () => {
    localStorage.setItem('settings', JSON.stringify({ orgName: '', teams: {} }))
    expect(settingsHandler.loadOrgName()).toBeNull()
    expect(settingsHandler.loadTeamNames()).toEqual([])
    expect(settingsHandler.loadTeam('missing')).toBeUndefined()
    expect(settingsHandler.loadPipelineStatus()).toBe(false)
    expect(settingsHandler.loadColorMode()).toBeNull()
    expect(settingsHandler.loadSort()).toBeUndefined()
  })

  it('reads saved values', () => {
    const team = { repositories: ['repo'], members: ['alice'] }
    settingsHandler.saveAll({
      githubToken: 'abc',
      orgName: 'org',
      teamNames: ['team'],
      teams: { team },
      loadPipelineStatus: true,
    })
    expect(settingsHandler.loadGithubToken()).toBe('abc')
    expect(settingsHandler.loadOrgName()).toBe('org')
    expect(settingsHandler.loadTeamNames()).toEqual(['team'])
    expect(settingsHandler.loadTeam('team')).toEqual(team)
    expect(settingsHandler.loadPipelineStatus()).toBe(true)
  })

  it('saves view, color mode and sort without touching other settings', () => {
    const sort = {
      field: 'repo',
      dirs: { date: 'desc', repo: 'asc', state: 'asc', author: 'asc' },
    } as const
    settingsHandler.partialSave({ orgName: 'org' })
    settingsHandler.saveView('kanban')
    settingsHandler.saveColorMode('dark')
    settingsHandler.saveSort(sort)

    expect(settingsHandler.loadView()).toBe('kanban')
    expect(settingsHandler.loadColorMode()).toBe('dark')
    expect(settingsHandler.loadSort()).toEqual(sort)
    expect(settingsHandler.loadOrgName()).toBe('org')
  })
})
