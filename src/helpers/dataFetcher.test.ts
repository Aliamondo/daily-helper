import { beforeEach, describe, expect, it, vi } from 'vitest'

type Respond = (query: string, signal?: AbortSignal) => Promise<unknown>

const api = vi.hoisted(() => ({
  requests: [] as {
    query: string
    signal?: AbortSignal
    authorization: string
  }[],
  respond: (() => Promise.resolve({})) as Respond,
  team: undefined as Settings_Team | undefined,
  includeChecks: false,
}))

vi.mock('@octokit/graphql', () => ({
  graphql: {
    defaults: (options: any) => (query: string, parameters?: any) => {
      const signal: AbortSignal | undefined = parameters?.request?.signal
      api.requests.push({
        query,
        signal,
        authorization: options.headers.authorization,
      })
      return api.respond(query, signal)
    },
  },
}))

vi.mock('./settingsHandler', () => ({
  settingsHandler: {
    loadGithubToken: () => 'token',
    loadTeam: () => api.team,
    loadPipelineStatus: () => api.includeChecks,
  },
}))

const { dataFetcher } = await import('./dataFetcher')

const user = (login: string, name: string | null = null): GraphQL_User => ({
  login,
  name,
  avatarUrl: '',
})
const alice = user('alice', 'Alice')

const rawPr = (overrides: Partial<GraphQL_PullRequest>): GraphQL_PullRequest =>
  ({
    id: 'PR_1',
    title: 'Add feature',
    permalink: 'https://github.com/org/repo/pull/1',
    number: 1,
    createdAt: '2026-01-01T00:00:00Z',
    reviewDecision: null,
    state: 'OPEN',
    isDraft: false,
    additions: 1,
    deletions: 1,
    changedFiles: 1,
    mergeable: 'MERGEABLE',
    mergeStateStatus: 'CLEAN',
    reviewThreads: { nodes: [] },
    headCommit: { nodes: [] },
    autoMergeRequest: null,
    author: alice,
    repository: { name: 'repo', url: '', defaultBranchRef: { name: 'main' } },
    baseRef: { name: 'main', branchProtectionRule: null },
    comments: { totalCount: 0 },
    reviews: { nodes: [] },
    assignees: { nodes: [] },
    reviewRequests: { nodes: [] },
    commits: { nodes: [] },
    labels: { nodes: [] },
    ...overrides,
  }) as unknown as GraphQL_PullRequest

const search = (...nodes: GraphQL_PullRequest[]) =>
  Promise.resolve({ search: { nodes } })

const fetchPullRequests = (handleInvalidTokenError = vi.fn()) =>
  dataFetcher.fetchPullRequests({
    orgName: 'org',
    teamName: 'team',
    setProgress: vi.fn(),
    handleInvalidTokenError,
  })

beforeEach(() => {
  api.requests.length = 0
  api.team = { members: ['alice'], repositories: [] }
  api.includeChecks = false
})

