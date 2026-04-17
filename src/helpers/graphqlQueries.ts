import { minify } from './strings'
const UserNode = `login avatarUrl ... on User { name }`

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

const LastCommitNode = `
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

function getPullRequestNode(includeChecks = false) {
  return `
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
  labels(first: 100) {
    nodes {
      id
      color
      name
      description
    }
  }
  ${includeChecks ? LastCommitNode : ''}
}`
}

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
  const query = `{
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

  return minify(query)
}

type GetTeamsQueryProps = {
  orgName: string
}
function getTeamsQuery({ orgName }: GetTeamsQueryProps) {
  const query = `{
    viewer {
      organization(login: "${orgName}"){
        teams(
          first: 100,
          orderBy: {field: NAME, direction: ASC},
        ){
          nodes{
            name
            description
            avatarUrl
          }
        }
      }
    }
  }`

  return minify(query)
}

type GetTeamUsersProps = {
  orgName: string
  teamName: string
}
function getTeamUsersQuery({ orgName, teamName }: GetTeamUsersProps) {
  const query = `{
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

  return minify(query)
}

type GetTeamUsersPageableProps = GetTeamUsersProps & {
  pagination: string
}
function getTeamUsersPageableQuery({
  orgName,
  teamName,
  pagination,
}: GetTeamUsersPageableProps) {
  const query = `{
    organization(login: "${orgName}"){
      teams(query: "${teamName}", first: 1){
        nodes{
          members(${pagination}, orderBy: {field: LOGIN, direction: ASC}){
            nodes{
              ${UserNode}
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

  return minify(query)
}

type GetTeamRepositoriesProps = GetTeamUsersProps & {
  pagination: string
}
function getTeamRepositoriesQuery({
  orgName,
  teamName,
  pagination,
}: GetTeamRepositoriesProps) {
  const query = `{
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

  return minify(query)
}

type GetPullRequestsByUserProps = {
  orgName: string
  author: string
  includeChecks?: boolean
}
function getPullRequestsByUserQuery({
  orgName,
  author,
  includeChecks = false,
}: GetPullRequestsByUserProps) {
  const query = `{
    search(
      query: "is:open org:${orgName} type:pr author:${author}"
      first: 100
      type: ISSUE
    ) {
        nodes {
          ${getPullRequestNode(includeChecks)}
        }
      }
    }`

  return minify(query)
}

type GetPullRequestsByRepositoriesQueryProps = {
  repositories: string[]
  includeChecks?: boolean
}
function getPullRequestsByRepositoriesQuery({
  repositories,
  includeChecks = false,
}: GetPullRequestsByRepositoriesQueryProps) {
  const query = `{
    search(
      query: "is:open type:pr ${repositories
        .map(name => `repo:${name}`)
        .join(' ')}"
      first: 100
      type: ISSUE
    ) {
        nodes {
          ${getPullRequestNode(includeChecks)}
        }
      }
    }`

  return minify(query)
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
  const query = `{
    organization(login: "${orgName}"){
      repository(name: "${repoName}") {
        pullRequest(number: ${prNumber}) {
          ${LastCommitChecksNode}
        }
      }
    }
  }`

  return minify(query)
}

export {
  getOrganizationsQuery,
  getTeamsQuery,
  getTeamUsersQuery,
  getTeamUsersPageableQuery,
  getTeamRepositoriesQuery,
  getPullRequestsByUserQuery,
  getPullRequestsByRepositoriesQuery,
  getCommitChecksQuery,
}
export { getNextPageQuery, getPreviousPageQuery }
