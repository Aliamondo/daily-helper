import { describe, expect, it } from 'vitest'
import { getFormerMembers } from './teamMembers'

describe('getFormerMembers', () => {
  it('lists saved members who left the team', () => {
    expect(getFormerMembers(['alice', 'bob'], new Set(['alice']))).toEqual([
      {
        login: 'bob',
        name: null,
        avatarUrl: 'https://github.com/bob.png?size=48',
      },
    ])
  })

  it('flags nobody until the whole team has loaded', () => {
    expect(getFormerMembers(['alice'], null)).toEqual([])
  })
})