describe('fetchPullRequests', () => {
  it('cancels the remaining queries once one fails', async () => {
    api.team = { members: ['alice', 'bob'], repositories: ['repo'] }
    api.respond = (_, signal) => {
      if (api.requests.length === 1) {
        return Promise.reject(
          Object.assign(new Error('HTTP 422'), { status: 422, response: {} }),
        )
      }
      // Hang until cancelled, like a slow search
      return new Promise((_, reject) =>
        signal!.addEventListener('abort', () => reject(signal!.reason)),
      )
    }

    await expect(fetchPullRequests()).rejects.toThrow('HTTP 422')

    // alice, bob, the team repository and the team review requests
    expect(api.requests).toHaveLength(4)
    expect(api.requests.every(r => r.signal!.aborted)).toBe(true)
  })

  it('reports an invalid token when loading the team fails with 401', async () => {
    api.team = undefined
    api.respond = () =>
      Promise.reject(
        Object.assign(new Error('Bad'), { response: { status: 401 } }),
      )
    const handleInvalidTokenError = vi.fn()

    expect(await fetchPullRequests(handleInvalidTokenError)).toEqual([])
    expect(handleInvalidTokenError).toHaveBeenCalled()
  })

  it('passes on other errors when loading the team', async () => {
    api.team = undefined
    api.respond = () =>
      Promise.reject(Object.assign(new Error('Boom'), { status: 422 }))

    await expect(fetchPullRequests()).rejects.toThrow('Boom')
  })

  it('returns nothing for a team without members', async () => {
    api.team = undefined
    api.respond = () =>
      Promise.resolve({
        organization: { teams: { nodes: [{ members: { nodes: [] } }] } },
      })

    expect(await fetchPullRequests()).toEqual([])
    expect(api.requests).toHaveLength(1)
  })

  it('loads the team members when none are saved', async () => {
    api.team = { repositories: ['org/repo'] }
    api.respond = query =>
      query.includes('members')
        ? Promise.resolve({
            organization: {
              teams: { nodes: [{ members: { nodes: [user('bob')] } }] },
            },
          })
        : search()

    await fetchPullRequests()

    expect(api.requests.map(r => r.query)).toEqual([
      expect.stringContaining('members'),
      expect.stringContaining('author:bob'),
      expect.stringContaining('repo:org/repo'),
      expect.stringContaining('team-review-requested:org/team'),
    ])
  })

  it('includes pipeline status when enabled', async () => {
    api.includeChecks = true
    const run = (
      id: string,
      status: GraphQL_CommitCheckRun['status'],
      conclusion: GraphQL_CommitCheckRun['conclusion'] = null,
    ): GraphQL_CommitCheckRun => ({
      id,
      name: id,
      status,
      conclusion,
      permalink: '',
      startedAt: null,
      completedAt: null,
    })
    const context = (
      id: string,
      state: GraphQL_CommitStatusContext['state'],
    ): GraphQL_CommitStatusContext => ({
      id,
      context: id,
      description: '',
      state,
      createdAt: '2026-01-01T00:00:00Z',
      creator: { login: 'ci' },
      avatarUrl: '',
      targetUrl: '',
    })
    const commit: GraphQL_LastCommitWithChecks = {
      checkSuites: {
        nodes: [
          {
            app: { slug: 'ci', logoUrl: '', logoBackgroundColor: '' },
            checkRuns: {
              nodes: [
                run('running', 'IN_PROGRESS'),
                run('failed', 'COMPLETED', 'FAILURE'),
                run('waiting', 'WAITING'),
              ],
            },
          },
        ],
      },
      status: {
        contexts: [
          context('errored', 'ERROR'),
          context('passed', 'SUCCESS'),
          context('pending', 'PENDING'),
        ],
      },
      statusCheckRollup: null,
    }
    api.respond = () => search(rawPr({ lastCommit: { nodes: [{ commit }] } }))

    const [pr] = await fetchPullRequests()

    expect(pr.lastCommitChecks!.result).toBeNull()
    expect(
      pr.lastCommitChecks!.commitChecks.map(c => [
        c.name,
        c.result,
        c.description,
      ]),
    ).toEqual([
      ['running', 'IN_PROGRESS', 'In progress'],
      // No timestamps, so no duration to show
      ['failed', 'FAILURE', 'Completed'],
      ['waiting', 'PENDING', 'Waiting'],
      ['errored', 'FAILURE', ''],
      ['passed', 'SUCCESS', ''],
      ['pending', 'PENDING', ''],
    ])
  })

  it('removes duplicates and puts the newest PRs first', async () => {
    const older = rawPr({ id: 'old', createdAt: '2026-01-01T00:00:00Z' })
    const newer = rawPr({ id: 'new', createdAt: '2026-02-01T00:00:00Z' })
    api.respond = query =>
      query.includes('author:alice') ? search(older) : search(older, newer)

    expect((await fetchPullRequests()).map(pr => pr.id)).toEqual(['new', 'old'])
  })

  it('maps GitHub data to the shape the board uses', async () => {
    const bob = user('bob')
    const erin = user('erin')
    const raw = rawPr({
      comments: { totalCount: 3 },
      reviews: {
        nodes: [
          {
            author: bob,
            state: 'APPROVED',
            body: 'LGTM',
            comments: { totalCount: 2 },
          },
          {
            author: bob,
            state: 'COMMENTED',
            body: '',
            comments: { totalCount: 1 },
          },
          {
            author: user('carol'),
            state: 'COMMENTED',
            body: 'nit',
            comments: { totalCount: 0 },
          },
        ],
      },
      reviewRequests: {
        nodes: [
          { requestedReviewer: user('dave', 'Dave') },
          { requestedReviewer: { name: 'platform', avatarUrl: 'team.png' } },
        ],
      },
      commits: {
        nodes: [
          { commit: { author: { user: null }, committer: { user: erin } } },
        ],
      },
      reviewThreads: {
        nodes: [
          { isResolved: true },
          { isResolved: false },
          { isResolved: false },
        ],
      },
      baseRef: {
        name: 'main',
        branchProtectionRule: {
          requiredStatusCheckContexts: ['build', 'lint'],
        },
      },
      headCommit: {
        nodes: [
          {
            commit: {
              committedDate: '2026-01-03T00:00:00Z',
              statusCheckRollup: {
                contexts: { nodes: [{ name: 'build' }, { context: 'sonar' }] },
              },
            },
          },
        ],
      },
      autoMergeRequest: { enabledAt: '2026-01-02T00:00:00Z', enabledBy: alice },
    })
    api.respond = () => search(raw)

    const [pr] = await fetchPullRequests()

    // 3 PR comments + 2 review bodies + 3 review comments
    expect(pr.comments).toBe(8)
    // A comment after an approval doesn't undo it
    expect(pr.reviews.map(r => [r.reviewer.login, r.state])).toEqual([
      ['bob', 'APPROVED'],
      ['carol', 'COMMENTED'],
    ])
    expect(pr.requestedReviewers).toEqual([
      user('dave', 'Dave'),
      { login: 'platform', name: null, avatarUrl: 'team.png' },
    ])
    // Commits without a GitHub user count as the author's, who isn't listed
    expect(pr.contributors).toEqual([erin])
    expect(pr.unresolvedThreads).toBe(2)
    expect(pr.missingRequiredChecks).toEqual(['lint'])
    expect(pr.lastCommitDate).toEqual(new Date('2026-01-03T00:00:00Z'))
    expect(pr.autoMerge?.enabledAt).toEqual(new Date('2026-01-02T00:00:00Z'))
    expect(pr.lastCommitChecks).toBeNull()
  })
})

