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

type GraphQL_PullRequestsPerUserResponse = {
  search: {
    nodes: {
      title: string
      permalink: string
      number: number
      createdAt: string
      state: 'OPEN' | 'MERGED' | 'CLOSED'
      id: string
      isDraft: boolean
      author: GraphQL_User
      repository: GraphQL_Repository
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
      labels: {
        nodes: GraphQL_Label[]
      }
    }[]
  }
}

type GraphQL_Repository = {
  name: string
  url: string
}

type GraphQL_Review = {
  body: string
  state: 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED'
  author: GraphQL_User
  comments: {
    totalCount: number
  }
}

type GraphQL_Label = {
  id: number
  color: string
  name: string
}

type GraphQL_Team = {
  name: string
  avatarUrl: string
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
