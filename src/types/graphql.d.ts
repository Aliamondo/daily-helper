type GraphQL_UserResponse = {
  organization: {
    teams: {
      nodes: {
        members: {
          nodes: GraphQL_User[]
        }
      }[]
    }
  }
}

type GraphQL_User = {
  login: string
  avatarUrl: string
}

type GraphQL_PullRequest = {
  title: string
  permalink: string
  number: number
  createdAt: string
  reviewDecision: 'REVIEW_REQUIRED' | 'APPROVED' | 'CHANGES_REQUESTED'
  state: 'OPEN' | 'MERGED' | 'CLOSED'
  id: string
  isDraft: boolean
  author: GraphQL_User
  repository: GraphQL_Repository
  baseRef: GraphQL_BaseRef
  comments: {
    totalCount: number
  }
  reviews: {
    nodes: GraphQL_Review[]
  }
  assignees: {
    nodes: GraphQL_User[]
  }
  reviewRequests: {
    nodes: GraphQL_ReviewRequest[]
  }
  commits: {
    nodes: GraphQL_Commit[]
  }
  lastCommit: {
    nodes: {
      commit: GraphQL_LastCommitWithChecks
    }[]
  }
  labels: {
    nodes: GraphQL_Label[]
  }
}

type GraphQL_PullRequestsResponse = {
  search: {
    nodes: GraphQL_PullRequest[]
  }
}

type GraphQL_Repository = {
  name: string
  url: string
  defaultBranchRef: {
    name: string
  }
}

type GraphQL_Review = {
  body: string
  state:
    | 'APPROVED'
    | 'CHANGES_REQUESTED'
    | 'COMMENTED'
    | 'PENDING'
    | 'DISMISSED'
  author: GraphQL_User
  comments: {
    totalCount: number
  }
}

type GraphQL_Label = {
  id: string
  color: string
  name: string
  description: string
}

type GraphQL_Team = {
  name: string
  avatarUrl: string
}

type GraphQL_BaseRef = {
  name: string
  branchProtectionRule: {
    requiredStatusCheckContexts: string[] | null
  }
}

type GraphQL_ReviewRequest = {
  requestedReviewer: GraphQL_User | GraphQL_Team
}

type GraphQL_Commit = {
  commit: {
    author: {
      user: GraphQL_User | null
    }
    committer: {
      user: GraphQL_User | null
    }
  }
}

type GraphQL_LastCommitWithChecks = {
  checkSuites: {
    nodes: GraphQL_CheckSuite[]
  }
  status: GraphQL_CommitStatus | null
  statusCheckRollup: {
    state: GraphQL_CommitStatusContext['state']
    contexts: {
      nodes: {
        id: string
      }[] // Combined CheckRun and StatusContext
    }
  } | null
}

type GraphQL_CheckSuite = {
  checkRuns: {
    nodes: GraphQL_CommitCheckRun[]
  }
  app: GraphQL_CheckSuiteApp
}

type GraphQL_CommitCheckRun = {
  id: string
  name: string
  status:
    | 'QUEUED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'WAITING'
    | 'PENDING'
    | 'REQUESTED'
  conclusion: 'SUCCESS' | 'FAILURE' | 'SKIPPED' | 'CANCELLED' | 'NEUTRAL' | null // there are more
  permalink: string
  startedAt: string | null
  completedAt: string | null
}

type GraphQL_CheckSuiteApp = {
  slug: string
  logoUrl: string
  logoBackgroundColor: string
}

type GraphQL_CommitStatus = {
  contexts: GraphQL_CommitStatusContext[]
}

type GraphQL_CommitStatusContext = {
  id: string
  context: string
  description: string
  state: 'SUCCESS' | 'FAILURE' | 'EXPECTED' | 'ERROR' | 'PENDING'
  createdAt: string
  creator: {
    login: string
  }
  avatarUrl: string
  targetUrl: string
}

type GraphQL_Organization = GraphQL_User & {
  name: string
}

type GraphQL_OrganizationsResponse = {
  viewer: {
    organizations: {
      nodes: GraphQL_Organization[]
    }
  }
}

type GraphQL_TeamsResponse = {
  viewer: {
    organization: {
      teams: {
        nodes: (GraphQL_Team & { description: string | null })[]
      }
    }
  }
}

type GraphQL_CommitChecksPerPullRequestResponse = {
  organization: {
    repository: {
      pullRequest: {
        baseRef: Pick<GraphQL_BaseRef, 'branchProtectionRule'>
        lastCommit: {
          nodes: {
            commit: GraphQL_LastCommitWithChecks
          }[]
        }
      }
    }
  }
}

type GraphQL_TeamRepositoryResponse = {
  organization: {
    teams: {
      nodes: {
        repositories: {
          edges: GraphQL_TeamRepository[]
          totalCount: number
          pageInfo: {
            startCursor: string
            endCursor: string
            hasNextPage: boolean
            hasPreviousPage: boolean
          }
        }
      }[]
    }
  }
}

type GraphQL_TeamRepository = {
  permission: 'ADMIN' | 'MAINTAIN' | 'WRITE' | 'TRIAGE' | 'READ'
  node: {
    name: string
    nameWithOwner: string
  }
}