describe('refreshLastCommitChecks', () => {
  it('combines check runs, statuses and required checks', async () => {
    const run = (
      id: string,
      status: GraphQL_CommitCheckRun['status'],
      conclusion: GraphQL_CommitCheckRun['conclusion'] = null,
    ): GraphQL_CommitCheckRun => ({
      id,
      name: id,
      status,
      conclusion,
      permalink: '',
      startedAt: '2026-01-01T10:00:00Z',
      completedAt: '2026-01-01T10:02:00Z',
    })
    const commit: GraphQL_LastCommitWithChecks = {
      checkSuites: {
        nodes: [
          {
            app: {
              slug: 'github-actions',
              logoUrl: '',
              logoBackgroundColor: '',
            },
            checkRuns: {
              nodes: [
                run('build', 'COMPLETED', 'SUCCESS'),
                run('lint', 'COMPLETED', 'NEUTRAL'),
                run('e2e', 'QUEUED'),
              ],
            },
          },
        ],
      },
      status: {
        contexts: [
          {
            id: 'sonar',
            context: 'sonar',
            description: 'Waiting for analysis',
            state: 'EXPECTED',
            createdAt: '2026-01-01T10:00:00Z',
            creator: { login: 'sonar' },
            avatarUrl: '',
            targetUrl: '',
          },
        ],
      },
      statusCheckRollup: {
        state: 'PENDING',
        contexts: {
          nodes: [
            { id: 'sonar' },
            { id: 'e2e' },
            { id: 'build' },
            { id: 'lint' },
          ],
        },
      },
    }
    api.respond = () =>
      Promise.resolve({
        organization: {
          repository: {
            pullRequest: {
              baseRef: {
                branchProtectionRule: {
                  requiredStatusCheckContexts: ['build', 'deploy'],
                },
              },
              lastCommit: { nodes: [{ commit }] },
            },
          },
        },
      })

    const checks = await dataFetcher.refreshLastCommitChecks({
      orgName: 'org',
      repoName: 'repo',
      prNumber: 1,
    })

    expect(checks!.result).toBe('PENDING')
    // GitHub's order, with required checks that never reported first
    expect(
      checks!.commitChecks.map(c => [
        c.name,
        c.result,
        c.required,
        c.description,
      ]),
    ).toEqual([
      ['deploy', 'PENDING', true, ''],
      ['sonar', 'IN_PROGRESS', false, 'Waiting for analysis'],
      ['e2e', 'PENDING', false, 'Queued'],
      ['build', 'SUCCESS', true, 'Completed in 2 minutes'],
      ['lint', 'SKIPPED', false, 'Skipped'],
    ])
  })
})

