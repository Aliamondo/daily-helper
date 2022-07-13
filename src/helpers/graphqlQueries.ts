const UserNode = `login avatarUrl`

const LastCommitChecksNode = `
baseRef {
  branchProtectionRule {
    requiredStatusCheckContexts
  }
}
lastCommit: commits(last: 1) {
  nodes {
    commit {
      checkSuites(last: 10) {
        nodes {
          checkRuns(last: 100) {
            nodes {
              id
              name
              status
              conclusion
              permalink
              startedAt
              completedAt
            }
          }
          app {
            slug
            logoUrl
            logoBackgroundColor
          }
        }
      }
      status {
        contexts {
          id
          context
          description
          state
          createdAt
          creator {
            login
          }
          avatarUrl
          targetUrl
        }
      }
      statusCheckRollup {
        state
        contexts(last: 100) {
          nodes {
            ... on CheckRun {
              id
            }
            ... on StatusContext {
              id
            }
          }
        }
      }
    }
  }
}`

const PullRequestNode = `
... on PullRequest {
  title
  permalink
  number
  createdAt
  state
  id
  isDraft
  reviewDecision
  author {
    ${UserNode}
  }
  repository {
    name
    url
    defaultBranchRef {
      name
    }
  }
  baseRef {
    name
    branchProtectionRule {
      requiredStatusCheckContexts
    }
  }
  comments {
    totalCount
  }
  reviews(last: 100) {
    nodes {
      body
      state
      author {
        ${UserNode}
      }
      comments {
        totalCount
      }
    }
  }
  assignees(last: 100) {
    nodes {
      ${UserNode}
    }
  }
  reviewRequests(last: 100) {
    nodes {
      requestedReviewer {
        ... on Team {
          avatarUrl
          name
        }
        ... on User {
          ${UserNode}
        }
      }
    }
  }
  commits(last: 100) {
    nodes {
      ... on PullRequestCommit {
        commit {
          author {
            user {
              ${UserNode}
            }
          }
          committer {
            user {
              ${UserNode}
            }
          }
        }
      }
    }
  }
  ${LastCommitChecksNode}
  labels(first: 100) {
    nodes {
      id
      color
      name
      description
    }
  }
}`

type GetAdjacentPageQuery = {
  pageSize: number
  pageCursor: string
}
function getNextPageQuery({
  pageSize,
  pageCursor: endCursor,
}: GetAdjacentPageQuery) {
  return `first:${pageSize} after:"${endCursor}"`
}
function getPreviousPageQuery({
  pageSize,
  pageCursor: startCursor,
}: GetAdjacentPageQuery) {
  return `last:${pageSize} before:"${startCursor}"`
}

function getOrganizationsQuery() {
  return `{
    viewer {
      organizations(first: 100) {
        nodes {
          name
          login
          avatarUrl
        }
      }
    }
  }`
}

type GetTeamUsersProps = {
  orgName: string
  teamName: string
}
function getTeamUsersQuery({ orgName, teamName }: GetTeamUsersProps) {
  return `{
    organization(login: "${orgName}"){
      teams(query: "${teamName}",first: 1){
        nodes{
          members(first: 100){
            nodes{
              ${UserNode}
            }
          }
        }
      }
    }
  }`
}

type GetTeamRepositoriesProps = GetTeamUsersProps & {
  pagination: string
}
function getTeamRepositoriesQuery({
  orgName,
  teamName,
  pagination,
}: GetTeamRepositoriesProps) {
  return `{
    organization(login: "${orgName}") {
      teams(query: "${teamName}", first: 1) {
        nodes {
          repositories(
            ${pagination}
            orderBy: {field: NAME, direction: ASC},
            ) {
            edges {
              permission
              node {
                name
                nameWithOwner
              }
            }
            totalCount
            pageInfo {
              startCursor
              endCursor
              hasNextPage
              hasPreviousPage
            }
          }
        }
      }
    }
  }`
}

type GetPullRequestsByUserProps = {
  orgName: string
  author: string
}
function getPullRequestsByUserQuery({
  orgName,
  author,
}: GetPullRequestsByUserProps) {
  return `{
    search(
      query: "is:open org:${orgName} type:pr author:${author}"
      first: 100
      type: ISSUE
    ) {
        nodes {
          ${PullRequestNode}
        }
      }
    }`
}

type GetPullRequestsByRepositoriesQueryProps = {
  repositories: string[]
}
function getPullRequestsByRepositoriesQuery({
  repositories,
}: GetPullRequestsByRepositoriesQueryProps) {
  return `{
    search(
      query: "is:open type:pr ${repositories
        .map(name => `repo:${name}`)
        .join(' ')}"
      first: 100
      type: ISSUE
    ) {
        nodes {
          ${PullRequestNode}
        }
      }
    }`
}

type GetCommitChecksProps = {
  orgName: string
  repoName: string
  prNumber: number
}
function getCommitChecksQuery({
  orgName,
  repoName,
  prNumber,
}: GetCommitChecksProps) {
  return `{
    organization(login: "${orgName}"){
      repository(name: "${repoName}") {
        pullRequest(number: ${prNumber}) {
          ${LastCommitChecksNode}
        }
      }
    }
  }`
}

export {
  getOrganizationsQuery,
  getTeamUsersQuery,
  getTeamRepositoriesQuery,
  getPullRequestsByUserQuery,
  getPullRequestsByRepositoriesQuery,
  getCommitChecksQuery,
}
export { getNextPageQuery, getPreviousPageQuery }
