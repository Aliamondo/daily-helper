import { describe, expect, it } from 'vitest'
import { findJiraKeys, getJiraTickets } from './jiraKeys'

const find = (text: string) => findJiraKeys([text], ['CGY'])

describe('findJiraKeys', () => {
  it.each([
    'CGY-123',
    'cgy-123',
    'CGY 123',
    'CGY_123',
    'CGY/123',
    'CGY123',
    'Cgy-123',
    '[CGY-123] Fix paging',
    '(CGY-123)',
    'CGY-123: Fix paging',
    'Fix paging, CGY-123, later',
    'feature/CGY-123-add-paging',
    'cgy-123_fix',
    'feature_CGY-123',
    'https://jira.example.com/browse/CGY-123',
  ])('finds CGY-123 in %j', text => {
    expect(find(text)).toEqual(['CGY-123'])
  })

  it.each([
    'XCGY-123',
    'ABCGY-12',
    'CGY-123abc',
    'CGY-',
    'CGY/api',
    'cgy/frontend',
    'CGY-0',
    'CGY-0123',
    'ABC-123',
  ])('finds nothing in %j', text => {
    expect(find(text)).toEqual([])
  })

  it('finds several keys and drops duplicates across texts', () => {
    expect(
      findJiraKeys(['CGY-123, CGY-124 fix', 'cgy_123/CGY-125'], ['CGY']),
    ).toEqual(['CGY-123', 'CGY-124', 'CGY-125'])
  })

  it('takes the first number when more digits follow a separator', () => {
    expect(find('CGY-2024-10')).toEqual(['CGY-2024'])
  })

  it('only looks for configured projects', () => {
    expect(findJiraKeys(['CGY-1 IRON-2 ABC-3'], ['CGY', 'IRON'])).toEqual([
      'CGY-1',
      'IRON-2',
    ])
    expect(findJiraKeys(['CGY-1'], [])).toEqual([])
  })
})

describe('getJiraTickets', () => {
  it('links to the browse page without a double slash', () => {
    expect(
      getJiraTickets(['CGY-1'], {
        baseUrl: 'https://jira.example.com/',
        projectKeys: ['CGY'],
      }),
    ).toEqual([{ key: 'CGY-1', url: 'https://jira.example.com/browse/CGY-1' }])
  })

  it('returns nothing without a base URL', () => {
    expect(
      getJiraTickets(['CGY-1'], { baseUrl: ' ', projectKeys: ['CGY'] }),
    ).toEqual([])
  })
})