describe('pagination', () => {
  const page = (logins: string[], endCursor: string, hasNextPage: boolean) => ({
    organization: {
      teams: {
        nodes: [
          {
            members: {
              nodes: logins.map(login => user(login)),
              totalCount: 3,
              pageInfo: {
                startCursor: '',
                endCursor,
                hasNextPage,
                hasPreviousPage: false,
              },
            },
          },
        ],
      },
    },
  })

  it('collects team members from every page', async () => {
    api.respond = query =>
      Promise.resolve(
        query.includes('after:""')
          ? page(['alice', 'bob'], 'c1', true)
          : page(['carol'], 'c2', false),
      )

    const logins = await dataFetcher.fetchAllTeamUserLogins('org', 'team')

    expect([...logins]).toEqual(['alice', 'bob', 'carol'])
    expect(api.requests[1].query).toContain('after:"c1"')
  })

  it('collects team repositories from every page', async () => {
    const repoPage = (
      names: string[],
      endCursor: string,
      hasNextPage: boolean,
    ) => ({
      organization: {
        teams: {
          nodes: [
            {
              repositories: {
                edges: names.map(name => ({
                  permission: 'WRITE',
                  node: { name, nameWithOwner: `org/${name}` },
                })),
                totalCount: 3,
                pageInfo: {
                  startCursor: '',
                  endCursor,
                  hasNextPage,
                  hasPreviousPage: false,
                },
              },
            },
          ],
        },
      },
    })
    api.respond = query =>
      Promise.resolve(
        query.includes('after:""')
          ? repoPage(['api', 'web'], 'c1', true)
          : repoPage(['docs'], 'c2', false),
      )

    const names = await dataFetcher.fetchAllTeamRepositoryNames('org', 'team')

    expect([...names]).toEqual(['org/api', 'org/web', 'org/docs'])
    expect(api.requests[1].query).toContain('after:"c1"')
  })

  it('asks only for the remainder on the last page', async () => {
    api.respond = () =>
      Promise.resolve({
        organization: {
          teams: {
            nodes: [
              {
                repositories: {
                  edges: [
                    {
                      permission: 'WRITE',
                      node: { name: 'repo', nameWithOwner: 'org/repo' },
                    },
                  ],
                  totalCount: 40,
                  pageInfo: {
                    startCursor: '',
                    endCursor: '',
                    hasNextPage: false,
                    hasPreviousPage: true,
                  },
                },
              },
            ],
          },
        },
      })

    const page = await dataFetcher.fetchTeamRepositories(
      'org',
      'team',
      'LAST_PAGE',
      36,
      '',
      '',
      40,
    )

    expect(api.requests[0].query).toContain('last:4 before:""')
    expect(page.teamRepositories).toEqual([
      { permission: 'WRITE', name: 'repo', nameWithOwner: 'org/repo' },
    ])
  })
})

describe('pagination', () => {
  const emptyPage = {
    organization: {
      teams: {
        nodes: [
          {
            members: {
              nodes: [],
              totalCount: 0,
              pageInfo: {
                startCursor: '',
                endCursor: '',
                hasNextPage: false,
                hasPreviousPage: false,
              },
            },
          },
        ],
      },
    },
  }

  it.each([
    ['NEXT_PAGE', 'first:10 after:"end"'],
    ['PREVIOUS_PAGE', 'last:10 before:"start"'],
    ['FIRST_PAGE', 'first:10 after:""'],
  ] as const)('builds the %s query', async (page, expected) => {
    api.respond = () => Promise.resolve(emptyPage)

    await dataFetcher.fetchTeamUsersPageable(
      'org',
      'team',
      page,
      10,
      'start',
      'end',
    )

    expect(api.requests[0].query).toContain(expected)
  })

  it('rejects an unknown page', async () => {
    await expect(
      dataFetcher.fetchTeamUsersPageable(
        'org',
        'team',
        'MIDDLE' as PageNavigation,
      ),
    ).rejects.toThrow('Unexpected pagination type requested: MIDDLE')
  })
})

describe('viewer data', () => {
  it('loads the viewer, their organizations and teams', async () => {
    api.respond = query => {
      if (query.includes('organizations'))
        return Promise.resolve({
          viewer: {
            organizations: { nodes: [{ ...user('acme'), name: 'Acme' }] },
          },
        })
      if (query.includes('teams'))
        return Promise.resolve({
          viewer: {
            organization: {
              teams: {
                nodes: [{ name: 'core', avatarUrl: '', description: null }],
              },
            },
          },
        })
      return Promise.resolve({ viewer: { login: 'me' } })
    }

    expect(await dataFetcher.fetchViewer()).toBe('me')
    expect(await dataFetcher.fetchOrganizations()).toEqual([
      { login: 'acme', name: 'Acme', avatarUrl: '' },
    ])
    expect(await dataFetcher.fetchTeams('acme')).toEqual([
      { name: 'core', avatarUrl: '', description: null },
    ])
  })
})

describe('setToken', () => {
  it('uses the new token for the next requests', async () => {
    api.respond = () => Promise.resolve({ viewer: { login: 'me' } })

    await dataFetcher.fetchViewer()
    dataFetcher.setToken('new-token')
    await dataFetcher.fetchViewer()

    expect(api.requests.map(r => r.authorization)).toEqual([
      'token token',
      'token new-token',
    ])
  })
})
