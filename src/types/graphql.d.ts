namespace GraphQL {
  type UserResponse = {
    organization: {
      teams: {
        nodes: {
          members: {
            nodes: User[]
          }
        }[]
      }
    }
  }

  type User = {
    login: string
    avatarUrl: string
  }

  type PullRequest = {
    title: string
    permalink: string
    number: number
    createdAt: string
    reviewDecision: 'REVIEW_REQUIRED' | 'APPROVED' | 'CHANGES_REQUESTED'
    state: 'OPEN' | 'MERGED' | 'CLOSED'
    id: string
    isDraft: boolean
    author: User
    repository: Repository
    baseRef: BaseRef
    comments: {
      totalCount: number
    }
    reviews: {
      nodes: Review[]
    }
    assignees: {
      nodes: User[]
    }
    reviewRequests: {
      nodes: ReviewRequest[]
    }
    commits: {
      nodes: Commit[]
    }
    lastCommit: {
      nodes: {
        commit: LastCommitWithChecks
      }[]
    }
    labels: {
      nodes: Label[]
    }
  }

  type PullRequestsResponse = {
    search: {
      nodes: PullRequest[]
    }
  }

  type Repository = {
    name: string
    url: string
    defaultBranchRef: {
      name: string
    }
  }

  type Review = {
    body: string
    state:
      | 'APPROVED'
      | 'CHANGES_REQUESTED'
      | 'COMMENTED'
      | 'PENDING'
      | 'DISMISSED'
    author: User
    comments: {
      totalCount: number
    }
  }

  type Label = {
    id: string
    color: string
    name: string
    description: string
  }

  type Team = {
    name: string
    avatarUrl: string
  }

  type BaseRef = {
    name: string
    branchProtectionRule: {
      requiredStatusCheckContexts: string[] | null
    }
  }

  type ReviewRequest = {
    requestedReviewer: User | Team
  }

  type Commit = {
    commit: {
      author: {
        user: User | null
      }
      committer: {
        user: User | null
      }
    }
  }

  type LastCommitWithChecks = {
    checkSuites: {
      nodes: CheckSuite[]
    }
    status: CommitStatus | null
    statusCheckRollup: {
      state: CommitStatusContext['state']
      contexts: {
        nodes: {
          id: string
        }[] // Combined CheckRun and StatusContext
      }
    } | null
  }

  type CheckSuite = {
    checkRuns: {
      nodes: CommitCheckRun[]
    }
    app: CheckSuiteApp
  }

  type CommitCheckRun = {
    id: string
    name: string
    status:
      | 'QUEUED'
      | 'IN_PROGRESS'
      | 'COMPLETED'
      | 'WAITING'
      | 'PENDING'
      | 'REQUESTED'
    conclusion:
      | 'SUCCESS'
      | 'FAILURE'
      | 'SKIPPED'
      | 'CANCELLED'
      | 'NEUTRAL'
      | null // there are more
    permalink: string
    startedAt: string | null
    completedAt: string | null
  }

  type CheckSuiteApp = {
    slug: string
    logoUrl: string
    logoBackgroundColor: string
  }

  type CommitStatus = {
    contexts: CommitStatusContext[]
  }

  type CommitStatusContext = {
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

  type CommitChecksPerPullRequestResponse = {
    organization: {
      repository: {
        pullRequest: {
          baseRef: Pick<BaseRef, 'branchProtectionRule'>
          lastCommit: {
            nodes: {
              commit: LastCommitWithChecks
            }[]
          }
        }
      }
    }
  }

  type TeamRepositoryResponse = {
    organization: {
      teams: {
        nodes: {
          repositories: {
            edges: TeamRepository[]
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

  type TeamRepository = {
    permission: 'ADMIN' | 'MAINTAIN' | 'WRITE' | 'TRIAGE' | 'READ'
    node: {
      name: string
      nameWithOwner: string
    }
  }
}
